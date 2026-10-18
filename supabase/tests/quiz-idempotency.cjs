'use strict';
// PostgreSQL 16 전용 일회성 격리 검사. 외부 패키지나 운영 연결은 사용하지 않는다.
// 보상 보조 함수는 대역이다. 이 검사는 동시성·DDL·멱등성만 증명한다.
const fs = require('node:fs');
const path = require('node:path');
const cp = require('node:child_process');
const crypto = require('node:crypto');
const assert = require('node:assert/strict');
const host = process.env.PGHOST;
const database = process.env.PGDATABASE;
if (!['localhost', '127.0.0.1'].includes(host) || database !== 'moneytermi_quiz_test') {
  console.error('검사 거부: 로컬 호스트의 지정된 임시 데이터베이스만 허용합니다.');
  process.exit(1);
}
const port = process.env.PGPORT || '5432';
if (!/^\d+$/.test(port) || Number(port) < 1 || Number(port) > 65535) {
  console.error('검사 거부: 포트 설정이 올바르지 않습니다.');
  process.exit(1);
}
// 연결 문자열·서비스·호스트 주소·사용자 PGOPTIONS 우회 및 암호 자동 읽기를 차단한다.
const env = {
  PATH: process.env.PATH, LANG: 'C', LC_ALL: 'C',
  PGHOST: host, PGHOSTADDR: '127.0.0.1', PGPORT: port,
  PGDATABASE: database, PGUSER: process.env.PGUSER || 'postgres',
  PGPASSFILE: '/dev/null', PGSERVICEFILE: '/dev/null', PGCONNECT_TIMEOUT: '5',
  PGOPTIONS: '-c statement_timeout=45000 -c lock_timeout=30000 -c log_statement=none -c log_min_error_statement=panic -c log_error_verbosity=terse',
};
const args = ['-X', '-w', '-v', 'ON_ERROR_STOP=1', '-v', 'VERBOSITY=terse', '-Atq'];
const source = path.resolve(__dirname, '..');
const migrationPath = path.join(source, 'migration_quiz_answer_idempotency_v2.sql');
const rollbackPath = path.join(source, 'rollback_quiz_answer_idempotency_v2.sql');
const migration = fs.readFileSync(migrationPath, 'utf8');
const rollback = fs.readFileSync(rollbackPath, 'utf8');
const sig = 'public.submit_quiz_answer(integer,text,text,boolean,boolean)';
const once = 'public.submit_quiz_answer_once(integer,text,text,boolean,boolean,uuid)';
const q = value => "'" + value.replace(/'/g, "''") + "'";
const hash = value => crypto.createHash('sha256').update(value).digest('hex');
const pause = ms => new Promise(resolve => setTimeout(resolve, ms));
class TestFailure extends Error {}
// SQL·답안·헤더·식별자가 포함될 수 있는 원문 오류나 전체 스택은 출력하지 않는다.
function safeError(raw) {
  const cleaned = String(raw)
    .replace(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi, '[식별자 삭제]')
    .replace(/(?:request\.headers|authorization|x-guest-token)[^\r\n]*/gi, '[헤더 삭제]');
  const allowed = [
    ['permission denied', '접근 권한 거부'],
    ['statement timeout', '쿼리 제한 시간 초과'],
    ['lock timeout', '행 잠금 제한 시간 초과'],
    ['connection refused', '로컬 서버 연결 거부'],
    ['could not connect', '로컬 서버 연결 실패'],
    ['changed since review', '검토 원본 변경 감지'],
    ['different payload', '동일 요청 식별자의 본문 변경 감지'],
  ];
  return allowed.find(([fragment]) => cleaned.includes(fragment))?.[1] || '세부 정보 비공개: 검사 단계 및 서버 상태를 확인하세요.';
}
function command(input) {
  return new Promise(resolve => {
    const child = cp.spawn('psql', args, { env, stdio: ['pipe', 'pipe', 'pipe'] });
    let out = '', err = '', settled = false;
    const timer = setTimeout(() => child.kill('SIGKILL'), 90000);
    child.stdout.on('data', data => { out += data; });
    child.stderr.on('data', data => { err += data; });
    child.stdin.on('error', () => {});
    child.on('error', () => { err = '로컬 psql 실행 실패'; });
    child.on('close', code => {
      clearTimeout(timer);
      if (!settled) { settled = true; resolve({ code, out, err }); }
    });
    child.stdin.end(input);
  });
}
async function sql(input, allowFailure = false) {
  const result = await command(input);
  if (result.code !== 0 && !allowFailure) throw new TestFailure(safeError(result.err));
  return result;
}
async function query(input) { return JSON.parse((await sql(input)).out.trim()); }
function check(condition, label) { if (!condition) throw new TestFailure(label); }
function equal(actual, expected, label) {
  try { assert.deepEqual(actual, expected); } catch { throw new TestFailure(label); }
}
async function rejected(label, input, fragment) {
  const result = await sql(input, true);
  check(result.code !== 0 && result.err.includes(fragment), label + ' 실패');
  console.log(label + ': 통과');
}
async function fnDef(signature) {
  return (await sql(`SELECT pg_get_functiondef(${q(signature)}::regprocedure);`)).out.trim();
}
async function stats(id) {
  return query(`SELECT json_build_object('points',points,'xp',xp,'combo',quiz_combo,
    'daily_count',COALESCE((SELECT count FROM public.quiz_rewards_daily WHERE user_id=p.id),0),
    'm3',COALESCE((SELECT current FROM public.daily_missions WHERE user_id=p.id AND mission_id='m3'),0),
    'm4',COALESCE((SELECT current FROM public.daily_missions WHERE user_id=p.id AND mission_id='m4'),0),
    'receipts',(SELECT count(*) FROM public.quiz_answer_receipts_v2 WHERE user_id=p.id))
    FROM public.profiles p WHERE id=${q(id)};`);
}
function rpc(token, id, answer = 'fixture-answer', role = 'anon', barrier = '') {
  check(['anon', 'authenticated'].includes(role), '허용되지 않은 검사 역할');
  return `BEGIN; SET LOCAL ROLE ${role};
    SELECT set_config('request.headers',${q(JSON.stringify({ 'x-guest-token': token }))},true);
    ${barrier ? `SET LOCAL application_name=${q(barrier)}; SELECT pg_advisory_xact_lock_shared(928147);` : ''}
    SELECT public.submit_quiz_answer_once(1,${q(answer)},'mc',false,false,${q(id)}::uuid); COMMIT;`;
}
// 모든 독립 psql 세션이 서버의 같은 장벽에 도착한 뒤 해제한다.
async function parallel(label, token, ids, role) {
  const coordinator = cp.spawn('psql', args, { env, stdio: ['pipe', 'pipe', 'pipe'] });
  let output = '', error = '';
  coordinator.stdout.on('data', data => { output += data; });
  coordinator.stderr.on('data', data => { error += data; });
  coordinator.stdin.on('error', () => {});
  coordinator.on('error', () => { error = '로컬 psql 실행 실패'; });
  const finished = new Promise(resolve => coordinator.on('close', code => resolve({ code })));
  const timer = setTimeout(() => coordinator.kill('SIGKILL'), 90000);
  let calls = [];
  try {
    coordinator.stdin.write("BEGIN; SELECT pg_advisory_xact_lock(928147); SELECT 'READY';\n");
    for (let i = 0; !output.includes('READY'); i++) {
      check(i < 100 && !error, '동시성 장벽 시작 실패');
      await pause(50);
    }
    calls = ids.map(id => sql(rpc(token, id, 'fixture-answer', role, label), true));
    let waiting = 0;
    for (let i = 0; i < 200; i++) {
      waiting = Number((await sql(`SELECT count(*) FROM pg_stat_activity
        WHERE application_name=${q(label)} AND wait_event='advisory';`)).out.trim());
      if (waiting === ids.length) break;
      await pause(50);
    }
    check(waiting === ids.length, '동시성 장벽의 실제 서버 세션 수 불일치');
    coordinator.stdin.end('COMMIT;\n');
    const results = await Promise.all(calls);
    check(results.every(result => result.code === 0), '동시 요청 중 실패 발생');
    check((await finished).code === 0, '동시성 장벽 해제 실패');
    console.log(`실제 동시 서버 세션 ${waiting}개 확인`);
    return results.map(result => JSON.parse(result.out.trim().split('\n').at(-1)));
  } finally {
    if (!coordinator.stdin.destroyed && !coordinator.stdin.writableEnded) coordinator.stdin.end('ROLLBACK;\n');
    await finished;
    await Promise.all(calls);
    clearTimeout(timer);
  }
}
let stage = '격리 연결 확인';
(async () => {
  try {
    const connection = await query(`SELECT json_build_object('db',current_database(),
      'host',host(inet_server_addr()),'version',current_setting('server_version_num')::integer,
      'superuser',(SELECT rolsuper FROM pg_roles WHERE rolname=current_user),
      'relations',(SELECT count(*) FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace
        WHERE n.nspname='public' AND c.relkind IN ('r','p','f','v','m','S')));`);
    // 클라이언트 주소는 위에서 127.0.0.1로 강제했다. 컨테이너 내부 주소는 브리지 주소일 수 있다.
    check(connection.db === database, '격리 데이터베이스 대상 불일치');
    check(connection.version >= 160000 && connection.version < 170000, 'PostgreSQL 16이 필요합니다.');
    check(connection.superuser, '독립 서비스의 검사 관리자 권한이 필요합니다.');
    check(connection.relations === 0, '검사 거부: public에 기존 테이블 또는 관계가 있습니다.');
    stage = '최소 대역 및 원본 함수 생성';
    const originals = [...rollback.matchAll(/CREATE OR REPLACE FUNCTION public\.submit_quiz_answer\([\s\S]*?END; \$function\$;/g)];
    check(originals.length === 1, '되돌림 파일의 원본 함수 추출 실패');
    const original = originals[0][0];
    // 검토된 current_profile_id 원본을 그대로 보관한다. 외부 임시 파일에는 의존하지 않는다.
    const profile = `CREATE OR REPLACE FUNCTION public.current_profile_id()
 RETURNS uuid
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
AS $function$
DECLARE
  v_id UUID;
BEGIN
  SELECT id INTO v_id FROM public.profiles
  WHERE auth_id = auth.uid()
     OR guest_token = (current_setting('request.headers', true)::json->>'x-guest-token')::uuid
  LIMIT 1;
  RETURN v_id;
END;
$function$;`;
    await sql(`CREATE ROLE anon NOLOGIN; CREATE ROLE authenticated NOLOGIN; CREATE ROLE service_role NOLOGIN;
      CREATE SCHEMA auth;
      CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql STABLE AS 'SELECT NULL::uuid';
      CREATE TABLE public.profiles(id uuid PRIMARY KEY,guest_token uuid UNIQUE,auth_id uuid,nickname text,
        points integer NOT NULL DEFAULT 0,xp integer NOT NULL DEFAULT 0,quiz_combo integer NOT NULL DEFAULT 0);
      CREATE TABLE public.words(id integer PRIMARY KEY,word text NOT NULL);
      INSERT INTO public.words VALUES(1,'fixture-answer');
      CREATE TABLE public.quiz_rewards_daily(user_id uuid REFERENCES public.profiles(id),date date,
        count integer NOT NULL,PRIMARY KEY(user_id,date));
      CREATE TABLE public.daily_missions(user_id uuid REFERENCES public.profiles(id),mission_id text,date date,
        slot integer,current integer NOT NULL,PRIMARY KEY(user_id,mission_id,date,slot));
      CREATE FUNCTION public.mission_date() RETURNS date LANGUAGE sql STABLE AS 'SELECT DATE ''2026-10-16''';
      CREATE FUNCTION public.mission_slot() RETURNS integer LANGUAGE sql STABLE AS 'SELECT 1';
      CREATE FUNCTION public.add_xp(p_uid uuid,p_amount integer) RETURNS void LANGUAGE sql AS
        'UPDATE public.profiles SET xp=xp+p_amount WHERE id=p_uid';
      CREATE FUNCTION public.bump_mission(p_uid uuid,p_mission text) RETURNS integer LANGUAGE plpgsql AS $b$
        DECLARE v integer; BEGIN
        INSERT INTO public.daily_missions VALUES(p_uid,p_mission,public.mission_date(),public.mission_slot(),1)
        ON CONFLICT(user_id,mission_id,date,slot) DO UPDATE SET current=public.daily_missions.current+1
        RETURNING current INTO v; RETURN v; END $b$;
      CREATE FUNCTION public.answer_matches(p_answer text,p_word text) RETURNS boolean
        LANGUAGE sql IMMUTABLE AS 'SELECT p_answer=p_word';
      GRANT USAGE ON SCHEMA public TO anon, authenticated;
      ${profile}\n${original}`);
    const before = await fnDef(sig);
    const originalHash = hash(before);
    check(originalHash === 'f812da21f998176ab6e85f9a090efcce86034cf0168c0c87b1afb25a72f166d1', '검토 원본 함수 해시 불일치');
    const aclBefore = (await sql(`SELECT proacl::text FROM pg_proc WHERE oid=${q(sig)}::regprocedure;`)).out;
    stage = '실제 마이그레이션 두 번 적용';
    await sql(migration);
    await sql(migration);
    const locked = await fnDef(sig), newFunction = await fnDef(once);
    console.log('실제 마이그레이션 적용 및 재실행: 통과');
    const ids = [crypto.randomUUID(), crypto.randomUUID()];
    const tokens = [crypto.randomUUID(), crypto.randomUUID()];
    const request = crypto.randomUUID();
    await sql(`INSERT INTO public.profiles(id,guest_token) VALUES
      (${q(ids[0])},${q(tokens[0])}),(${q(ids[1])},${q(tokens[1])});`);
    stage = '동일 요청 스무 개 동시 호출';
    const sameResponses = await parallel('quiz_same', tokens[0], Array(20).fill(request), 'anon');
    sameResponses.forEach(response => equal(response, sameResponses[0], '동일 요청 응답 불일치'));
    const sameStats = { points:10, xp:2, combo:1, daily_count:1, m3:1, m4:1, receipts:1 };
    equal(await stats(ids[0]), sameStats, '동일 요청 중복 지급 또는 상태 불일치');
    console.log('동일 요청 20개: 지급·영수증·일일 횟수·콤보·미션 각 1회, 경험치 2 확인');
    stage = '다른 프로필의 서로 다른 요청 서른 개 동시 호출';
    await parallel('quiz_distinct', tokens[1], Array.from({ length:30 }, () => crypto.randomUUID()), 'authenticated');
    const distinctStats = { points:570, xp:60, combo:30, daily_count:30, m3:30, m4:30, receipts:30 };
    equal(await stats(ids[1]), distinctStats, '서로 다른 요청의 직렬화 또는 상태 불일치');
    console.log('서로 다른 요청 30개: 포인트 570·경험치 60·콤보·영수증·미션 각 30 확인');
    stage = '본문 불일치 및 직접 접근 차단';
    await rejected('동일 식별자 본문 변경 차단', rpc(tokens[0], request, 'different-answer'), 'request_id reused with different payload');
    equal(await stats(ids[0]), sameStats, '거부된 요청의 부수 효과 발생');
    const permissions = await query(`SELECT json_agg(json_build_object('table',
      has_table_privilege(r,'public.quiz_answer_receipts_v2','SELECT,INSERT,UPDATE,DELETE,TRUNCATE,REFERENCES,TRIGGER'),
      'column',has_any_column_privilege(r,'public.quiz_answer_receipts_v2','SELECT,INSERT,UPDATE,REFERENCES'),
      'execute',has_function_privilege(r,${q(once)},'EXECUTE')))
      FROM (VALUES('anon'),('authenticated')) x(r);`);
    check(permissions.every(p => !p.table && !p.column && p.execute), '일반 역할의 테이블·열·함수 권한 불일치');
    for (const role of ['anon', 'authenticated']) {
      for (const statement of [
        'SELECT * FROM public.quiz_answer_receipts_v2',
        'SELECT response FROM public.quiz_answer_receipts_v2',
        "INSERT INTO public.quiz_answer_receipts_v2(response) VALUES('{}')",
        "UPDATE public.quiz_answer_receipts_v2 SET response='{}' WHERE false",
        'DELETE FROM public.quiz_answer_receipts_v2 WHERE false',
      ]) await rejected('일반 역할 직접 접근 차단', `SET ROLE ${role}; ${statement};`, 'permission denied for table');
    }
    console.log('두 일반 역할의 직접 테이블·열 권한 없음 및 실제 원격 함수 호출 성공 확인');
    stage = '알 수 없는 원본 수정 방어';
    await sql(locked.replace('DECLARE', 'DECLARE\n-- 격리 시험 본문 변조\n') + ';');
    await rejected('기존 함수 변경 시 이관 거부', migration, 'submit_quiz_answer changed since review');
    await rejected('기존 함수 변경 시 되돌림 거부', rollback, 'submit_quiz_answer changed since review');
    await sql(locked + ';');
    await sql(newFunction.replace('DECLARE', 'DECLARE\n-- 격리 시험 본문 변조\n') + ';');
    await rejected('새 함수 변경 시 이관 거부', migration, 'unrecognized submit_quiz_answer_once');
    await rejected('새 함수 변경 시 되돌림 거부', rollback, 'submit_quiz_answer_once changed since review');
    await sql(newFunction + ';');
    await sql('ALTER TABLE public.quiz_answer_receipts_v2 ADD COLUMN unexpected integer;');
    await rejected('영수증 구조 변경 차단', migration, 'receipt shape, ownership, or policy mismatch');
    await sql('ALTER TABLE public.quiz_answer_receipts_v2 DROP COLUMN unexpected;');
    stage = '되돌림 및 재적용';
    const receiptsBefore = (await sql('SELECT md5(string_agg(row_to_json(r)::text,\'\' ORDER BY user_id,request_id)) FROM public.quiz_answer_receipts_v2 r;')).out;
    await sql(rollback);
    equal(hash(await fnDef(sig)), originalHash, '되돌림 후 원본 해시 불일치');
    equal((await sql(`SELECT proacl::text FROM pg_proc WHERE oid=${q(sig)}::regprocedure;`)).out, aclBefore, '원본 함수 실행 권한 변경');
    equal(await query(`SELECT json_build_object('receipts',(SELECT count(*) FROM public.quiz_answer_receipts_v2),
      'absent',to_regprocedure(${q(once)}) IS NULL,
      'rls',(SELECT relrowsecurity FROM pg_class WHERE oid='public.quiz_answer_receipts_v2'::regclass));`),
      { receipts:31, absent:true, rls:true }, '되돌림 후 영수증·새 함수·행 보안 상태 불일치');
    equal((await sql('SELECT md5(string_agg(row_to_json(r)::text,\'\' ORDER BY user_id,request_id)) FROM public.quiz_answer_receipts_v2 r;')).out, receiptsBefore, '되돌림 후 영수증 내용 변경');
    await sql(migration);
    await sql(rpc(tokens[0], request));
    equal(await stats(ids[0]), sameStats, '재적용 후 옛 요청이 재지급됨');
    equal(await stats(ids[1]), distinctStats, '재적용 후 별도 프로필 상태 변경');
    check(fs.readFileSync(migrationPath, 'utf8') === migration && fs.readFileSync(rollbackPath, 'utf8') === rollback,
      '읽기 전용 원본 파일 변경 감지');
    console.log('되돌림: 영수증 31개와 내용·원본 해시·실행 권한 보존, 새 함수 제거 확인');
    console.log('재적용 후 옛 요청 재전송 무지급 확인');
    console.log('검사 완료: 실제 동시성·DDL·멱등성만 검증했습니다. 실제 사업 보상 규칙의 검증은 아닙니다.');
  } catch (error) {
    // 자체 오류는 고정 문구뿐이다. psql 원문이나 AssertionError 객체는 출력하지 않는다.
    console.error(`검사 실패 단계: ${stage}`);
    console.error(error instanceof TestFailure ? error.message : '내부 검사 오류: 민감 정보 보호를 위해 세부 내용은 출력하지 않습니다.');
    process.exitCode = 1;
  }
})();
