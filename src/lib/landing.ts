const ALLOWED_PATHS = new Set([
  '/home',
  '/course',
  '/league',
  '/review',
  '/my',
  '/league/rules',
  '/quiz',
  '/word-card',
]);

const matchAllowed = (p: string | null | undefined): string | null => {
  if (!p) return null;
  const decoded = (() => {
    try { return decodeURIComponent(p); } catch { return p; }
  })();
  const pathOnly = decoded.split('?')[0] ?? decoded;
  return ALLOWED_PATHS.has(pathOnly) ? pathOnly : null;
};

export function parseReferrer(raw: string | null | undefined): string {
  if (!raw) return 'organic';
  const q = raw.split('?')[1];
  if (!q) return 'organic';
  const ref = new URLSearchParams(q).get('referrer');
  return ref?.trim() || 'organic';
}

export function parseLandingPath(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const s = raw.trim();
  if (!s) return null;

  const pick = (v: string | null): string | null => {
    if (!v) return null;
    const decoded = (() => {
      try { return decodeURIComponent(v); } catch { return v; }
    })();
    const value = decoded.trim();

    const fromHash = value.includes('#/') ? value.slice(value.indexOf('#') + 1) : value;
    const candidate = fromHash.startsWith('/') ? fromHash : (fromHash.startsWith('#') ? fromHash.slice(1) : null);
    if (!candidate) return null;

    return matchAllowed(candidate);
  };

  const direct = pick(s);
  if (direct) return direct;

  let u: URL;
  try {
    u = new URL(s);
  } catch {
    return null;
  }

  if (u.pathname && u.pathname !== '/') {
    const hit = matchAllowed(u.pathname);
    if (hit) return hit;
  }

  if (u.host) {
    if (u.pathname && u.pathname !== '/') {
      const combinedHit = matchAllowed('/' + u.host + u.pathname);
      if (combinedHit) return combinedHit;
    }

    const hostHit = matchAllowed('/' + u.host);
    if (hostHit) return hostHit;
  }

  const hashPath = pick(u.hash);
  if (hashPath) return hashPath;

  for (const key of ['path', 'landing', 'url', 'redirect', 'target']) {
    const chosen = pick(u.searchParams.get(key));
    if (chosen) return chosen;
  }

  return null;
}
