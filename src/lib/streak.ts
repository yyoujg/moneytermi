import { toDateStr } from './date';

// 연속 출석일. 오늘부터 하루씩 거슬러 올라가며 끊기는 날까지 센다(KST 기준, toDateStr).
export const calcStreak = (attendanceDates: string[], today: Date = new Date()): number => {
  const s = new Set(attendanceDates);
  let count = 0;
  for (let i = 0; i < 365; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    if (!s.has(toDateStr(d))) break;
    count++;
  }
  return count;
};

export type WeekDay = {
  label: string;
  dateStr: string;
  attended: boolean;
  isToday: boolean;
  isFuture: boolean;
};

const LABELS = ['월', '화', '수', '목', '금', '토', '일'];

// 이번 주(월~일) 7칸. WeeklyBarChart와 같은 월요일 기준.
export const weekDays = (attendanceDates: string[], today: Date = new Date()): WeekDay[] => {
  const s = new Set(attendanceDates);
  // 요일은 기기 시간대가 아니라 KST로 센다(출석 날짜 문자열이 KST라서)
  const dow = new Date(today.getTime() + 9 * 60 * 60 * 1000).getUTCDay();
  const mondayOffset = dow === 0 ? -6 : 1 - dow;
  const todayIdx = dow === 0 ? 6 : dow - 1;

  return LABELS.map((label, i) => {
    const dateStr = toDateStr(new Date(today.getTime() + (mondayOffset + i) * 24 * 60 * 60 * 1000));
    return { label, dateStr, attended: s.has(dateStr), isToday: i === todayIdx, isFuture: i > todayIdx };
  });
};

// 특별히 크게 축하하는 연속 일수. 정확히 그 날에만 (7일째 하루) 마일스톤 화면을 띄운다.
const MILESTONES: Record<number, string> = {
  7: '일주일 연속!', 14: '2주 연속!', 30: '한 달 연속!', 50: '50일 연속!', 100: '100일 연속!',
};
export const streakMilestone = (streak: number): string | null => MILESTONES[streak] ?? null;

export const streakMessage = (streak: number): string => {
  if (streak >= 30) return '한 달 연속! 돈 공부가 루틴이 됐네';
  if (streak >= 14) return '2주 연속! 이 정도면 루틴 맛집';
  if (streak >= 7) return '일주일 꽉 채웠다! 꾸준함 인정';
  if (streak >= 3) return '하루하루 쌓이는 중. 페이스 좋다';
  if (streak >= 2) return '이틀 연속! 내일도 한 칸 채워볼까?';
  return '오늘도 체크인! 한 단어부터 가보자';
};
