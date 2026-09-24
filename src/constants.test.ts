import { describe, it, expect } from 'vitest';
import { GROWTH_STAGES, getGrowthStage } from './constants';

describe('getGrowthStage', () => {
  it('0XP는 브론즈(1단계)', () => {
    expect(getGrowthStage(0).name).toBe('브론즈');
  });

  it('경계값은 다음 단계 포함', () => {
    expect(getGrowthStage(19).id).toBe(1);
    expect(getGrowthStage(20).id).toBe(2);
  });

  it('최고 단계는 nextMinPoints가 null', () => {
    expect(getGrowthStage(800).name).toBe('다이아');
    expect(getGrowthStage(800).nextMinPoints).toBeNull();
    expect(getGrowthStage(999999).nextMinPoints).toBeNull();
  });

  it('모든 구간에서 단조 증가하고 빠지는 단계가 없다', () => {
    const ids = GROWTH_STAGES.map(s => getGrowthStage(s.minPoints).id);
    expect(ids).toEqual([1, 2, 3, 4, 5]);
    let prev = 0;
    for (let xp = 0; xp <= 1000; xp += 7) {
      const id = getGrowthStage(xp).id;
      expect(id).toBeGreaterThanOrEqual(prev);
      prev = id;
    }
  });

  it('nextMinPoints는 다음 단계의 기준선과 같다', () => {
    for (let i = 0; i < GROWTH_STAGES.length - 1; i++) {
      expect(getGrowthStage(GROWTH_STAGES[i].minPoints).nextMinPoints)
        .toBe(GROWTH_STAGES[i + 1].minPoints);
    }
  });
});
