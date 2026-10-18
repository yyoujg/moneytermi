-- 검토 원본: submit-quiz-answer-before.sql (2474자). 실제 DB 적용은 별도 승인 작업이다.
-- 구형 함수는 동일 profiles 행의 FOR UPDATE 잠금/행 존재 확인만 추가한다.
-- 기존 함수의 소유자/실행 권한은 CREATE OR REPLACE로 보존하며 REVOKE/GRANT하지 않는다.
-- 새 영수증은 보관한다. 임의 정리하면 오래된 UUID가 다시 지급될 수 있다.
BEGIN;
SET LOCAL lock_timeout = '10s';
DO $guard$
DECLARE v_definition text;
BEGIN
  IF pg_catalog.to_regprocedure('public.submit_quiz_answer(integer,text,text,boolean,boolean)') IS NULL THEN
    RAISE EXCEPTION 'reviewed submit_quiz_answer is missing';
  END IF;
  v_definition := pg_catalog.btrim(pg_catalog.pg_get_functiondef(
    'public.submit_quiz_answer(integer,text,text,boolean,boolean)'::regprocedure), E' \t\r\n');
  IF pg_catalog.encode(pg_catalog.sha256(pg_catalog.convert_to(v_definition, 'UTF8')), 'hex')
     NOT IN ('f812da21f998176ab6e85f9a090efcce86034cf0168c0c87b1afb25a72f166d1', '6e466ba3856c4a8b2cf35b98b1550c565aba952df9e1f23b7c57848a5152233e') THEN
    RAISE EXCEPTION 'submit_quiz_answer changed since review; stop and review the live definition';
  END IF;
END;
$guard$;

DO $existing$
BEGIN
  IF pg_catalog.to_regclass('public.quiz_answer_receipts_v2') IS NOT NULL
     AND pg_catalog.obj_description(pg_catalog.to_regclass('public.quiz_answer_receipts_v2'), 'pg_class')
         IS DISTINCT FROM 'quiz-answer-idempotency-v2:sha256:no-answer' THEN
    RAISE EXCEPTION 'unrecognized receipt relation; refusing to reuse';
  END IF;
  IF pg_catalog.to_regprocedure('public.submit_quiz_answer_once(integer,text,text,boolean,boolean,uuid)') IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM pg_catalog.pg_proc p
     WHERE p.oid = pg_catalog.to_regprocedure('public.submit_quiz_answer_once(integer,text,text,boolean,boolean,uuid)')
       AND pg_catalog.encode(pg_catalog.sha256(pg_catalog.convert_to(p.prosrc, 'UTF8')), 'hex') = 'bf031f11a0a5c942247b780e70b679bcf1880b28fe6914e5854988b77bdaff94'
       AND p.prosecdef AND p.prorettype = 'jsonb'::regtype
       AND p.proconfig = ARRAY['search_path=pg_catalog, public, pg_temp']::text[]
  ) THEN
    RAISE EXCEPTION 'unrecognized submit_quiz_answer_once; stop and review';
  END IF;
END;
$existing$;

CREATE TABLE IF NOT EXISTS public.quiz_answer_receipts_v2 (
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  request_id uuid NOT NULL,
  payload_hash bytea NOT NULL CHECK (pg_catalog.octet_length(payload_hash) = 32),
  response jsonb NOT NULL CHECK (pg_catalog.jsonb_typeof(response) = 'object'),
  created_at timestamptz NOT NULL DEFAULT pg_catalog.now(),
  PRIMARY KEY (user_id, request_id)
);
-- 재실행 시 같은 이름의 변형 테이블이나 외부 정책을 묵인하지 않는다.
DO $shape$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_catalog.pg_class c
    WHERE c.oid = 'public.quiz_answer_receipts_v2'::regclass
      AND c.relkind = 'r' AND c.relowner = (SELECT oid FROM pg_catalog.pg_roles WHERE rolname = current_user)
  ) OR (SELECT pg_catalog.array_agg(a.attname::text ORDER BY a.attnum)
        FROM pg_catalog.pg_attribute a
        WHERE a.attrelid = 'public.quiz_answer_receipts_v2'::regclass
          AND a.attnum > 0 AND NOT a.attisdropped)
       IS DISTINCT FROM ARRAY['user_id','request_id','payload_hash','response','created_at']::text[]
    OR (SELECT pg_catalog.array_agg(a.atttypid ORDER BY a.attnum)
        FROM pg_catalog.pg_attribute a
        WHERE a.attrelid = 'public.quiz_answer_receipts_v2'::regclass
          AND a.attnum > 0 AND NOT a.attisdropped)
       IS DISTINCT FROM ARRAY['uuid'::regtype::oid, 'uuid'::regtype::oid,
                              'bytea'::regtype::oid, 'jsonb'::regtype::oid, 'timestamptz'::regtype::oid]
    OR EXISTS (SELECT 1 FROM pg_catalog.pg_attribute a
               WHERE a.attrelid = 'public.quiz_answer_receipts_v2'::regclass
                 AND a.attnum > 0 AND NOT a.attisdropped AND NOT a.attnotnull)
    OR NOT EXISTS (SELECT 1 FROM pg_catalog.pg_constraint c
                   WHERE c.conrelid = 'public.quiz_answer_receipts_v2'::regclass
                     AND c.contype = 'p' AND c.conkey = ARRAY[1,2]::smallint[])
    OR NOT EXISTS (SELECT 1 FROM pg_catalog.pg_constraint c
                   WHERE c.conrelid = 'public.quiz_answer_receipts_v2'::regclass
                     AND c.contype = 'f' AND c.conkey = ARRAY[1]::smallint[]
                     AND c.confrelid = 'public.profiles'::regclass AND c.confdeltype = 'c'
                     AND c.confkey = ARRAY[(SELECT a.attnum FROM pg_catalog.pg_attribute a
                                          WHERE a.attrelid = 'public.profiles'::regclass AND a.attname = 'id')]::smallint[])
    OR EXISTS (SELECT 1 FROM pg_catalog.pg_policy WHERE polrelid = 'public.quiz_answer_receipts_v2'::regclass)
  THEN RAISE EXCEPTION 'receipt shape, ownership, or policy mismatch; stop and review'; END IF;
END;
$shape$;
COMMENT ON TABLE public.quiz_answer_receipts_v2 IS 'quiz-answer-idempotency-v2:sha256:no-answer';
ALTER TABLE public.quiz_answer_receipts_v2 ENABLE ROW LEVEL SECURITY;
-- 정책 없음. 소유자인 SECURITY DEFINER만 내부 접근. FORCE RLS는 소유자도 차단하므로 쓰지 않는다.
REVOKE ALL PRIVILEGES ON TABLE public.quiz_answer_receipts_v2 FROM PUBLIC, anon, authenticated;
REVOKE ALL PRIVILEGES (user_id, request_id, payload_hash, response, created_at)
  ON TABLE public.quiz_answer_receipts_v2 FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION public.submit_quiz_answer(p_word_id integer, p_answer text, p_mode text, p_used_hint boolean DEFAULT false, p_session_start boolean DEFAULT false)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$ DECLARE
v_uid     UUID; v_word    TEXT; v_combo   INTEGER; v_correct BOOLEAN; v_earned  INTEGER := 0; v_points  INTEGER; v_xp      INTEGER;
v_m3      INTEGER := 0; v_count   INTEGER := 0; v_capped  BOOLEAN := false; BEGIN v_uid := public.current_profile_id();
IF v_uid IS NULL THEN RAISE EXCEPTION 'profile not found'; END IF; PERFORM 1 FROM public.profiles WHERE id = v_uid FOR UPDATE;
IF NOT FOUND THEN RAISE EXCEPTION 'profile not found'; END IF; SELECT word INTO v_word FROM public.words WHERE id = p_word_id;
IF v_word IS NULL THEN RAISE EXCEPTION 'word not found'; END IF; IF p_session_start THEN v_combo := 0; ELSE
SELECT quiz_combo INTO v_combo FROM public.profiles WHERE id = v_uid; END IF; IF p_mode = 'typed' THEN
v_correct := public.answer_matches(p_answer, v_word); ELSE v_correct := p_answer = v_word; END IF; IF v_correct THEN v_combo := v_combo + 1;
INSERT INTO public.quiz_rewards_daily (user_id, date, count) VALUES (v_uid, public.mission_date(), 1)
ON CONFLICT (user_id, date) DO UPDATE SET count = public.quiz_rewards_daily.count + 1 RETURNING count INTO v_count; v_capped := v_count > 150;
IF NOT v_capped THEN IF p_mode = 'typed' THEN v_earned := (CASE WHEN p_used_hint THEN 5 ELSE 10 END)
+ (CASE WHEN (v_combo - 1) >= 2 THEN LEAST((v_combo - 1) * 2, 18) ELSE 0 END); ELSE v_earned := CASE WHEN v_combo >= 5 THEN 20
WHEN v_combo >= 3 THEN 15 ELSE 10 END; END IF; END IF; UPDATE public.profiles SET points = points + v_earned, quiz_combo = v_combo WHERE id = v_uid;
IF NOT v_capped THEN PERFORM public.add_xp(v_uid, 2); v_m3 := COALESCE(public.bump_mission(v_uid, 'm3'), 0); PERFORM public.bump_mission(v_uid, 'm4');
ELSE SELECT COALESCE(current, 0) INTO v_m3 FROM public.daily_missions WHERE user_id = v_uid AND mission_id = 'm3'
AND date = public.mission_date() AND slot = public.mission_slot(); END IF; ELSE v_combo := 0;
UPDATE public.profiles SET quiz_combo = 0 WHERE id = v_uid; SELECT COALESCE(current, 0) INTO v_m3 FROM public.daily_missions
WHERE user_id = v_uid AND mission_id = 'm3' AND date = public.mission_date() AND slot = public.mission_slot(); END IF;
SELECT points, xp INTO v_points, v_xp FROM public.profiles WHERE id = v_uid; RETURN json_build_object(
'correct', v_correct, 'earned', v_earned, 'combo', v_combo, 'points', v_points, 'xp', v_xp, 'm3_current', COALESCE(v_m3, 0), 'capped', v_capped );
END; $function$;

CREATE OR REPLACE FUNCTION public.submit_quiz_answer_once(
  p_word_id integer, p_answer text, p_mode text,
  p_used_hint boolean, p_session_start boolean, p_request_id uuid
) RETURNS jsonb
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp
AS $once$
DECLARE
  v_uid uuid;
  v_fingerprint bytea;
  v_stored_fingerprint bytea;
  v_response jsonb;
  v_points integer;
  v_xp integer;
  v_combo integer;
  v_m3 integer;
BEGIN
  v_uid := public.current_profile_id();
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'profile not found' USING ERRCODE = '28000';
  END IF;
  IF p_request_id IS NULL OR p_word_id IS NULL OR p_word_id <= 0
     OR p_answer IS NULL OR p_mode IS NULL OR p_mode NOT IN ('typed', 'mc')
     OR p_used_hint IS NULL OR p_session_start IS NULL THEN
    RAISE EXCEPTION 'invalid quiz request' USING ERRCODE = '22023';
  END IF;

  -- JSON 배열의 타입과 위치를 고정한다. 원문 답안은 영수증에 기록하지 않는다.
  -- 정규화하지 않으므로 공백/대소문자/힌트/세션 시작 변경도 다른 요청이다.
  v_fingerprint := pg_catalog.sha256(pg_catalog.convert_to(
    pg_catalog.jsonb_build_array(p_word_id, p_answer, p_mode,
                                p_used_hint, p_session_start)::text, 'UTF8'));

  -- 구형 함수와 동일한 행을 먼저 잠근다. 영수증 조회보다 앞서 잠가
  -- 동일 UUID 및 서로 다른 UUID와 구형 클라이언트 호출을 모두 직렬화한다.
  PERFORM 1 FROM public.profiles WHERE id = v_uid FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'profile not found' USING ERRCODE = '28000';
  END IF;

  SELECT r.payload_hash, r.response INTO v_stored_fingerprint, v_response
    FROM public.quiz_answer_receipts_v2 AS r
   WHERE r.user_id = v_uid AND r.request_id = p_request_id;
  IF FOUND THEN
    IF v_stored_fingerprint IS DISTINCT FROM v_fingerprint THEN
      RAISE EXCEPTION 'request_id reused with different payload' USING ERRCODE = '22023';
    END IF;
    SELECT p.points, p.xp, p.quiz_combo INTO v_points, v_xp, v_combo
      FROM public.profiles AS p WHERE p.id = v_uid;
    SELECT COALESCE(d.current, 0) INTO v_m3
      FROM public.daily_missions AS d
     WHERE d.user_id = v_uid AND d.mission_id = 'm3'
       AND d.date = public.mission_date() AND d.slot = public.mission_slot();
    -- correct/earned/capped는 최초 결과. earned는 재지급액이 아니다.
    -- points/xp/m3_current/combo는 현재 상태로 덮어써 늦은 응답의 역행을 막는다.
    -- combo도 원래 요청의 콤보가 아니라 현재 진행 중인 콤보를 반환한다.
    RETURN v_response || pg_catalog.jsonb_build_object(
      'points', v_points, 'xp', v_xp, 'm3_current', COALESCE(v_m3, 0), 'combo', v_combo);
  END IF;

  -- 보상/경험치/미션/일 150회 조건은 이곳에서 재구현하지 않는다.
  v_response := public.submit_quiz_answer(
    p_word_id, p_answer, p_mode, p_used_hint, p_session_start)::jsonb;
  INSERT INTO public.quiz_answer_receipts_v2(user_id, request_id, payload_hash, response)
    VALUES (v_uid, p_request_id, v_fingerprint, v_response);
  RETURN v_response;
END;
$once$;
-- 기본 권한으로 부여된 별도 역할도 제거한다. 함수 소유자의 고유 권한은 예외이다.
DO $rpc_acl$
DECLARE v_role text;
BEGIN
  FOR v_role IN
    SELECT DISTINCT r.rolname FROM pg_catalog.pg_proc p
    CROSS JOIN LATERAL pg_catalog.aclexplode(COALESCE(p.proacl, pg_catalog.acldefault('f', p.proowner))) a
    JOIN pg_catalog.pg_roles r ON r.oid = a.grantee
    WHERE p.oid = 'public.submit_quiz_answer_once(integer,text,text,boolean,boolean,uuid)'::regprocedure
      AND a.grantee <> p.proowner
  LOOP
    EXECUTE pg_catalog.format('REVOKE ALL PRIVILEGES ON FUNCTION public.submit_quiz_answer_once(integer,text,text,boolean,boolean,uuid) FROM %I', v_role);
  END LOOP;
END;
$rpc_acl$;
REVOKE ALL PRIVILEGES ON FUNCTION public.submit_quiz_answer_once(integer,text,text,boolean,boolean,uuid) FROM PUBLIC;
REVOKE ALL PRIVILEGES ON FUNCTION public.submit_quiz_answer_once(integer,text,text,boolean,boolean,uuid) FROM anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.submit_quiz_answer_once(integer,text,text,boolean,boolean,uuid) TO anon, authenticated;
NOTIFY pgrst, 'reload schema';
COMMIT;
