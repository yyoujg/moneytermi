// 하트(에너지) — 레슨 1개 시작에 1 소모, 시간이 지나면 회복.
// 1단계는 로컬 Storage만 쓰므로 서버 권위가 아니다(우회 가능). 포인트/미션 경로와 무관.
export const MAX_HEARTS = 5;
export const REGEN_MS = 20 * 60 * 1000;

export type HeartState = { hearts: number; updatedAt: number };

export const FULL: HeartState = { hearts: MAX_HEARTS, updatedAt: 0 };

// 경과 시간만큼 회복해 현재 상태를 만든다. 같은 상태에 여러 번 적용해도 결과가 같다(멱등).
export const regen = (s: HeartState, now: number): HeartState => {
  if (s.hearts >= MAX_HEARTS) return { hearts: MAX_HEARTS, updatedAt: now };
  if (now < s.updatedAt) return { ...s, updatedAt: now }; // 시계 역행
  const gained = Math.floor((now - s.updatedAt) / REGEN_MS);
  if (gained <= 0) return s;
  const hearts = Math.min(MAX_HEARTS, s.hearts + gained);
  // 남은 자투리 시간을 보존한다. now로 덮어쓰면 회복이 매번 처음부터 다시 시작된다.
  return { hearts, updatedAt: hearts >= MAX_HEARTS ? now : s.updatedAt + gained * REGEN_MS };
};

// 1개 소모. 부족하면 null.
export const spend = (s: HeartState, now: number): HeartState | null => {
  const cur = regen(s, now);
  if (cur.hearts <= 0) return null;
  // 만충에서 처음 소모하는 순간부터 회복 타이머를 시작한다.
  return { hearts: cur.hearts - 1, updatedAt: cur.hearts >= MAX_HEARTS ? now : cur.updatedAt };
};

// 다음 1개까지 남은 ms. 만충이면 0.
export const msUntilNext = (s: HeartState, now: number): number => {
  const cur = regen(s, now);
  if (cur.hearts >= MAX_HEARTS) return 0;
  return Math.max(0, cur.updatedAt + REGEN_MS - now);
};
