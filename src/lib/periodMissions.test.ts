import { describe, expect, it } from 'vitest';
import { daysLeftInMonth, daysLeftInWeek, monthStart, periodMissions, weekStart } from './periodMissions';

// 2026-11-04(수) 12:00 KST
const NOW = new Date('2026-11-04T03:00:00Z');

describe('주간·월간 미션', () => {
  it('주는 월요일, 달은 1일에 시작한다(KST)', () => {
    expect(weekStart(NOW)).toBe('2026-11-02');
    expect(monthStart(NOW)).toBe('2026-11-01');
    expect(weekStart(new Date('2026-11-01T16:00:00Z'))).toBe('2026-11-02'); // 월 01:00 KST
    expect(daysLeftInWeek(NOW)).toBe(5);
    expect(daysLeftInMonth(NOW)).toBe(27);
  });

  it('기간 안 출석만 세고, 목표를 넘으면 목표에서 멈춘다', () => {
    const dates = ['2026-10-30', '2026-11-01', '2026-11-02', '2026-11-03', '2026-11-04', '2026-11-04'];
    const { weekly, monthly } = periodMissions(dates, 250, NOW);
    expect(weekly.find(m => m.id === 'w-attend')?.current).toBe(3);
    expect(weekly.find(m => m.id === 'w-xp')).toMatchObject({ current: 100, target: 100 });
    expect(monthly[0].current).toBe(4);
  });
});
