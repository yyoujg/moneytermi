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

// 남은 일수. 오늘이 마지막 날이면 1일로 표시한다(0일이라고 하면 이미 끝난 것처럼 보인다).
export const daysUntilReset = (now: Date = new Date()): number =>
  Math.max(1, Math.ceil(msUntilReset(now) / (24 * 60 * 60 * 1000)));
