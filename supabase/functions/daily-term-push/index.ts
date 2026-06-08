// [보관·미배포] 발송은 토스 콘솔의 스마트 발송 캠페인이 담당한다.
// 직접 API 발송 자산으로 보관만 하며 현재 배포하지 않는다(콘솔 전환). 재사용 시 deploy.
//
// DAILY_TERM_PUSH 발송
// 오늘의 단어를 골라, 알림 동의 사용자에게 Toss 기능성 메시지를 일괄 발송한다.
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const TOSS_API_BASE = Deno.env.get('TOSS_API_BASE') ?? 'https://apps-in-toss-api.toss.im';
const TEMPLATE_SET_CODE = Deno.env.get('TOSS_TEMPLATE_SET_CODE'); // 콘솔에서 생성한 DAILY_TERM_PUSH 캠페인 코드
const PARTNER_AUTH = Deno.env.get('TOSS_PARTNER_AUTH');           // 파트너 인증 헤더값(필요 시)
const BULK_LIMIT = 2500;                                          // 요청당 최대 발송 건수

// 브라우저에서 호출되지 않는 cron 전용 엔드포인트 → CORS 미허용
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

const chunk = <T>(arr: T[], size: number): T[][] => {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
};

// 길이 노출만 허용하는 상수시간 비교
const safeEqual = (a: string, b: string): boolean => {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
};

Deno.serve(async (req) => {
  // cron/서버만 호출: 신뢰 시크릿 필수
  const expected = Deno.env.get('CRON_SECRET') ?? Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  const token = (req.headers.get('Authorization') ?? '').replace(/^Bearer\s+/i, '');
  if (!expected || !safeEqual(token, expected)) return json({ error: 'Unauthorized' }, 401);

  if (!TEMPLATE_SET_CODE) return json({ error: 'TOSS_TEMPLATE_SET_CODE 미설정' }, 500);

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    // 1. 오늘의 단어 (날짜 기반 결정적 선택, 매일 회전)
    const { count } = await supabase.from('words').select('*', { count: 'exact', head: true });
    if (!count) return json({ error: '단어 없음' }, 500);
    const dayIndex = Math.floor(Date.now() / 86_400_000) % count;
    const { data: words } = await supabase
      .from('words')
      .select('id, word, meaning')
      .order('id')
      .range(dayIndex, dayIndex);
    const term = words?.[0];
    if (!term) return json({ error: '오늘의 단어 조회 실패' }, 500);

    // 2. 발송 대상 userKey
    const { data: targets } = await supabase
      .from('profiles')
      .select('toss_user_key')
      .eq('notification_agreed', true)
      .not('toss_user_key', 'is', null);
    const userKeys = (targets ?? []).map((t) => t.toss_user_key as number);
    if (userKeys.length === 0) return json({ ok: true, sent: 0, word: term.word });

    // 3. 기능성 메시지 일괄 발송 (2,500건씩)
    const context = { word: term.word, meaning: term.meaning };
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (PARTNER_AUTH) headers.Authorization = PARTNER_AUTH;

    let sent = 0;
    const failures: unknown[] = [];
    for (const batch of chunk(userKeys, BULK_LIMIT)) {
      const res = await fetch(`${TOSS_API_BASE}/api-partner/v1/apps-in-toss/messenger/send-bulk-message`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          templateSetCode: TEMPLATE_SET_CODE,
          contextList: batch.map((userKey) => ({ userKey, context })),
        }),
      });
      const data = await res.json().catch(() => null);
      if (res.ok && data?.resultType === 'SUCCESS') sent += data.success?.msgCount ?? batch.length;
      else failures.push({ status: res.status, data });
    }

    return json({ ok: failures.length === 0, word: term.word, targets: userKeys.length, sent, failures });
  } catch (e) {
    return json({ error: String(e) }, 500);
  }
});
