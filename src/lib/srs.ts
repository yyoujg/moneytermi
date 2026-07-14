import { toDateStr } from './date';

// SM-2 경량판. grade: 0=again, 1=hard, 2=good
export type Grade = 0 | 1 | 2;

export interface SrsState {
  ease: number;       // 2.5 시작, 최저 1.3
  interval_d: number; // 다음 복습까지 일수
  reps: number;       // 연속 성공 횟수
}

export function nextSrs(s: SrsState, grade: Grade): SrsState {
  // 오답 → 리셋
  if (grade === 0) {
    return { ease: Math.max(1.3, s.ease - 0.2), interval_d: 0, reps: 0 };
  }
  const reps = s.reps + 1;
  // ease 조정: hard 소폭 감소, good 유지
  const ease = grade === 1 ? Math.max(1.3, s.ease - 0.15) : s.ease;
  // interval 산출
  let interval_d: number;
  if (reps === 1) interval_d = 1;
  else if (reps === 2) interval_d = grade === 1 ? 2 : 3;
  else interval_d = Math.round(s.interval_d * ease * (grade === 1 ? 0.7 : 1));
  return { ease, interval_d: Math.max(1, interval_d), reps };
}

export function addDays(base: Date, days: number): string {
  const d = new Date(base);
  d.setDate(d.getDate() + days);
  return toDateStr(d); // KST YYYY-MM-DD
}

// 정오답 신호 → grade (나중 3버튼 전환 시 이 함수만 교체)
export function gradeFromResult(correct: boolean, usedHint: boolean): Grade {
  if (!correct) return 0;
  return usedHint ? 1 : 2;
}
