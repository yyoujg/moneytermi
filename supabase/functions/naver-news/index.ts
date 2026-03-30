const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS });
  }

  try {
    const { query } = await req.json();
    if (!query) {
      return new Response(JSON.stringify([]), { headers: { ...CORS, 'Content-Type': 'application/json' } });
    }

    const clientId = Deno.env.get('NAVER_CLIENT_ID');
    const clientSecret = Deno.env.get('NAVER_CLIENT_SECRET');

    if (!clientId || !clientSecret) {
      return new Response(JSON.stringify({ error: 'API keys not configured' }), {
        status: 500,
        headers: { ...CORS, 'Content-Type': 'application/json' },
      });
    }

    const url = `https://openapi.naver.com/v1/search/news.json?query=${encodeURIComponent(query)}&display=3&sort=date`;
    const res = await fetch(url, {
      headers: {
        'X-Naver-Client-Id': clientId,
        'X-Naver-Client-Secret': clientSecret,
      },
    });

    if (!res.ok) {
      return new Response(JSON.stringify([]), { headers: { ...CORS, 'Content-Type': 'application/json' } });
    }

    const data = await res.json();
    return new Response(JSON.stringify(data.items ?? []), {
      headers: { ...CORS, 'Content-Type': 'application/json' },
    });
  } catch {
    return new Response(JSON.stringify([]), {
      headers: { ...CORS, 'Content-Type': 'application/json' },
    });
  }
});
