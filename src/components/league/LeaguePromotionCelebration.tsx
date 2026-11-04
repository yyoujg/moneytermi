import { ActionButton } from '../ui/ActionButton';
import { useEffect, useMemo, useState } from 'react';
import { getGrowthStage, GROWTH_STAGES, type GrowthStage } from '../../constants';
import { useAppContext } from '../../context/AppContext';
import { feedbackTierUp } from '../../lib/feedback';
import { logClick } from '../../lib/analytics';
import { Storage } from '../../lib/storage';
import { StageGlyph } from '../StageGlyph';
import { useModalTurn } from '../../lib/modalTurn';

const KEY = 'league_promotion_seen_stage_v1';

export const LeaguePromotionCelebration = () => {
  const { hydrated, xp, leagueStage } = useAppContext();
  const currentStage = useMemo(() => getGrowthStage(leagueStage ?? 1), [leagueStage]);
  const previousStage = useMemo(() => GROWTH_STAGES.find(stage => stage.id === currentStage.id - 1) ?? null, [currentStage.id]);
  const [promotion, setPromotion] = useState<{ from: GrowthStage | null; to: GrowthStage } | null>(null);

  useEffect(() => {
    // 서버 등급을 읽기 전 기본값(1단계)을 저장하면 다음에 읽은 실제 등급을 승급으로 착각한다
    if (!hydrated || leagueStage === null) return;
    let cancelled = false;
    Storage.getItem(KEY).catch(() => null).then(raw => {
      if (cancelled) return;
      const seenId = raw === null ? null : Math.max(0, Number(raw) || 0);
      void Storage.setItem(KEY, String(currentStage.id)).catch(() => {});
      if (seenId === null || currentStage.id <= seenId) return;
      const from = GROWTH_STAGES.find(stage => stage.id === seenId) ?? previousStage;
      setPromotion({ from, to: currentStage });
      feedbackTierUp();
      logClick('league_promotion_modal_view', { from: seenId, to: currentStage.id, xp });
    });
    return () => { cancelled = true; };
  }, [currentStage, hydrated, leagueStage, previousStage, xp]);

  const myTurn = useModalTurn(!!promotion);
  if (!promotion || !myTurn) return null;

  const close = () => {
    logClick('league_promotion_modal_close', { to: promotion.to.id, xp });
    setPromotion(null);
  };

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-[var(--color-overlay)] px-6"
      role="presentation"
      onClick={close}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="league-promotion-title"
        onClick={e => e.stopPropagation()}
        className="app-card w-full max-w-xs overflow-hidden rounded-card bg-[var(--color-card)] anim-pop-in"
      >
        <div className="relative flex flex-col items-center px-5 pb-5 pt-6 text-center">
          <div className="flex items-center justify-center gap-3">
            {promotion.from && <StageGlyph id={promotion.from.id} size={52} className="opacity-45 grayscale" />}
            <span className="text-lg text-[var(--color-ink-3)]" aria-hidden="true">→</span>
            <StageGlyph id={promotion.to.id} size={76} className="anim-pop-in" />
          </div>

          <p className="mt-4! text-xs text-[var(--color-ink-3)]">리그 승급</p>
          <h2 id="league-promotion-title" className="mt-1! text-xl font-bold text-[var(--color-ink)]">
            {promotion.to.name} 리그에 올라갔어요
          </h2>
          <p className="mt-2! text-sm leading-relaxed text-[var(--color-ink-3)] break-keep">
            지난주 순위 3위 안에 들었어요. 이번 주에도 순위를 지켜 봐요.
          </p>

          <p className="mt-4! text-xs text-[var(--color-ink-3)]">현재 누적 <span className="font-semibold text-[var(--color-ink)] tabular-nums">{xp.toLocaleString()}XP</span></p>

          <ActionButton fullWidth onClick={close} className="mt-5">좋아요</ActionButton>
        </div>
      </div>
    </div>
  );
};
