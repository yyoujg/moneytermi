import { describe, it, expect } from 'vitest';
import { GROWTH_STAGES, getGrowthStage } from './constants';

describe('getGrowthStage', () => {
  it('이름만 수달 성장 단계로 바꾸고 기존 식별자와 기준을 보존한다', () => {
    expect(GROWTH_STAGES.map(({ id, name, minPoints }) => ({ id, name, minPoints }))).toEqual([
      { id: 1, name: '아기수달', minPoints: 0 },
      { id: 2, name: '꼬마수달', minPoints: 20 },
      { id: 3, name: '탐험수달', minPoints: 100 },
      { id: 4, name: '척척수달', minPoints: 300 },
      { id: 5, name: '박사수달', minPoints: 800 },
    ]);
  });

  it('다섯 단계의 진입 직전과 진입 시점을 유지한다', () => {
    for (const stage of GROWTH_STAGES) {
      expect(getGrowthStage(stage.minPoints).id).toBe(stage.id);
      if (stage.id > 1) expect(getGrowthStage(stage.minPoints - 1).id).toBe(stage.id - 1);
    }
  });

  it('0XP는 아기수달(1단계)', () => {
    expect(getGrowthStage(0).name).toBe('아기수달');
  });

  it('경계값은 다음 단계 포함', () => {
    expect(getGrowthStage(19).id).toBe(1);
    expect(getGrowthStage(20).id).toBe(2);
  });

  it('최고 단계는 nextMinPoints가 null', () => {
    expect(getGrowthStage(800).name).toBe('박사수달');
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
