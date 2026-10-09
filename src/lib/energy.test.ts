import { describe, expect, it } from 'vitest';
import { addEnergyState, fillEnergyState, nextEnergyAt, normalizeEnergy, spendEnergyState } from './energy';

describe('energy', () => {
  it('시간이 지난 만큼 회복하고 최대치를 넘지 않는다', () => {
    expect(normalizeEnergy({ current: 3, updatedAt: 0 }, 3_600_000, 25, 3_600_000)).toEqual({ current: 4, updatedAt: 3_600_000 });
    expect(normalizeEnergy({ current: 24, updatedAt: 0 }, 7_200_000, 25, 3_600_000)).toEqual({ current: 25, updatedAt: 7_200_000 });
  });

  it('가득 찬 상태에서 쓰면 다음 회복 타이머가 지금부터 시작된다', () => {
    expect(spendEnergyState({ current: 25, updatedAt: 0 }, 1, 10_000, 25, 3_600_000)).toEqual({ current: 24, updatedAt: 10_000 });
    expect(nextEnergyAt({ current: 24, updatedAt: 10_000 }, 10_000, 25, 3_600_000)).toBe(3_610_000);
  });

  it('부족하면 차감하지 않고 null을 돌려준다', () => {
    expect(spendEnergyState({ current: 0, updatedAt: 0 }, 1, 0, 25, 3_600_000)).toBeNull();
  });

  it('충전은 최대치에서 멈춘다', () => {
    expect(addEnergyState({ current: 22, updatedAt: 0 }, 5, 1000, 25, 3_600_000)).toEqual({ current: 25, updatedAt: 1000 });
  });

  it('전체 충전은 회복 타이머를 초기화하고 최대치로 채운다', () => {
    expect(fillEnergyState({ current: 3, updatedAt: 0 }, 2000, 25, 3_600_000)).toEqual({ current: 25, updatedAt: 2000 });
  });
});
