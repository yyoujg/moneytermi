import { describe, it, expect } from 'vitest';
import { calcStreak, weekDays, streakMessage, streakMilestone } from './streak';
import { toDateStr } from './date';

// 기준일: 2026-09-24(목)
const TODAY = new Date('2026-09-24T12:00:00+09:00');
const back = (n: number) => {
  const d = new Date(TODAY);
  d.setDate(TODAY.getDate() - n);
  return toDateStr(d);
};

describe('calcStreak', () => {
  it('기록이 없으면 0', () => {
    expect(calcStreak([], TODAY)).toBe(0);
  });

  it('오늘만 있으면 1', () => {
    expect(calcStreak([back(0)], TODAY)).toBe(1);
  });

  it('연속 3일', () => {
    expect(calcStreak([back(0), back(1), back(2)], TODAY)).toBe(3);
  });

  it('중간이 끊기면 끊긴 지점까지만', () => {
    expect(calcStreak([back(0), back(1), back(3), back(4)], TODAY)).toBe(2);
  });

  it('오늘이 없으면 0 (어제까지 했어도)', () => {
    expect(calcStreak([back(1), back(2)], TODAY)).toBe(0);
  });

  it('순서가 뒤섞여도 같은 결과', () => {
    expect(calcStreak([back(2), back(0), back(1)], TODAY)).toBe(3);
  });
});

describe('weekDays', () => {
  it('월요일부터 7칸', () => {
    const w = weekDays([], TODAY);
    expect(w.map(d => d.label)).toEqual(['월', '화', '수', '목', '금', '토', '일']);
  });

  it('목요일이면 오늘은 4번째, 금토일은 미래', () => {
    const w = weekDays([], TODAY);
    expect(w.findIndex(d => d.isToday)).toBe(3);
    expect(w.map(d => d.isFuture)).toEqual([false, false, false, false, true, true, true]);
  });

  it('일요일은 마지막 칸 (월요일 기준 주)', () => {
    const sunday = new Date('2026-09-27T12:00:00+09:00');
    const w = weekDays([], sunday);
    expect(w.findIndex(d => d.isToday)).toBe(6);
    expect(w.some(d => d.isFuture)).toBe(false);
  });

  it('출석한 날만 attended', () => {
    const w = weekDays([back(0), back(2)], TODAY);
    expect(w.filter(d => d.attended).map(d => d.label)).toEqual(['화', '목']);
  });
});

describe('streakMessage', () => {
  it('구간마다 다른 문구', () => {
    const msgs = [0, 1, 2, 3, 7, 14, 30].map(streakMessage);
    expect(new Set(msgs).size).toBe(6); // 0과 1은 같은 문구
    expect(streakMessage(0)).toBe(streakMessage(1));
    expect(streakMessage(45)).toBe(streakMessage(30));
  });
});

describe('streakMilestone', () => {
  it('7·14·30·50·100일째에만 라벨을 준다', () => {
    expect(streakMilestone(7)).toBe('일주일 연속!');
    expect(streakMilestone(30)).toBe('한 달 연속!');
    for (const n of [0, 1, 6, 8, 13, 29, 31]) expect(streakMilestone(n)).toBeNull();
  });
});
