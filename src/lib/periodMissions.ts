import { toDateStr } from './date';

// 주간·월간 미션: 출석 기록과 이번 주 리그 XP로 진행도를 계산한다. 보상은 서버 claim_period_mission이 진행도를 다시 세서 준다.
// 주는 리그와 같이 월요일 0시(KST)에 시작한다.
export type PeriodMission = { id: string; title: string; current: number; target: number; xp: number; periodStart: string };

// 보상 XP. 서버 claim_period_mission(supabase/content/period-mission-rewards)과 같아야 한다
export const PERIOD_MISSION_XP: Record<string, number> = { 'w-attend': 20, 'w-xp': 20, 'mo-attend': 50 };

const DAY = 86400000;
const kstNow = (now: Date) => new Date(now.getTime() + 9 * 3600000);

export const weekStart = (now = new Date()) => {
  const k = kstNow(now);
  const back = (k.getUTCDay() + 6) % 7;
  return toDateStr(new Date(now.getTime() - back * DAY));
};
export const monthStart = (now = new Date()) => toDateStr(now).slice(0, 8) + '01';

export const daysLeftInWeek = (now = new Date()) => 7 - (kstNow(now).getUTCDay() + 6) % 7;
export const daysLeftInMonth = (now = new Date()) => {
  const k = kstNow(now);
  return new Date(Date.UTC(k.getUTCFullYear(), k.getUTCMonth() + 1, 0)).getUTCDate() - k.getUTCDate() + 1;
};

export const periodMissions = (attendanceDates: string[], weeklyXp: number, now = new Date()) => {
  const today = toDateStr(now);
  const since = (start: string) => new Set(attendanceDates.filter(d => d >= start && d <= today)).size;
  const cap = (m: PeriodMission) => ({ ...m, current: Math.min(m.current, m.target) });
  return {
    weekly: [
      { id: 'w-attend', title: '이번 주 5일 출석하기', current: since(weekStart(now)), target: 5, xp: PERIOD_MISSION_XP['w-attend'], periodStart: weekStart(now) },
      { id: 'w-xp', title: '이번 주 100 XP 모으기', current: weeklyXp, target: 100, xp: PERIOD_MISSION_XP['w-xp'], periodStart: weekStart(now) },
    ].map(cap),
    monthly: [
      { id: 'mo-attend', title: '이번 달 20일 출석하기', current: since(monthStart(now)), target: 20, xp: PERIOD_MISSION_XP['mo-attend'], periodStart: monthStart(now) },
    ].map(cap),
  };
};
