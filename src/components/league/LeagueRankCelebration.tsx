import { ActionButton } from '../ui/ActionButton';
import { useEffect, useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { useAuth } from '../../hooks/useAuth';
import { feedbackCelebrate } from '../../lib/feedback';
import { logClick } from '../../lib/analytics';
import { weekStart } from '../../lib/league';
import { Storage } from '../../lib/storage';
import { getGuestClient, supabase } from '../../lib/supabase';
import { leagueRankSeenKey } from './leagueRankStorage';
import { useModalTurn } from '../../lib/modalTurn';

type MyRank = { rank: number | null; total: number; points: number };
type RankUp = { fromRank: number; toRank: number; total: number; points: number };

const normalizeRank = (data: unknown): MyRank | null => {
  const row = Array.isArray(data) ? data[0] : data;
  if (!row || typeof row !== 'object') return null;
  const rank = (row as MyRank).rank;
  if (typeof rank !== 'number' || rank < 1) return null;
  return {
    rank,
    total: Math.max(0, Number((row as MyRank).total) || 0),
    points: Math.max(0, Number((row as MyRank).points) || 0),
  };
};

export const LeagueRankCelebration = () => {
  const { hydrated, xp } = useAppContext();
  const { user, guestToken } = useAuth();
  const [rankUp, setRankUp] = useState<RankUp | null>(null);

  useEffect(() => {
    if (!hydrated || !user) return;
    // 주가 바뀐 뒤에도 앱을 켜 둔 채면 지난주 키와 비교하지 않게 매번 이번 주 키를 계산한다
    const storageKey = leagueRankSeenKey(user.id, weekStart());
    let cancelled = false;
    const db = guestToken ? getGuestClient(guestToken) : supabase;

    Promise.resolve(db.rpc('my_league_rank'))
      .then(async ({ data, error }) => {
        if (cancelled || error) return;
        const current = normalizeRank(data);
        if (!current?.rank) return;

        const raw = await Storage.getItem(storageKey).catch(() => null);
        if (cancelled) return;
        const previousRank = raw === null ? null : Number(raw);
        await Storage.setItem(storageKey, String(current.rank)).catch(() => {});

        if (!previousRank || current.rank >= previousRank) return;
        setRankUp({
          fromRank: previousRank,
          toRank: current.rank,
          total: current.total,
          points: current.points,
        });
        feedbackCelebrate();
        logClick('league_rank_up_modal_view', {
          from: previousRank,
          to: current.rank,
          total: current.total,
          weekly_xp: current.points,
        });
      })
      .catch(() => {});

    return () => { cancelled = true; };
  }, [guestToken, hydrated, user, xp]);

  const myTurn = useModalTurn(!!rankUp);
  if (!rankUp || !myTurn) return null;

  const close = () => {
    logClick('league_rank_up_modal_close', { to: rankUp.toRank, weekly_xp: rankUp.points });
    setRankUp(null);
  };

  return (
    <div
      className="fixed inset-0 z-[72] flex items-center justify-center bg-[var(--color-overlay)] px-6"
      role="presentation"
      onClick={close}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="league-rank-up-title"
        onClick={e => e.stopPropagation()}
        className="app-card w-full max-w-xs overflow-hidden rounded-card bg-[var(--color-card)] anim-pop-in"
      >
        <div className="relative flex flex-col items-center px-5 pb-5 pt-6 text-center">
          <p className="text-xs text-[var(--color-ink-3)]">주간 순위 상승</p>
          <h2 id="league-rank-up-title" className="mt-1! text-xl font-bold text-[var(--color-ink)]">
            순위가 올랐어요
          </h2>
          <div className="mt-4 flex items-center justify-center gap-3">
            <span className="text-lg font-semibold text-[var(--color-ink-3)] tabular-nums">
              {rankUp.fromRank}위
            </span>
            <span className="text-lg text-[var(--color-ink-3)]" aria-hidden="true">→</span>
            <span className="text-2xl font-bold text-[var(--color-ink)] tabular-nums">
              {rankUp.toRank}위
            </span>
          </div>
          <p className="mt-4! text-sm leading-relaxed text-[var(--color-ink-3)] break-keep">
            이번 주 {rankUp.points.toLocaleString()}XP로 {rankUp.total.toLocaleString()}명 중 {rankUp.toRank}위예요.
          </p>

          <ActionButton fullWidth onClick={close} className="mt-5">좋아요</ActionButton>
        </div>
      </div>
    </div>
  );
};
