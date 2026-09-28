// 한국은행 ECOS 통계 조회 대리. 인증키(ECOS_API_KEY)는 여기만 둔다.
// 요청: { stat: '722Y001', item: '0101000', cycle: 'M', months: 60 } → 응답: [{ time: '202501', value: 3 }, ...]
const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...CORS, 'Content-Type': 'application/json' } });

const ym = (d: Date) => `${d.getUTCFullYear()}${String(d.getUTCMonth() + 1).padStart(2, '0')}`;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });

  try {
    const { stat, item, cycle, months } = await req.json();
    // 코드는 URL 경로에 그대로 들어가므로 영숫자(항목 코드는 '*' 포함, 예: 생산자물가 '*AA')만 받는다. 항목 코드는 '0000001/0000100'처럼 여러 단계일 수 있다.
    if (!/^[0-9A-Z]{7}$/.test(stat) || !/^[0-9A-Z*]+(\/[0-9A-Z*]+){0,3}$/.test(item) || cycle !== 'M') return json([]);
    const n = Math.min(Math.max(Number(months) || 60, 2), 120);

    const key = Deno.env.get('ECOS_API_KEY');
    if (!key) return json({ error: 'ECOS_API_KEY not configured' }, 500);

    const end = new Date();
    const start = new Date(Date.UTC(end.getUTCFullYear(), end.getUTCMonth() - (n - 1), 1));
    const url = `https://ecos.bok.or.kr/api/StatisticSearch/${key}/json/kr/1/${n}/${stat}/M/${ym(start)}/${ym(end)}/${item}`;
    const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
    if (!res.ok) return json([]);
    const data = await res.json();
    const rows: { TIME: string; DATA_VALUE: string }[] = data?.StatisticSearch?.row ?? [];
    const points = rows
      .map(r => ({ time: r.TIME, value: Number(r.DATA_VALUE) }))
      .filter(p => Number.isFinite(p.value));
    // 통계는 하루에 한 번 정도만 바뀐다
    return new Response(JSON.stringify(points), {
      headers: { ...CORS, 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=21600' },
    });
  } catch {
    return json([]);
  }
});
