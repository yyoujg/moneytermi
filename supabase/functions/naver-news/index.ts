const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// 기사 사진(og:image)은 언론사 저작물이라 받아 오지 않는다. 기사 페이지에도 들어가지 않고 네이버 검색 결과만 쓴다.

// 네이버 검색은 단어를 쪼개 느슨하게 찾아서, 단어가 안 나오는 기사도 섞인다. 제목·요약에 단어가 실제로 있는 기사만 남긴다.
// '주가수익비율(PER)'이면 '주가수익비율'과 'PER' 중 하나만 있어도 된다. 띄어쓰기는 무시.
const keysOf = (q: string) => {
  const m = q.match(/^(.*?)\((.*)\)$/);
  return (m ? [m[1], m[2]] : [q]).flatMap(k => k.split('/')).map(k => k.replace(/\s/g, '').toLowerCase()).filter(k => k.length >= 2);
};
// '규모의 경제'처럼 띄어 쓴 단어는 그냥 검색하면 '규모'와 '경제'가 따로 들어간 기사만 온다. 따옴표로 묶어 구절로 찾는다
const naverQuery = (q: string) => {
  const base = q.replace(/\(.*\)$/, '').trim();
  return base.includes(' ') ? `"${base}"` : q;
};
const plain = (s: string) => s.replace(/<[^>]+>/g, '').replace(/&[a-z#0-9]+;/gi, '').replace(/\s/g, '').toLowerCase();

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

    const url = `https://openapi.naver.com/v1/search/news.json?query=${encodeURIComponent(naverQuery(query))}&display=30&sort=sim`;
    const res = await fetch(url, {
      headers: {
        'X-Naver-Client-Id': clientId,
        'X-Naver-Client-Secret': clientSecret,
      },
    });

    if (!res.ok) {
      return new Response(JSON.stringify({ error: 'News provider unavailable' }), {
        status: 502, headers: { ...CORS, 'Content-Type': 'application/json' },
      });
    }

    const data = await res.json();
    const keys = keysOf(query);
    type Item = { title: string; description: string; link: string; pubDate: string };
    const inTitle = (i: Item) => keys.some(k => plain(i.title).includes(k));
    // 같은 사건을 여러 언론사가 쓴 기사는 제목이 거의 같다. 제목 글자쌍(bigram)이 40% 넘게 겹치면(실측: 같은 사건 0.48~, 다른 기사 0.2 이하) 같은 기사로 보고 앞의 것만 남긴다.
    const grams = (t: string) => { const p = plain(t).replace(/[^0-9a-z가-힣]/g, ''); const g = new Set<string>(); for (let i = 0; i < p.length - 1; i++) g.add(p.slice(i, i + 2)); return g; };
    const similar = (a: Set<string>, b: Set<string>) => { let n = 0; for (const x of a) if (b.has(x)) n++; return n / Math.max(1, Math.min(a.size, b.size)) > 0.4; };
    const dedup = (list: Item[]) => {
      const kept: { item: Item; g: Set<string> }[] = [];
      for (const item of list) { const g = grams(item.title); if (!kept.some(k => similar(k.g, g))) kept.push({ item, g }); }
      return kept.map(k => k.item);
    };
    // 앱은 본문 발췌 없이 헤드라인만 보여주므로, 제목에 단어가 있는 기사만 최신순으로 3건
    const top: Item[] = dedup((data.items ?? []).filter(inTitle))
      .sort((a: Item, b: Item) => Date.parse(b.pubDate) - Date.parse(a.pubDate))
      .slice(0, 3)
      .map(({ title, description, link, pubDate }: Item) => ({ title, description, link, pubDate }));
    return new Response(JSON.stringify(top), {
      headers: { ...CORS, 'Content-Type': 'application/json' },
    });
  } catch {
    return new Response(JSON.stringify({ error: 'News request failed' }), {
      status: 500, headers: { ...CORS, 'Content-Type': 'application/json' },
    });
  }
});
