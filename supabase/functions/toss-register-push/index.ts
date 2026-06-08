// [보관·미배포] 콘솔 발송 전환으로 userKey 등록이 불필요해져 현재 배포하지 않는다.
// 직접 API 발송(토스 로그인 기반)으로 되돌릴 때 재사용할 자산으로 보관만 한다.
//
// 알림 동의 사용자의 Toss userKey 등록
// 클라이언트 appLogin()의 authorizationCode/referrer를 받아
// generate-token -> login-me 로 userKey를 얻어 profiles에 저장한다.
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const TOSS_API_BASE = Deno.env.get('TOSS_API_BASE') ?? 'https://apps-in-toss-api.toss.im';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...CORS, 'Content-Type': 'application/json' } });

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });

  try {
    const { guestToken, authorizationCode, referrer } = await req.json();
    if (!guestToken || !authorizationCode || !referrer) {
      return json({ error: 'guestToken, authorizationCode, referrer가 필요합니다' }, 400);
    }

    // 1. 인가 코드 -> accessToken
    const tokenRes = await fetch(`${TOSS_API_BASE}/api-partner/v1/apps-in-toss/user/oauth2/generate-token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ authorizationCode, referrer }),
    });
    const tokenData = await tokenRes.json();
    const accessToken = tokenData?.success?.accessToken;
    if (!accessToken) return json({ error: 'accessToken 발급 실패', detail: tokenData }, 502);

    // 2. accessToken -> userKey
    const meRes = await fetch(`${TOSS_API_BASE}/api-partner/v1/apps-in-toss/user/oauth2/login-me`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
    });
    const meData = await meRes.json();
    const userKey = meData?.success?.userKey;
    if (!userKey) return json({ error: 'userKey 조회 실패', detail: meData }, 502);

    // 3. profiles에 저장
    //    anon key + x-guest-token 헤더로 호출 → RLS가 "헤더의 guest_token == 수정 대상 행"을
    //    강제하므로, 본문으로 받은 guestToken은 본인 행에만 쓸 수 있다(임의 행 변경 차단).
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { 'x-guest-token': guestToken } } },
    );
    const { data: updated, error } = await supabase
      .from('profiles')
      .update({ toss_user_key: userKey, notification_agreed: true })
      .eq('guest_token', guestToken)
      .select('id');
    if (error) return json({ error: 'profiles 저장 실패', detail: error.message }, 500);
    if (!updated?.length) return json({ error: '대상 프로필 없음' }, 404); // RLS 불일치 = 권한 없음

    return json({ ok: true });
  } catch (e) {
    return json({ error: String(e) }, 500);
  }
});
