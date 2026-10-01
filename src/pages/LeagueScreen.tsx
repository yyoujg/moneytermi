import { useEffect, useState } from 'react';
import { CalendarDays, ChevronRight, Crown, Info, Share2, Star } from 'lucide-react';
import { BottomSheet, TextButton, Spacing } from '@toss/tds-mobile';
import { GROWTH_STAGES, getGrowthStage } from '../constants';
import { useAppContext } from '../context/AppContext';
import { useAuth } from '../hooks/useAuth';
import { supabase, getGuestClient } from '../lib/supabase';
import { logClick } from '../lib/analytics';
import { shareTossLink } from '../lib/share';
import { daysUntilReset, weekStart } from '../lib/league';
import { Storage } from '../lib/storage';
import { RollingNumber } from '../components/RollingNumber';
import { StageGlyph } from '../components/StageGlyph';
import { WeeklyRecap, type WeekSnapshot } from '../components/WeeklyRecap';

const SNAP_KEY = 'league_snapshot';   // 지난번 본 내 순위(이번 주 변동 표시·지난주 결과 스토리용)
import { Card } from '../components/ui/Card';
import { LeagueRules } from '../components/LeagueRules';

type Row = { rank: number; nickname: string; emoji: string; points: number; is_me: boolean };
type MyRank = { rank: number | null; total: number; points: number };

// 공유 문구: 이번 주 성과가 있으면 그걸 앞세운다
const shareMessage = (tier: string, weeklyXp: number, rank: number | null | undefined) =>
  rank
    ? `이번 주 ${weeklyXp.toLocaleString()}XP로 리그 ${rank}위! 머니터미에서 경제 용어 같이 배워요`
    : weeklyXp > 0
      ? `이번 주 ${weeklyXp.toLocaleString()}XP 모았어요. 머니터미에서 경제 용어 같이 배워요`
      : `머니터미에서 경제 용어 배우고 ${tier} 리그부터 올라가봐요!`;

const LeagueScreen = () => {
  const { xp, myEmoji } = useAppContext();
  const { user, guestToken } = useAuth();
  const [rows, setRows] = useState<Row[] | null>(null);
  const [mine, setMine] = useState<MyRank | null>(null);
  const [failed, setFailed] = useState(false);
  const [sheet, setSheet] = useState<'share' | 'rules' | null>(null);
  const [rankDelta, setRankDelta] = useState(0);            // +면 순위 상승
  const [recap, setRecap] = useState<WeekSnapshot | null>(null);
  const [showAllRanks, setShowAllRanks] = useState(false);

  // 순위를 받으면 지난 기록과 비교: 같은 주면 순위 변동, 지난주 기록이면 결과 스토리. 그리고 지금 값을 기록
  useEffect(() => {
    if (!mine) return;
    const week = weekStart();
    Storage.getItem(SNAP_KEY).catch(() => null).then(raw => {
      const prev: WeekSnapshot | null = raw ? JSON.parse(raw) : null;
      // 변동이 있을 때만 바꾼다(개발 모드 이중 실행에서 두 번째 호출이 방금 쓴 기록과 비교해 0으로 덮지 않게)
      if (prev?.week === week && prev.rank && mine.rank && prev.rank !== mine.rank) setRankDelta(prev.rank - mine.rank);
      if (prev && prev.week < week && prev.points > 0) setRecap(prev);
      Storage.setItem(SNAP_KEY, JSON.stringify({ week, rank: mine.rank, total: mine.total, points: mine.points })).catch(() => {});
    });
  }, [mine]);
  // 진행 바를 0에서 실제 값까지 차오르게: 마운트 다음 프레임에 값을 넣는다
  const [barReady, setBarReady] = useState(false);
  useEffect(() => { const t = setTimeout(() => setBarReady(true), 80); return () => clearTimeout(t); }, []);

  useEffect(() => {
    // current_profile_id()는 x-guest-token 헤더로 나를 찾는다. 기본 클라이언트면 내 순위가 null이다.
    const db = guestToken ? getGuestClient(guestToken) : supabase;
    Promise.all([
      db.rpc('leaderboard_top', { p_limit: 10 }),
      db.rpc('my_league_rank'),
    ]).then(([top, my]) => {
      if (top.error || my.error) { setFailed(true); return; }
      setRows((top.data ?? []) as Row[]);
      setMine(my.data as MyRank);
    }).catch(() => setFailed(true));
  }, [guestToken]);

  const stage = getGrowthStage(xp);
  const next = stage.nextMinPoints;
  const nextStage = GROWTH_STAGES[stage.id];
  const stageProgress = next === null ? 100 : Math.min(100, Math.round(((xp - stage.minPoints) / (next - stage.minPoints)) * 100));

  return (
    <div className="league-screen flex flex-col h-full bg-[var(--color-canvas)] pb-nav overflow-y-auto [&::-webkit-scrollbar]:hidden">
      <div className="px-5 pt-5 pb-2">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-[var(--color-ink)]">리그</h2>
            <p className="mt-1! text-xs text-[var(--color-ink-3)]">함께 배우고, 꾸준히 성장하는 머니터미 리그</p>
          </div>
          <div className="flex items-center gap-1">
            <TextButton size="small" className="min-h-11" aria-label="리그 공유" onClick={() => setSheet('share')}>
              <span className="flex items-center gap-1 text-xs"><Share2 size={12} />공유</span>
            </TextButton>
            <TextButton size="small" className="min-h-11" aria-label="리그 안내" onClick={() => setSheet('rules')}>
              <span className="flex items-center gap-1 text-xs"><Info size={12} />안내</span>
            </TextButton>
          </div>
        </div>
      </div>

      <div className="px-5 pt-4">
        <section className="anim-fade-up rounded-card bg-[var(--color-league-hero)] px-5 py-4" aria-label="이번 주 리그">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-bold text-[var(--color-ink)]">이번 주 리그</p>
            <span className="flex items-center gap-1 text-xs text-[var(--color-ink-3)]"><CalendarDays size={15} aria-hidden="true" />초기화까지 {daysUntilReset()}일</span>
          </div>
          <div className="mt-3 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs text-[var(--color-ink-2)]">내 순위</p>
              <p className="mt-1 text-3xl font-bold tracking-tight text-[var(--color-ink)]">{failed ? '조회 실패' : !mine ? '불러오는 중' : mine.rank ? `${mine.rank}위` : '순위 집계 전'}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-[var(--color-ink-2)]">이번 주 XP</p>
              <p className="mt-1 text-xl font-bold text-[var(--color-ink)]"><RollingNumber value={mine?.points ?? 0} /> XP</p>
            </div>
          </div>
          {rankDelta !== 0 && <p className="mt-2 text-xs font-semibold text-[var(--color-ink-2)]">지난 확인보다 {Math.abs(rankDelta)}계단 {rankDelta > 0 ? '올랐어요' : '내려갔어요'}</p>}
        </section>

        <section className="mt-3 rounded-card bg-[var(--color-card)] px-5 py-4" aria-label="나의 성장 단계">
          <button type="button" onClick={() => setSheet('rules')} className="flex w-full items-center gap-3 text-left">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[var(--color-brand-soft)] text-brand-500"><StageGlyph id={stage.id} size={24} /></span>
            <span className="min-w-0 flex-1">
              <span className="block text-xs text-[var(--color-ink-3)]">나의 성장 단계 · 누적 {xp.toLocaleString()} XP</span>
              <span className="mt-0.5 block text-lg font-bold text-[var(--color-ink)]">{stage.name}</span>
            </span>
            <ChevronRight size={18} className="text-[var(--color-ink-3)]" />
          </button>
          <div className="mt-3 flex justify-between text-xs text-[var(--color-ink-2)]">
            <span>{nextStage ? `다음 단계 ${nextStage.name}까지 ${(next! - xp).toLocaleString()} XP` : '최고 단계 달성'}</span>
            <span>{stageProgress}%</span>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-[var(--color-button-secondary)]" role="progressbar" aria-label="다음 단계까지 진행률" aria-valuenow={stageProgress} aria-valuemin={0} aria-valuemax={100}>
            <div className="h-full rounded-full bg-brand-500 transition-all duration-[var(--dur-emph)] ease-soft" style={{ width: barReady ? `${stageProgress}%` : '0%' }} />
          </div>
        </section>
      </div>

      {/* 랭킹 */}
      <div className="px-5 pt-6">
        <div className="flex items-center justify-between mb-4">
          <p className="text-lg font-bold text-[var(--color-ink)]">이번 주 TOP 10</p>
          <span className="flex items-center gap-1 text-xs text-[var(--color-ink-3)]"><CalendarDays size={15} />매주 월요일 초기화</span>
        </div>

        {failed && (
          <Card pad="lg">
            <p className="text-sm text-[var(--color-ink-3)] text-center">순위를 불러오지 못했어요</p>
          </Card>
        )}

        {!failed && rows === null && (
          <Card pad="lg">
            <div className="flex flex-col gap-3">
              {[1, 2, 3].map(i => <div key={i} className="h-5 bg-[var(--color-surface)] rounded animate-pulse" />)}
            </div>
          </Card>
        )}

        {!failed && rows?.length === 0 && (
          <Card pad="lg">
            <p className="text-sm text-[var(--color-ink-3)] text-center">이번 주엔 아직 아무도 없어요.<br />먼저 학습해서 1위를 차지해보세요!</p>
          </Card>
        )}

        {!failed && rows && rows.length > 0 && (
          <div>
            <div className="pb-2 pt-1">
            <div className="grid grid-cols-3 items-end gap-2 pt-7 pb-4">
              {rows.filter(r => r.rank <= 3).map(r => (
                <div
                  key={r.rank}
                  className={`relative flex min-w-0 flex-col items-center rounded-2xl px-1.5 pt-6 text-center anim-fade-up ${r.rank === 1 ? 'min-h-48 bg-[var(--color-league-first)] pb-4' : r.rank === 2 ? 'min-h-40 bg-[var(--color-league-second)] pb-3' : 'min-h-40 bg-[var(--color-league-third)] pb-3'}`}
                  style={{ gridColumn: r.rank === 1 ? 2 : r.rank === 2 ? 1 : 3, gridRow: 1, '--i': r.rank - 1 } as React.CSSProperties}
                >
                  <span className={`absolute -top-4 left-1/2 flex h-9 w-9 -translate-x-1/2 items-center justify-center rounded-full ${r.rank === 1 ? 'bg-brand-500 text-white' : r.rank === 2 ? 'bg-[#aeb8c5] text-[#303b47]' : 'bg-[#f3b48e] text-[#5a3327]'}`}>
                    {r.rank === 1 ? <Crown size={20} strokeWidth={2.5} /> : <Star size={18} strokeWidth={2.5} />}
                  </span>
                  <span className={`font-bold leading-none ${r.rank === 1 ? 'text-3xl text-brand-ink' : 'text-2xl text-[var(--color-ink-2)]'}`}>{r.rank}<span className="ml-0.5 text-sm">위</span></span>
                  <span className="mt-3 text-3xl leading-none" aria-hidden="true">{r.is_me ? myEmoji : r.emoji}</span>
                  <span className="mt-auto w-full truncate pt-3 text-xs font-bold min-[390px]:text-sm">
                    {r.is_me ? (user?.nickname ?? r.nickname) : r.nickname}
                  </span>
                  <span className={`mt-1 font-bold ${r.rank === 1 ? 'text-base text-brand-ink' : 'text-sm text-[var(--color-ink-2)]'}`}>{r.points.toLocaleString()}XP</span>
                </div>
              ))}
            </div>
            {rows.filter(r => r.rank > 3 && (showAllRanks || r.rank <= 7 || r.is_me)).map((r, i) => (
              <div
                key={`${r.rank}-${i}`}
                className={`anim-fade-up flex items-center gap-3 rounded-xl px-3 py-2.5 ${r.is_me ? 'bg-[var(--color-brand-soft)]' : ''}`}
                style={{ '--i': i + 3 } as React.CSSProperties}
              >
                <span className="w-9 shrink-0 text-center text-xs font-bold text-[var(--color-ink-3)]">{r.rank}</span>
                <span className="shrink-0 text-lg">{r.is_me ? myEmoji : r.emoji}</span>
                <span className={`flex-1 truncate text-sm ${r.is_me ? 'font-bold text-brand-ink' : 'font-medium text-[var(--color-ink)]'}`}>
                  {r.is_me ? (user?.nickname ?? r.nickname) : r.nickname}
                </span>
                <span className="shrink-0 text-sm font-bold text-[var(--color-ink-2)]">{r.points.toLocaleString()}XP</span>
              </div>
            ))}

            {/* 10위 밖이면 내 순위를 맨 아래에 따로 붙인다 */}
            {mine?.rank != null && !rows.some(r => r.is_me) && (
              <div
                className="mt-2 flex items-center gap-3 rounded-xl bg-[var(--color-brand-soft)] px-3 py-3"
              >
                <span className="w-7 text-center text-sm font-bold text-brand-ink shrink-0">{mine.rank}</span>
                <span className="text-lg shrink-0">{myEmoji}</span>
                <span className="flex-1 text-sm font-bold text-brand-ink truncate">{user?.nickname ?? '나'}</span>
                <span className="text-sm font-bold text-[var(--color-ink-2)] shrink-0">{mine.points.toLocaleString()}XP</span>
              </div>
            )}
            </div>
            {rows.some(r => r.rank > 7) && (
              <button type="button" onClick={() => setShowAllRanks(value => !value)}
                className="mt-3 flex w-full items-center justify-center gap-2 bg-[var(--color-league-hero)] py-4 text-sm font-bold text-[var(--color-ink)]"
                style={{ borderRadius: 18 }}>
                {showAllRanks ? '순위 접기' : '전체 순위 보기'}<ChevronRight size={17} className={showAllRanks ? '-rotate-90' : ''} />
              </button>
            )}
          </div>
        )}

        <Spacing size={8} />
      </div>

      {recap && <WeeklyRecap snap={recap} onClose={() => setRecap(null)} />}

      <BottomSheet
        open={sheet === 'rules'}
        className="original-modal"
        onDimmerClick={() => setSheet(null)}
        header={<span style={{ paddingLeft: '20px', fontWeight: 700, color: 'var(--color-ink)' }}>리그 안내</span>}
      >
        <div className="px-5 pb-6"><LeagueRules /></div>
      </BottomSheet>

      <BottomSheet
        open={sheet === 'share'}
        className="original-modal"
        onDimmerClick={() => setSheet(null)}
        header={<span style={{ paddingLeft: '20px', fontWeight: 700, color: 'var(--color-ink)' }}>리그 공유</span>}
      >
        <div className="px-5 pb-6 flex flex-col gap-3">
          {/* 받는 사람이 보게 될 내용 미리보기: 내 카드 + 문구. 내부 스킴 주소는 보여주지 않는다 */}
          <Card tone="surface" pad="md" className="flex flex-col gap-3 anim-fade-up">
            <div className="flex items-center gap-3">
              <span className="w-11 h-11 flex items-center justify-center text-2xl shrink-0" style={{ borderRadius: 9999, background: 'var(--color-card)' }}>{myEmoji}</span>
              <div className="min-w-0">
                <p className="text-sm font-bold text-[var(--color-ink)] truncate">{user?.nickname ?? '나'}</p>
                <p className="flex items-center gap-1 text-2xs text-[var(--color-ink-4)]"><StageGlyph id={stage.id} size={12} />{stage.name} · 이번 주 {(mine?.points ?? 0).toLocaleString()}XP{mine?.rank ? ` · ${mine.rank}위` : ''}</p>
              </div>
            </div>
            <p className="text-sm text-[var(--color-ink-2)] leading-relaxed break-keep">{shareMessage(stage.name, mine?.points ?? 0, mine?.rank)}</p>
          </Card>
          <p className="text-2xs text-[var(--color-ink-4)] px-1 anim-fade-up" style={{ '--i': 1 } as React.CSSProperties}>머니터미로 바로 열리는 토스 링크가 함께 보내져요.</p>
          <button
            onClick={() => {
              logClick('league_share', { rank: mine?.rank ?? null, weekly_xp: mine?.points ?? 0 });
              shareTossLink('intoss://moneytermi/league', shareMessage(stage.name, mine?.points ?? 0, mine?.rank));
              setSheet(null);
            }}
            className="w-full py-4 rounded-button bg-brand-500 text-sm font-bold text-white active:opacity-90 anim-fade-up"
            style={{ '--i': 2 } as React.CSSProperties}
          >
            토스로 공유하기
          </button>
        </div>
      </BottomSheet>
    </div>
  );
};

export default LeagueScreen;
