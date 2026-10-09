import { ENERGY_REFILL_COST } from '../constants';

export type EnergyRefillResult = 'ok' | 'pending' | 'points' | 'fail';

export type EnergyRefillResponse = {
  points: number;
  cost: number;
  reason: string;
  idempotent?: boolean;
};

type StorageLike = {
  getItem: (key: string) => Promise<string | null>;
  setItem: (key: string, value: string) => Promise<void>;
  removeItem: (key: string) => Promise<void>;
};

type RunEnergyRefillOptions = {
  profileId: string;
  storage: StorageLike;
  rpc: (idempotencyKey: string) => Promise<{ data: EnergyRefillResponse | null; error: { message?: string } | null }>;
  persistFilledEnergy: () => Promise<boolean>;
  applyPoints: (points: number) => void;
  keyFactory?: () => string;
};

export const energyRefillPendingKeyFor = (profileId: string) => `moneytermi_energy_v1:pending_refill:${profileId}`;

export const newEnergyRefillIdempotencyKey = () => {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  const bytes = new Uint32Array(4);
  if (globalThis.crypto?.getRandomValues) {
    globalThis.crypto.getRandomValues(bytes);
    return `energy-refill-${Array.from(bytes, n => n.toString(36)).join('-')}`;
  }
  return `energy-refill-${Date.now()}`;
};

export const parseEnergyRefillResponse = (data: EnergyRefillResponse | null): EnergyRefillResponse | null => {
  if (!data) return null;
  if (data.cost !== ENERGY_REFILL_COST) return null;
  if (data.reason !== 'energy_refill') return null;
  if (!Number.isFinite(data.points) || data.points < 0) return null;
  return data;
};

export const runEnergyRefill = async ({
  profileId,
  storage,
  rpc,
  persistFilledEnergy,
  applyPoints,
  keyFactory = newEnergyRefillIdempotencyKey,
}: RunEnergyRefillOptions): Promise<EnergyRefillResult> => {
  const pendingKeyName = energyRefillPendingKeyFor(profileId);
  let idempotencyKey = await storage.getItem(pendingKeyName).catch(() => null);
  if (!idempotencyKey) {
    idempotencyKey = keyFactory();
    try {
      await storage.setItem(pendingKeyName, idempotencyKey);
    } catch {
      return 'fail';
    }
  }

  const { data, error } = await rpc(idempotencyKey);
  if (error) {
    if (error.message?.includes('insufficient points')) {
      await storage.removeItem(pendingKeyName).catch(() => {});
      return 'points';
    }
    return 'fail';
  }

  const parsed = parseEnergyRefillResponse(data);
  if (!parsed) return 'fail';

  applyPoints(parsed.points);
  const saved = await persistFilledEnergy();
  if (!saved) return 'pending';

  await storage.removeItem(pendingKeyName).catch(() => {});
  return 'ok';
};
