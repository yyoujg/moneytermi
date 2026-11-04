// 리그는 KST 월요일 00:00에 초기화된다. 서버 league_week_start()와 같은 규칙이어야 한다.
const KST_OFFSET = 9 * 60 * 60 * 1000;

// 이번 주 시작(월요일 00:00 KST)의 UTC 타임스탬프
export const weekStart = (now: Date = new Date()): number => {
  const kst = new Date(now.getTime() + KST_OFFSET);
  const dow = kst.getUTCDay();               // 0=일
  const back = dow === 0 ? 6 : dow - 1;      // 월요일까지 되돌릴 일수
  const monday = Date.UTC(kst.getUTCFullYear(), kst.getUTCMonth(), kst.getUTCDate() - back);
  return monday - KST_OFFSET;
};

export const msUntilReset = (now: Date = new Date()): number =>
  weekStart(now) + 7 * 24 * 60 * 60 * 1000 - now.getTime();

// 남은 시간 표시. 하루 이상이면 'n일'(내림), 하루 안이면 'n시간'(올림, 최소 1시간)
export const timeLeftLabel = (now: Date = new Date()): string => {
  const ms = msUntilReset(now);
  const HOUR = 60 * 60 * 1000;
  return ms >= 24 * HOUR ? `${Math.floor(ms / (24 * HOUR))}일` : `${Math.max(1, Math.ceil(ms / HOUR))}시간`;
};
