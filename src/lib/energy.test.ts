import { describe, expect, it } from 'vitest';
import { addEnergyState, fillEnergyState, nextEnergyAt, normalizeEnergy, spendEnergyState, spendEnergyOnce } from './energy';

describe('energy', () => {
  it('저장 후 재진입과 충전에도 시작 기록을 유지하고 중복 차감하지 않는다', () => {
    const first = spendEnergyOnce({ current: 1, updatedAt: 0 }, 1, 'lesson:1,2', 0)!;
    const restored = JSON.parse(JSON.stringify(first));
    expect(spendEnergyOnce(restored, 1, 'lesson:1,2', 0)?.current).toBe(0);
    expect(spendEnergyOnce(restored, 1, 'lesson:3,4', 0)).toBeNull();
    const filled = fillEnergyState(restored, 1000);
    expect(spendEnergyOnce(filled, 1, 'lesson:1,2', 1000)?.current).toBe(25);
    expect(spendEnergyOnce(filled, 1, 'lesson:1,2,3', 1000)?.current).toBe(24);
  });
  // 0 = 1970-01-01 09:00 KST, 그날 자정(KST)은 15시간 뒤
  const NEXT_KST_MIDNIGHT = 15 * 3_600_000;
  it('한국 시간 자정이 지나야 가득 채우고, 같은 날에는 회복하지 않는다', () => {
    expect(normalizeEnergy({ current: 3, updatedAt: 0 }, NEXT_KST_MIDNIGHT - 1, 25)).toEqual({ current: 3, updatedAt: 0 });
    expect(normalizeEnergy({ current: 3, updatedAt: 0 }, NEXT_KST_MIDNIGHT, 25)).toEqual({ current: 25, updatedAt: NEXT_KST_MIDNIGHT });
  });

  it('가득 찬 상태에서 쓰면 다음 충전은 다음 자정이다', () => {
    expect(spendEnergyState({ current: 25, updatedAt: 0 }, 1, 10_000, 25)).toEqual({ current: 24, updatedAt: 10_000 });
    expect(nextEnergyAt({ current: 24, updatedAt: 10_000 }, 10_000, 25)).toBe(NEXT_KST_MIDNIGHT);
  });

  it('부족하면 차감하지 않고 null을 돌려준다', () => {
    expect(spendEnergyState({ current: 0, updatedAt: 0 }, 1, 0, 25)).toBeNull();
  });

  it('충전은 최대치에서 멈춘다', () => {
    expect(addEnergyState({ current: 22, updatedAt: 0 }, 5, 1000, 25)).toEqual({ current: 25, updatedAt: 1000 });
  });

  it('전체 충전은 회복 타이머를 초기화하고 최대치로 채운다', () => {
    expect(fillEnergyState({ current: 3, updatedAt: 0 }, 2000, 25)).toEqual({ current: 25, updatedAt: 2000 });
  });
});
