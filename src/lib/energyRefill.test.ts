import { describe, expect, it, vi } from 'vitest';
import { energyRefillPendingKeyFor, parseEnergyRefillResponse, runEnergyRefill } from './energyRefill';

const memoryStorage = (initial: Record<string, string> = {}) => {
  const map = new Map(Object.entries(initial));
  return {
    map,
    getItem: vi.fn((key: string) => Promise.resolve(map.get(key) ?? null)),
    setItem: vi.fn((key: string, value: string) => { map.set(key, value); return Promise.resolve(); }),
    removeItem: vi.fn((key: string) => { map.delete(key); return Promise.resolve(); }),
  };
};

describe('energy refill response', () => {
  it('서버 고정 600P energy_refill 응답만 허용한다', () => {
    expect(parseEnergyRefillResponse({ points: 10, cost: 600, reason: 'energy_refill' })).toBeTruthy();
    expect(parseEnergyRefillResponse({ points: 10, cost: 0, reason: 'energy_refill' })).toBeNull();
    expect(parseEnergyRefillResponse({ points: 10, cost: 600, reason: 'lesson' })).toBeNull();
  });
});

describe('runEnergyRefill', () => {
  it('pending key를 먼저 저장하고 성공하면 충전 저장 후 지운다', async () => {
    const storage = memoryStorage();
    const applyPoints = vi.fn();
    const result = await runEnergyRefill({
      profileId: 'p1',
      storage,
      keyFactory: () => 'refill-key-123456',
      rpc: vi.fn(() => Promise.resolve({ data: { points: 400, cost: 600, reason: 'energy_refill' }, error: null })),
      persistFilledEnergy: vi.fn(() => Promise.resolve(true)),
      applyPoints,
    });

    expect(result).toBe('ok');
    expect(applyPoints).toHaveBeenCalledWith(400);
    expect(storage.setItem).toHaveBeenCalledWith(energyRefillPendingKeyFor('p1'), 'refill-key-123456');
    expect(storage.map.has(energyRefillPendingKeyFor('p1'))).toBe(false);
  });

  it('로컬 충전 저장이 실패하면 pending key를 남기고 같은 key로 재시도한다', async () => {
    const keyName = energyRefillPendingKeyFor('p1');
    const storage = memoryStorage();
    const rpc = vi.fn(() => Promise.resolve({ data: { points: 400, cost: 600, reason: 'energy_refill', idempotent: false }, error: null }));

    const first = await runEnergyRefill({
      profileId: 'p1',
      storage,
      keyFactory: () => 'stable-refill-key',
      rpc,
      persistFilledEnergy: vi.fn(() => Promise.resolve(false)),
      applyPoints: vi.fn(),
    });
    expect(first).toBe('pending');
    expect(storage.map.get(keyName)).toBe('stable-refill-key');

    rpc.mockResolvedValueOnce({ data: { points: 400, cost: 600, reason: 'energy_refill', idempotent: true }, error: null });
    const second = await runEnergyRefill({
      profileId: 'p1',
      storage,
      keyFactory: () => 'different-key',
      rpc,
      persistFilledEnergy: vi.fn(() => Promise.resolve(true)),
      applyPoints: vi.fn(),
    });

    expect(second).toBe('ok');
    expect(rpc).toHaveBeenLastCalledWith('stable-refill-key');
    expect(storage.map.has(keyName)).toBe(false);
  });

  it('잔액 부족이면 pending key를 제거한다', async () => {
    const keyName = energyRefillPendingKeyFor('p1');
    const storage = memoryStorage({ [keyName]: 'old-key' });
    const result = await runEnergyRefill({
      profileId: 'p1',
      storage,
      rpc: vi.fn(() => Promise.resolve({ data: null, error: { message: 'insufficient points' } })),
      persistFilledEnergy: vi.fn(() => Promise.resolve(true)),
      applyPoints: vi.fn(),
    });

    expect(result).toBe('points');
    expect(storage.map.has(keyName)).toBe(false);
  });
});
