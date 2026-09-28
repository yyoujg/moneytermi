const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// ponytail: 요청마다 기사 페이지를 읽는다(캐시 없음, 앱이 세션 캐시). 호출량이 늘면 검색어별 캐시 테이블을 둔다.
const ogImage = async (url: string): Promise<string | undefined> => {
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; moneytermi)' },
      signal: AbortSignal.timeout(2500),
    });
    if (!res.ok) return undefined;
    const html = (await res.text()).slice(0, 300_000);
    const m = html.match(/<meta[^>]+property=["']og:image["'][^>]*content=["']([^"']+)/i)
      ?? html.match(/<meta[^>]+content=["']([^"']+)["'][^>]*property=["']og:image/i);
    if (!m) return undefined;
    const img = m[1].replace(/&#x3D;/gi, '=').replace(/&amp;/g, '&')
      // 한국 언론사 CMS 다수가 og:image에 300px 썸네일(/thumbnail/..._v150)을 준다. 같은 이름의 /photo/ 원본이 크다
      .replace(/\/thumbnail\/(.+)_v\d+(\.\w+)$/, '/photo/$1$2');
    // 기사 사진 대신 언론사 로고를 대표 이미지로 두는 곳이 있다
    if (!img.startsWith('https://') || /logo/i.test(img)) return undefined;
    return img;
  } catch {
    return undefined;
  }
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS });
  }

  try {
    const { query } = await req.json();
    if (!query || typeof query !== 'string') {
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

    const url = `https://openapi.naver.com/v1/search/news.json?query=${encodeURIComponent(query)}&display=6&sort=date`;
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
    const items = data.items ?? [];
    // 기사마다 대표 이미지(og:image)를 붙이고, 이미지 있는 기사를 앞으로(같은 그룹 안은 최신순 유지) 3건만 보낸다.
    const withImages = await Promise.all(items.map(async (item: { link: string }) => ({ ...item, image: await ogImage(item.link) })));
    const top = [...withImages.filter(i => i.image), ...withImages.filter(i => !i.image)].slice(0, 3);
    return new Response(JSON.stringify(top), {
      headers: { ...CORS, 'Content-Type': 'application/json' },
    });
  } catch {
    return new Response(JSON.stringify([]), {
      headers: { ...CORS, 'Content-Type': 'application/json' },
    });
  }
});
