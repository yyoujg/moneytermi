import { describe, it, expect } from 'vitest';
import { weekStart, msUntilReset, daysUntilReset } from './league';

const kst = (s: string) => new Date(`${s}+09:00`);
const DAY = 24 * 60 * 60 * 1000;

describe('weekStart', () => {
  it('월요일 낮이면 그날 00:00', () => {
    expect(weekStart(kst('2026-09-21T13:00:00'))).toBe(kst('2026-09-21T00:00:00').getTime());
  });

  it('주 중간 어느 날이든 같은 월요일', () => {
    const days = ['2026-09-21T00:00:00', '2026-09-23T12:00:00', '2026-09-27T23:59:59'];
    const starts = days.map(d => weekStart(kst(d)));
    expect(new Set(starts).size).toBe(1);
    expect(starts[0]).toBe(kst('2026-09-21T00:00:00').getTime());
  });

  it('일요일은 그 주 월요일에 속한다 (일요일이 주 시작이 아님)', () => {
    expect(weekStart(kst('2026-09-27T10:00:00'))).toBe(kst('2026-09-21T00:00:00').getTime());
  });

  it('월요일 00:00 직전은 지난 주', () => {
    expect(weekStart(kst('2026-09-20T23:59:59'))).toBe(kst('2026-09-14T00:00:00').getTime());
  });
});

describe('msUntilReset', () => {
  it('월요일 00:00이면 정확히 7일', () => {
    expect(msUntilReset(kst('2026-09-21T00:00:00'))).toBe(7 * DAY);
  });

  it('항상 0보다 크고 7일 이하', () => {
    for (let h = 0; h < 24 * 7; h += 5) {
      const v = msUntilReset(new Date(kst('2026-09-21T00:00:00').getTime() + h * 3600000));
      expect(v).toBeGreaterThan(0);
      expect(v).toBeLessThanOrEqual(7 * DAY);
    }
  });
});

describe('daysUntilReset', () => {
  it('월요일 시작이면 7일', () => {
    expect(daysUntilReset(kst('2026-09-21T00:00:00'))).toBe(7);
  });

  it('마지막 날에도 0이 아니라 1', () => {
    expect(daysUntilReset(kst('2026-09-27T23:00:00'))).toBe(1);
  });

  it('1~7 범위를 벗어나지 않는다', () => {
    for (let h = 0; h < 24 * 7; h += 3) {
      const d = daysUntilReset(new Date(kst('2026-09-21T00:00:00').getTime() + h * 3600000));
      expect(d).toBeGreaterThanOrEqual(1);
      expect(d).toBeLessThanOrEqual(7);
    }
  });
});
