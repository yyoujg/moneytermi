import { describe, it, expect } from 'vitest';
import { getGrowthStage } from './constants';

describe('getGrowthStage', () => {
  it('0P는 알개미(1단계)', () => {
    expect(getGrowthStage(0).name).toBe('알개미');
  });

  it('경계값은 다음 단계 포함', () => {
    expect(getGrowthStage(99).id).toBe(1);
    expect(getGrowthStage(100).id).toBe(2);
  });

  it('최고 단계는 nextMinPoints가 null', () => {
    expect(getGrowthStage(4000).name).toBe('슈퍼개미');
    expect(getGrowthStage(4000).nextMinPoints).toBeNull();
    expect(getGrowthStage(999999).nextMinPoints).toBeNull();
  });
});
