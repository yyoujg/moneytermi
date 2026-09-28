const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// 이미지 앞부분(64KB)만 받아 가로·세로 크기를 읽는다. JPEG·PNG·GIF·WebP. 모르면 null.
const imageSize = async (url: string): Promise<{ w: number; h: number } | null> => {
  try {
    const res = await fetch(url, { headers: { Range: 'bytes=0-65535', 'User-Agent': 'Mozilla/5.0 (compatible; moneytermi)' }, signal: AbortSignal.timeout(2000) });
    if (!res.ok) return null;
    const b = new Uint8Array(await res.arrayBuffer());
    const u16 = (i: number) => (b[i] << 8) | b[i + 1];
    const u32 = (i: number) => ((b[i] << 24) | (b[i + 1] << 16) | (b[i + 2] << 8) | b[i + 3]) >>> 0;
    if (b[0] === 0x89 && b[1] === 0x50) return { w: u32(16), h: u32(20) };                      // PNG
    if (b[0] === 0x47 && b[1] === 0x49) return { w: b[6] | (b[7] << 8), h: b[8] | (b[9] << 8) };  // GIF
    if (b[0] === 0x52 && b[8] === 0x57) {                                                          // WebP
      const t = String.fromCharCode(b[12], b[13], b[14], b[15]);
      if (t === 'VP8X') return { w: 1 + (b[24] | (b[25] << 8) | (b[26] << 16)), h: 1 + (b[27] | (b[28] << 8) | (b[29] << 16)) };
      if (t === 'VP8 ') return { w: (b[26] | (b[27] << 8)) & 0x3fff, h: (b[28] | (b[29] << 8)) & 0x3fff };
      if (t === 'VP8L') return { w: 1 + (((b[22] & 0x3f) << 8) | b[21]), h: 1 + (((b[24] & 0xf) << 10) | (b[23] << 2) | ((b[22] & 0xc0) >> 6)) };
      return null;
    }
    if (b[0] === 0xff && b[1] === 0xd8) {                                                          // JPEG: SOF 마커 찾기
      let i = 2;
      while (i + 9 < b.length) {
        if (b[i] !== 0xff) { i++; continue; }
        const m = b[i + 1];
        if (m >= 0xc0 && m <= 0xcf && m !== 0xc4 && m !== 0xc8 && m !== 0xcc) return { w: u16(i + 7), h: u16(i + 5) };
        i += 2 + u16(i + 2);
      }
    }
    return null;
  } catch {
    return null;
  }
};
// 기자 프로필 사진(작은 정사각형·세로형)이 대표 이미지인 기사가 있다. 기사 사진은 대개 가로형이라 가로가 세로보다 충분히 길 때만 쓴다.
// 크기를 못 읽으면 그대로 둔다(이미 걸러낸 로고·기본 이미지 외에는 기사 사진일 가능성이 높다).
const isArticlePhoto = async (url: string) => {
  const s = await imageSize(url);
  return !s || (s.w >= 400 && s.w / s.h >= 1.2);
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
    // 기사 사진 대신 언론사 로고·공용 기본 이미지(네이버 뉴스 ogtag 등)를 주는 곳이 있다 - 기사와 무관해 깨진 것처럼 보인다
    if (!img.startsWith('https://') || /logo|ogtag|default|no_?image|blank/i.test(img)) return undefined;
    return (await isArticlePhoto(img)) ? img : undefined;
  } catch {
    return undefined;
  }
};

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
      return new Response(JSON.stringify([]), { headers: { ...CORS, 'Content-Type': 'application/json' } });
    }

    const data = await res.json();
    const keys = keysOf(query);
    type Item = { title: string; description: string; link: string; pubDate: string; image?: string };
    const inTitle = (i: Item) => keys.some(k => plain(i.title).includes(k));
    // 같은 사건을 여러 언론사가 쓴 기사는 제목이 거의 같다. 제목 글자쌍(bigram)이 40% 넘게 겹치면(실측: 같은 사건 0.48~, 다른 기사 0.2 이하) 같은 기사로 보고 앞의 것만 남긴다.
    const grams = (t: string) => { const p = plain(t).replace(/[^0-9a-z가-힣]/g, ''); const g = new Set<string>(); for (let i = 0; i < p.length - 1; i++) g.add(p.slice(i, i + 2)); return g; };
    const similar = (a: Set<string>, b: Set<string>) => { let n = 0; for (const x of a) if (b.has(x)) n++; return n / Math.max(1, Math.min(a.size, b.size)) > 0.4; };
    const dedup = (list: Item[]) => {
      const kept: { item: Item; g: Set<string> }[] = [];
      for (const item of list) { const g = grams(item.title); if (!kept.some(k => similar(k.g, g))) kept.push({ item, g }); }
      return kept.map(k => k.item);
    };
    // 순서: 사진 있는 기사 > 제목에 단어가 있는 기사 > 최신순. 사진을 확인할 후보는 제목 일치 우선으로 10건(병렬로 읽는다)
    const candidates: Item[] = dedup((data.items ?? [])
      .filter((i: Item) => keys.some(k => plain(i.title + i.description).includes(k)))
      .sort((a: Item, b: Item) => Number(inTitle(b)) - Number(inTitle(a))))
      .slice(0, 10);
    const withImages: Item[] = await Promise.all(candidates.map(async item => ({ ...item, image: await ogImage(item.link) })));
    const seenImg = new Set<string>();
    const top = withImages
      .sort((a, b) => Number(!!b.image) - Number(!!a.image) || Number(inTitle(b)) - Number(inTitle(a)) || Date.parse(b.pubDate) - Date.parse(a.pubDate))
      .filter(i => !i.image || (!seenImg.has(i.image) && seenImg.add(i.image)))   // 같은 사진을 쓴 기사도 하나만
      .slice(0, 3);
    return new Response(JSON.stringify(top), {
      headers: { ...CORS, 'Content-Type': 'application/json' },
    });
  } catch {
    return new Response(JSON.stringify([]), {
      headers: { ...CORS, 'Content-Type': 'application/json' },
    });
  }
});
