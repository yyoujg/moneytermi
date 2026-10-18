import { useEffect, useMemo, useState } from 'react';
import { X } from '../ui/OtterIcons';
import { useAppContext } from '../../context/AppContext';
import { useAuth } from '../../hooks/useAuth';
import { feedbackCelebrate } from '../../lib/feedback';
import { logClick } from '../../lib/analytics';
import { weekStart } from '../../lib/league';
import { Storage } from '../../lib/storage';
import { getGuestClient, supabase } from '../../lib/supabase';
import { ProfileAvatar } from '../ProfileAvatar';
import { leagueRankSeenKey } from './leagueRankStorage';

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
  const { hydrated, xp, myEmoji } = useAppContext();
  const { user, guestToken } = useAuth();
  const [rankUp, setRankUp] = useState<RankUp | null>(null);
  const storageKey = useMemo(() => user ? leagueRankSeenKey(user.id, weekStart()) : null, [user]);

  useEffect(() => {
    if (!hydrated || !user || !storageKey) return;
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
  }, [guestToken, hydrated, storageKey, user, xp]);

  if (!rankUp) return null;

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
          <button
            type="button"
            aria-label="닫기"
            onClick={close}
            className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-surface)] text-[var(--color-ink-3)] active:opacity-80"
          >
            <X size={16} strokeWidth={2.4} />
          </button>

          <div className="relative">
            <div className="absolute -inset-3 rounded-full bg-[var(--color-brand-soft)]" />
            <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-[var(--color-card)] shadow-sm">
              <ProfileAvatar emoji={myEmoji} size={64} />
            </div>
          </div>

          <p className="mt-5! text-xs font-black text-brand-600">주간 순위 상승</p>
          <h2 id="league-rank-up-title" className="mt-1! text-2xl font-black text-[var(--color-ink)]">
            순위가 올랐어요
          </h2>
          <div className="mt-4 flex items-center justify-center gap-3">
            <span className="rounded-chip bg-[var(--color-surface)] px-4 py-2 text-lg font-black text-[var(--color-ink-3)] tabular-nums">
              {rankUp.fromRank}위
            </span>
            <span className="text-xl font-black text-brand-500">→</span>
            <span className="rounded-chip bg-brand-500 px-4 py-2 text-lg font-black text-white tabular-nums">
              {rankUp.toRank}위
            </span>
          </div>
          <p className="mt-4! text-sm leading-relaxed text-[var(--color-ink-3)] break-keep">
            이번 주 {rankUp.points.toLocaleString()}XP로 {rankUp.total.toLocaleString()}명 중 {rankUp.toRank}위예요.
          </p>

          <button
            type="button"
            onClick={close}
            className="mt-5 w-full rounded-button bg-brand-500 py-4 text-sm font-bold text-white active:opacity-90"
          >
            좋아요
          </button>
        </div>
      </div>
    </div>
  );
};
