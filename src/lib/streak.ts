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
  const dow = today.getDay();
  const mondayOffset = dow === 0 ? -6 : 1 - dow;
  const todayIdx = dow === 0 ? 6 : dow - 1;

  return LABELS.map((label, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() + mondayOffset + i);
    const dateStr = toDateStr(d);
    return { label, dateStr, attended: s.has(dateStr), isToday: i === todayIdx, isFuture: i > todayIdx };
  });
};

export const streakMessage = (streak: number): string => {
  if (streak >= 30) return '한 달 연속이라니, 이건 습관이에요 🔥';
  if (streak >= 14) return '2주 연속! 이제 멈추기가 더 어려울걸요';
  if (streak >= 7) return '일주일 채웠어요. 진짜 대단해요!';
  if (streak >= 3) return '며칠째 이어가고 있어요. 리듬이 잡혔어요';
  if (streak >= 2) return '이틀째예요. 내일도 만나요!';
  return '오늘도 왔네요. 여기서 시작이에요';
};
