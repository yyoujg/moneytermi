import { useEffect, useMemo, useState } from 'react';
import { X } from 'lucide-react';
import { getGrowthStage, GROWTH_STAGES, type GrowthStage } from '../../constants';
import { useAppContext } from '../../context/AppContext';
import { feedbackTierUp } from '../../lib/feedback';
import { logClick } from '../../lib/analytics';
import { Storage } from '../../lib/storage';
import { StageGlyph } from '../StageGlyph';

const KEY = 'league_promotion_seen_stage_v1';

export const LeaguePromotionCelebration = () => {
  const { hydrated, xp } = useAppContext();
  const currentStage = useMemo(() => getGrowthStage(xp), [xp]);
  const previousStage = useMemo(() => GROWTH_STAGES.find(stage => stage.id === currentStage.id - 1) ?? null, [currentStage.id]);
  const [promotion, setPromotion] = useState<{ from: GrowthStage | null; to: GrowthStage } | null>(null);

  useEffect(() => {
    if (!hydrated) return;
    let cancelled = false;
    Storage.getItem(KEY).catch(() => null).then(raw => {
      if (cancelled) return;
      const seenId = raw === null ? null : Math.max(0, Number(raw) || 0);
      void Storage.setItem(KEY, String(currentStage.id)).catch(() => {});
      if (seenId === null || currentStage.id <= seenId) return;
      const from = GROWTH_STAGES.find(stage => stage.id === seenId) ?? previousStage;
      setPromotion({ from: from ? { ...from, nextMinPoints: currentStage.minPoints } : null, to: currentStage });
      feedbackTierUp();
      logClick('league_promotion_modal_view', { from: seenId, to: currentStage.id, xp });
    });
    return () => { cancelled = true; };
  }, [currentStage, hydrated, previousStage, xp]);

  if (!promotion) return null;

  const close = () => {
    logClick('league_promotion_modal_close', { to: promotion.to.id, xp });
    setPromotion(null);
  };

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/55 px-6"
      role="presentation"
      onClick={close}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="league-promotion-title"
        onClick={e => e.stopPropagation()}
        className="w-full max-w-xs overflow-hidden rounded-card bg-[var(--color-card)] anim-pop-in"
      >
        <div className="relative flex flex-col items-center px-5 pb-5 pt-6 text-center">
          <button
            type="button"
            aria-label="닫기"
            onClick={close}
            className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-surface)] text-[var(--color-ink-3)] active:opacity-80"
          >
            <X size={16} strokeWidth={2.4} />
          </button>

          <div className="flex items-center justify-center gap-3">
            {promotion.from && <StageGlyph id={promotion.from.id} size={52} className="opacity-45 grayscale" />}
            <span className="text-xl font-black text-brand-500">→</span>
            <StageGlyph id={promotion.to.id} size={76} className="anim-pop-in" />
          </div>

          <p className="mt-4! text-xs font-black text-brand-600">리그 승급</p>
          <h2 id="league-promotion-title" className="mt-1! text-2xl font-black text-[var(--color-ink)]">
            {promotion.to.name} 리그에 올라갔어요
          </h2>
          <p className="mt-2! text-sm leading-relaxed text-[var(--color-ink-3)] break-keep">
            지금까지 쌓은 XP가 다음 단계에 닿았어요. 꾸준히 이어온 기록이 보여요.
          </p>

          <div className="mt-4 w-full rounded-chip bg-[var(--color-surface)] px-4 py-3">
            <p className="text-2xs font-bold text-[var(--color-ink-4)]">현재 누적 XP</p>
            <p className="mt-1! text-xl font-black text-brand-500 tabular-nums">{xp.toLocaleString()}XP</p>
          </div>

          <button
            type="button"
            onClick={close}
            className="mt-4 w-full rounded-button bg-brand-500 py-4 text-sm font-bold text-white active:opacity-90"
          >
            좋아요
          </button>
        </div>
      </div>
    </div>
  );
};
