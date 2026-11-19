import { useEffect, useMemo, useState } from 'react';
import { getGrowthStage, GROWTH_STAGES, type GrowthStage } from '../../constants';
import { useAppContext } from '../../context/AppContext';
import { feedbackTierUp } from '../../lib/feedback';
import { logClick } from '../../lib/analytics';
import { Storage } from '../../lib/storage';
import { StageGlyph } from '../StageGlyph';
import { useModalTurn } from '../../lib/modalTurn';
import { CelebrationScreen } from '../CelebrationScreen';

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
    <CelebrationScreen
      label="리그 승급"
      title={`${promotion.to.name} 리그 입성!`}
      subtitle="리그 승급"
      art={<StageGlyph id={promotion.to.id} size={172} />}
      record={<p className="celebration-record">누적 {xp.toLocaleString()} XP</p>}
      description="지난주 내 리그 TOP 3 달성! 이번 주도 같이 달려보자."
      shareCard={{ kind: 'league', title: '새로운 리그 입성!', value: promotion.to.name, unit: '리그 승급', description: '지난주 내 리그 TOP 3 달성!', stats: [{ label: '누적 경험치', value: `${xp.toLocaleString()} XP` }] }}
      onClose={close}
    />
  );
};
