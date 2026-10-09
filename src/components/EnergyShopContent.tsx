import { ChevronsUp, Lock, Tv, Zap } from 'lucide-react';
import { ENERGY_AD_REWARD, ENERGY_REFILL_COST, LESSON_COST, XP_BONUS_POINTS, XP_BONUS_STEP } from '../constants';
import { PointIcon } from './StatIcons';

export type EnergyRefillNotice = {
  tone: 'points' | 'network' | 'info';
  text: string;
} | null;

type Props = {
  points: number;
  energy: number;
  energyMax: number;
  energyLeft: number;
  boostLeft: number;
  refillPending: boolean;
  refillNotice: EnergyRefillNotice;
  onEnergyAd: () => void;
  onEnergyRefill: () => void;
  onBoost: () => void;
};

const formatEnergyLeft = (ms: number) => {
  const total = Math.max(1, Math.ceil(ms / 60000));
  const h = Math.floor(total / 60);
  const m = total % 60;
  return h > 0 ? `${h}시간 ${m}분` : `${m}분`;
};

const getEnergyRefillState = (points: number, energy: number, energyMax: number, refillPending = false) => {
  const full = energy >= energyMax;
  const shortfall = Math.max(0, ENERGY_REFILL_COST - points);
  return {
    full,
    shortfall,
    canRefill: !full && shortfall === 0 && !refillPending,
    buttonHint: full ? '가득 찼어요' : refillPending ? '충전 중' : shortfall > 0 ? `${shortfall.toLocaleString()}P 부족` : `${ENERGY_REFILL_COST.toLocaleString()}P`,
  };
};

export const EnergyShopContent = ({
  points,
  energy,
  energyMax,
  energyLeft,
  boostLeft,
  refillPending,
  refillNotice,
  onEnergyAd,
  onEnergyRefill,
  onBoost,
}: Props) => {
  const refill = getEnergyRefillState(points, energy, energyMax, refillPending);
  const energyPercent = energyMax > 0 ? Math.min(100, Math.max(0, (energy / energyMax) * 100)) : 0;
  const statusText = refill.full ? '충전 완료' : '충전 중';
  const statusClass = refill.full
    ? 'bg-[var(--color-success-soft)] text-success-500'
    : 'bg-[var(--color-brand-soft)] text-[var(--color-brand-ink)]';
  const progressClass = refill.full ? 'bg-success-500' : 'bg-brand-500';
  const pointCardClass = refill.shortfall > 0
    ? 'border-brand-200 bg-[var(--color-brand-soft)]'
    : 'border-[var(--color-line)] bg-[var(--color-card)]';
  const refillButtonClass = refill.canRefill
    ? 'border-brand-200 bg-[var(--color-brand-soft)] text-[var(--color-brand-ink)] active:opacity-70'
    : 'border-transparent bg-[var(--color-button-secondary)] text-[var(--color-ink-4)]';
  const noticeClass = refillNotice?.tone === 'network'
    ? 'border-danger-300 bg-danger-500/10 text-danger-500'
    : refillNotice?.tone === 'points'
      ? 'border-brand-200 bg-[var(--color-brand-soft)] text-[var(--color-brand-ink)]'
      : 'border-[var(--color-line)] bg-[var(--color-surface)] text-[var(--color-ink-3)]';

  return (
    <div className="px-5 pb-6 flex flex-col gap-2">
      <div className="mb-2 rounded-card bg-[var(--color-surface)] px-4 py-4">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm font-bold text-[var(--color-ink)]">에너지</p>
            <p className={`mt-1 inline-flex items-center rounded-full px-2.5 py-1 text-2xs font-bold ${statusClass}`}>
              {statusText}
            </p>
          </div>
          <p className={`flex items-center gap-1 text-sm font-black ${refill.full ? 'text-success-500' : 'text-[var(--color-brand-ink)]'}`}>
            <Zap size={16} className="fill-current" />{energy}/{energyMax}
          </p>
        </div>
        <div
          role="progressbar"
          aria-label="에너지 충전 진행률"
          aria-valuemin={0}
          aria-valuemax={energyMax}
          aria-valuenow={energy}
          className="mt-3 h-3 overflow-hidden rounded-full bg-[var(--color-card)]"
        >
          <div className={`h-full rounded-full transition-all duration-500 ${progressClass}`} style={{ width: `${energyPercent}%` }} />
        </div>
        <p className="mt-2! text-2xs font-semibold text-[var(--color-ink-4)]">
          {refill.full ? '가득 차면 자동 충전은 잠시 멈춰요' : `다음 충전: ${formatEnergyLeft(energyLeft)} 후`}
        </p>
      </div>

      <div className={`rounded-chip border px-4 py-3 ${pointCardClass}`} role="status" aria-live="polite">
        <div className="flex items-center justify-between gap-3">
          <span className="text-2xs font-bold text-[var(--color-ink-3)]">보유 포인트</span>
          <span className="flex items-center gap-1 text-sm font-black text-[var(--color-ink)]">
            <PointIcon size={13} />{points.toLocaleString()}P
          </span>
        </div>
        <p id="energy-refill-status" className="mt-1! text-2xs leading-relaxed text-[var(--color-ink-3)] break-keep">
          {refill.full
            ? '에너지가 가득해서 지금은 충전할 필요가 없어요.'
            : refill.shortfall > 0
              ? `${refill.shortfall.toLocaleString()}P 부족해요. 포인트를 더 모으면 구매 버튼이 열려요.`
              : `${ENERGY_REFILL_COST.toLocaleString()}P로 지금 바로 완충할 수 있어요.`}
        </p>
      </div>

      <button
        onClick={onEnergyAd}
        disabled={refill.full}
        className="grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-chip bg-brand-500 px-4 py-4 text-sm font-bold active:opacity-70 disabled:opacity-60"
      >
        <span className="flex min-w-0 items-center gap-2 text-left leading-5"><Tv size={18} className="shrink-0" />광고 보고 에너지 받기</span>
        <span className="shrink-0 text-right text-2xs font-medium leading-4">+{ENERGY_AD_REWARD}</span>
      </button>
      <button
        onClick={onEnergyRefill}
        disabled={!refill.canRefill}
        aria-describedby="energy-refill-status"
        className={`grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-chip border px-4 py-4 text-sm font-bold disabled:opacity-100 ${refillButtonClass}`}
      >
        <span className="flex min-w-0 items-center gap-2 text-left leading-5"><Lock size={18} className="shrink-0" />에너지 모두 충전</span>
        <span className="shrink-0 text-right text-2xs font-bold leading-4">{refill.buttonHint}</span>
      </button>

      {refillNotice && (
        <div role={refillNotice.tone === 'network' ? 'alert' : 'status'} className={`rounded-chip border px-4 py-3 text-2xs font-bold leading-relaxed break-keep ${noticeClass}`}>
          {refillNotice.text}
        </div>
      )}

      <button
        onClick={onBoost}
        disabled={points < 300 || boostLeft > 0}
        className="grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-chip bg-[var(--color-button-secondary)] px-4 py-4 text-sm font-bold text-[var(--color-ink-2)] active:opacity-70 disabled:opacity-60"
      >
        <span className="flex min-w-0 items-center gap-2 text-left leading-5"><ChevronsUp size={18} className="shrink-0" />{boostLeft > 0 ? '부스트 사용 중' : 'XP 2배 부스트'}</span>
        <span className="shrink-0 text-right text-2xs font-medium leading-4">
          {boostLeft > 0
            ? `${Math.floor(boostLeft / 60000)}:${String(Math.floor((boostLeft % 60000) / 1000)).padStart(2, '0')} 남음`
            : points < 300 ? `${(300 - points).toLocaleString()}P 더 필요` : '300P · 30분'}
        </span>
      </button>

      <div className="rounded-chip px-4 py-3 mt-1" style={{ backgroundColor: 'var(--color-surface)' }}>
        <p className="text-2xs font-bold text-[var(--color-ink-3)] mb-1!">학습으로 모으기</p>
        <p className="text-2xs text-[var(--color-ink-4)] leading-relaxed break-keep">
          퀴즈 정답 +10~20P · 미션 보상 +10~50P · XP {XP_BONUS_STEP}마다 +{XP_BONUS_POINTS}P
        </p>
      </div>
      <p className="text-2xs text-[var(--color-ink-4)] mt-1 leading-relaxed">
        첫 레슨은 무료예요. 이후 레슨 시작에 {LESSON_COST}P가 들어요. 학습·퀴즈 시작에는 에너지 1이 들고, 복습은 무료예요. 포인트는 순위에 반영되지 않아요.
      </p>
    </div>
  );
};
