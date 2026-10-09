import { ENERGY_MAX, ENERGY_REGEN_MS } from '../constants';

export type EnergyState = {
  current: number;
  updatedAt: number;
};

const clamp = (value: number, max = ENERGY_MAX) => Math.min(max, Math.max(0, Math.floor(value)));

export const normalizeEnergy = (
  state: EnergyState,
  now = Date.now(),
  max = ENERGY_MAX,
  regenMs = ENERGY_REGEN_MS,
): EnergyState => {
  const current = clamp(state.current, max);
  if (current >= max) return { current: max, updatedAt: now };
  const updatedAt = Number.isFinite(state.updatedAt) ? state.updatedAt : now;
  const recovered = Math.floor(Math.max(0, now - updatedAt) / regenMs);
  if (recovered <= 0) return { current, updatedAt };
  const nextCurrent = clamp(current + recovered, max);
  return {
    current: nextCurrent,
    updatedAt: nextCurrent >= max ? now : updatedAt + recovered * regenMs,
  };
};

export const nextEnergyAt = (
  state: EnergyState,
  now = Date.now(),
  max = ENERGY_MAX,
  regenMs = ENERGY_REGEN_MS,
): number | null => {
  const normalized = normalizeEnergy(state, now, max, regenMs);
  return normalized.current >= max ? null : normalized.updatedAt + regenMs;
};

export const spendEnergyState = (
  state: EnergyState,
  amount: number,
  now = Date.now(),
  max = ENERGY_MAX,
  regenMs = ENERGY_REGEN_MS,
): EnergyState | null => {
  const normalized = normalizeEnergy(state, now, max, regenMs);
  const cost = clamp(amount, max);
  if (cost <= 0) return normalized;
  if (normalized.current < cost) return null;
  return {
    current: normalized.current - cost,
    updatedAt: normalized.current >= max ? now : normalized.updatedAt,
  };
};

export const addEnergyState = (
  state: EnergyState,
  amount: number,
  now = Date.now(),
  max = ENERGY_MAX,
  regenMs = ENERGY_REGEN_MS,
): EnergyState => {
  const normalized = normalizeEnergy(state, now, max, regenMs);
  const current = clamp(normalized.current + Math.max(0, Math.floor(amount)), max);
  return {
    current,
    updatedAt: current >= max ? now : normalized.updatedAt,
  };
};

export const fillEnergyState = (
  state: EnergyState,
  now = Date.now(),
  max = ENERGY_MAX,
  regenMs = ENERGY_REGEN_MS,
): EnergyState => addEnergyState(state, max, now, max, regenMs);
