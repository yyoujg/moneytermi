import { ENERGY_MAX } from '../constants';

export type EnergyState = {
  current: number;
  updatedAt: number;
  startedNodeKeys?: string[];
};

const clamp = (value: number, max = ENERGY_MAX) => Math.min(max, Math.max(0, Math.floor(value)));

// 하루에 한 번, 한국 시간 자정이 지나면 가득 채운다.
const DAY_MS = 24 * 60 * 60 * 1000;
const KST_OFFSET_MS = 9 * 60 * 60 * 1000;
const kstDay = (ms: number) => Math.floor((ms + KST_OFFSET_MS) / DAY_MS);

export const normalizeEnergy = (
  state: EnergyState,
  now = Date.now(),
  max = ENERGY_MAX,
): EnergyState => {
  const current = clamp(state.current, max);
  if (current >= max) return { ...state, current: max, updatedAt: now };
  const updatedAt = Number.isFinite(state.updatedAt) ? state.updatedAt : now;
  if (kstDay(now) > kstDay(updatedAt)) return { ...state, current: max, updatedAt: now };
  return { ...state, current, updatedAt };
};

export const nextEnergyAt = (
  state: EnergyState,
  now = Date.now(),
  max = ENERGY_MAX,
): number | null => {
  const normalized = normalizeEnergy(state, now, max);
  return normalized.current >= max ? null : (kstDay(now) + 1) * DAY_MS - KST_OFFSET_MS;
};

export const spendEnergyState = (
  state: EnergyState,
  amount: number,
  now = Date.now(),
  max = ENERGY_MAX,
): EnergyState | null => {
  const normalized = normalizeEnergy(state, now, max);
  const cost = clamp(amount, max);
  if (cost <= 0) return normalized;
  if (normalized.current < cost) return null;
  return {
    ...normalized,
    current: normalized.current - cost,
    updatedAt: normalized.current >= max ? now : normalized.updatedAt,
  };
};

export const addEnergyState = (
  state: EnergyState,
  amount: number,
  now = Date.now(),
  max = ENERGY_MAX,
): EnergyState => {
  const normalized = normalizeEnergy(state, now, max);
  const current = clamp(normalized.current + Math.max(0, Math.floor(amount)), max);
  return {
    ...normalized,
    current,
    updatedAt: current >= max ? now : normalized.updatedAt,
  };
};

export const fillEnergyState = (
  state: EnergyState,
  now = Date.now(),
  max = ENERGY_MAX,
): EnergyState => addEnergyState(state, max, now, max);

export const spendEnergyOnce = (state: EnergyState, amount: number, accessKey: string, now = Date.now()): EnergyState | null => {
  if (state.startedNodeKeys?.includes(accessKey)) return normalizeEnergy(state, now);
  const next = spendEnergyState(state, amount, now);
  return next ? { ...next, startedNodeKeys: [...(next.startedNodeKeys ?? []), accessKey] } : null;
};
