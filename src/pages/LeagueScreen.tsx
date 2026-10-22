import { useEffect, useState } from 'react';
import { Info, Share2 } from '../components/ui/OtterIcons';
import { BottomSheet, TextButton, Spacing } from '@toss/tds-mobile';
import { GROWTH_STAGES, getGrowthStage } from '../constants';
import { useAppContext } from '../context/AppContext';
import { useAuth } from '../hooks/useAuth';
import { supabase, getGuestClient } from '../lib/supabase';
import { logClick } from '../lib/analytics';
import { shareTossLink } from '../lib/share';
import { daysUntilReset } from '../lib/league';
import { Card } from '../components/ui/Card';
import { ActionButton } from '../components/ui/ActionButton';
import { LeagueRules } from '../components/LeagueRules';
import { StageGlyph } from '../components/StageGlyph';
import { ProfileAvatar } from '../components/ProfileAvatar';
import { LeagueRankBadge } from '../components/league/LeagueRankBadge';

type Row = { rank: number; nickname: string; emoji: string; points: number; is_me: boolean };
type MyRank = { rank: number | null; total: number; points: number };

// 공유 문구: 이번 주 성과가 있으면 그걸 앞세운다
const shareMessage = (tier: string, weeklyXp: number, rank: number | null | undefined) =>
  rank
    ? `이번 주 ${weeklyXp.toLocaleString()}XP로 리그 ${rank}위! 머니터미에서 쉬운 상황부터 같이 시작해요`
    : weeklyXp > 0
      ? `이번 주 ${weeklyXp.toLocaleString()}XP 모았어요. 머니터미에서 쉬운 상황부터 같이 시작해요`
      : `경제 공부, 뭐부터 볼지 모르겠다면 머니터미에서 ${tier} 리그부터 시작해요!`;

const LeagueScreen = () => {
  const { xp } = useAppContext();
  const { user, guestToken } = useAuth();
  const [rows, setRows] = useState<Row[] | null>(null);
  const [mine, setMine] = useState<MyRank | null>(null);
  const [failed, setFailed] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const [sheet, setSheet] = useState<'share' | 'rules' | null>(null);
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
  }, [guestToken, reloadKey]);

  const stage = getGrowthStage(xp);
  const next = stage.nextMinPoints;

  return (
    <div className="league-screen app-soft-screen flex flex-col h-full pb-nav overflow-y-auto [&::-webkit-scrollbar]:hidden">
      <div className="pt-4 px-5 pb-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-[var(--color-ink)]">리그</h2>
          <div className="flex items-center gap-1">
            <TextButton size="small" aria-label="리그 공유" onClick={() => setSheet('share')}>
              <span className="flex items-center gap-1"><Share2 size={13} />공유</span>
            </TextButton>
            <TextButton size="small" aria-label="리그 안내" onClick={() => setSheet('rules')}>
              <span className="flex items-center gap-1"><Info size={13} />안내</span>
            </TextButton>
          </div>
        </div>

        {/* 이번 주 순위(이번 주 참여)와 내 등급(누적)을 나눠 보여준다 */}
        <Card tone="card" pad="lg" className="grid grid-cols-2 gap-4 anim-fade-up">
          <div className="flex flex-col">
            <p className="text-xs text-[var(--color-ink-3)]">이번 주 순위</p>
            <p className="mt-2! text-3xl font-bold text-brand-500 tabular-nums">{mine?.rank ? `${mine.rank}위` : '-'}</p>
            <p className="mt-1! text-xs text-[var(--color-ink-3)] break-keep">
              {mine?.rank ? `${mine.total}명 중 · ${mine.points?.toLocaleString() ?? 0}XP` : 'XP를 모으면 순위에 올라요'}
            </p>
            <p className="mt-auto! pt-3 text-xs text-[var(--color-ink-3)]">초기화까지 {daysUntilReset()}일</p>
          </div>
          <div className="flex flex-col border-l border-[var(--color-line)] pl-4">
            <p className="text-xs text-[var(--color-ink-3)]">내 등급</p>
            <div className="mt-2 flex items-center gap-2">
              <StageGlyph id={stage.id} size={40} />
              <span className="text-base font-bold text-[var(--color-ink)]">{stage.name}</span>
            </div>
            <div className="mt-auto pt-3">
              <div role="progressbar" aria-label="다음 등급까지 진행률" aria-valuemin={0} aria-valuemax={100} aria-valuenow={next === null ? 100 : Math.min(100, Math.round(((xp - stage.minPoints) / (next - stage.minPoints)) * 100))} className="w-full bg-[var(--color-surface)] rounded-full h-2 overflow-hidden mb-1">
                <div
                  className="bg-[var(--accent-lavender)] h-full rounded-full transition-all duration-700"
                  style={{ width: barReady ? `${next === null ? 100 : Math.min(100, Math.round(((xp - stage.minPoints) / (next - stage.minPoints)) * 100))}%` : '0%' }}
                />
              </div>
              <p className="text-xs text-[var(--color-ink-3)]">
                {next === null ? '최고 등급이에요' : `다음 등급까지 ${next - xp}XP`}
              </p>
            </div>
          </div>
        </Card>

        {/* 티어 로드맵 */}
        <div className="mt-8 anim-fade-up" style={{ '--i': 1 } as React.CSSProperties}>
          <div className="flex justify-between items-start relative">
            <div className="absolute top-5 left-5 right-5 h-[2px] bg-[var(--color-line)] z-0 rounded-full">
              <div
                className="h-full bg-[var(--accent-lavender)] rounded-full transition-all duration-1000"
                style={{ width: `${((stage.id - 1) / (GROWTH_STAGES.length - 1)) * 100}%` }}
              />
            </div>
            {GROWTH_STAGES.map(s => {
              const isCurrent = s.id === stage.id;
              return (
                <div key={s.id} className="flex flex-col items-center relative z-10 w-14">
                  <StageGlyph id={s.id} size={40} className={`transition-all ${isCurrent ? 'scale-125' : s.id > stage.id ? 'grayscale opacity-40' : ''}`} />
                  <span className={`text-2xs font-normal text-center mt-1 ${isCurrent ? 'text-brand-500' : 'text-[var(--color-ink-3)]'}`}>
                    {s.name}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 랭킹 */}
      <div className="px-5 pt-8">
        <div className="flex items-baseline justify-between mb-3">
          <h3 className="text-[length:var(--font-size-headline)] font-bold text-[var(--color-ink)]">이번 주 TOP 10</h3>
          <span className="text-2xs text-[var(--color-ink-4)]">매주 월요일 초기화</span>
        </div>

        {failed && (
          <div className="flex flex-col items-center gap-3 py-6">
            <p className="text-sm text-[var(--color-ink-3)] text-center">순위를 불러오지 못했어요</p>
            <ActionButton tone="soft" onClick={() => { setFailed(false); setRows(null); setReloadKey(key => key + 1); }}>다시 시도</ActionButton>
          </div>
        )}

        {!failed && rows === null && (
          <Card pad="lg">
            <div className="flex flex-col gap-3">
              {[1, 2, 3].map(i => <div key={i} className="h-5 bg-[var(--color-surface)] rounded animate-pulse" />)}
            </div>
          </Card>
        )}

        {!failed && rows?.length === 0 && (
          <p className="py-6 text-sm text-[var(--color-ink-3)] text-center">이번 주엔 아직 아무도 없어요.<br />먼저 학습해서 1위를 차지해보세요!</p>
        )}

        {!failed && rows && rows.length > 0 && (
          <Card pad="none" className="league-ranking-list overflow-hidden">
            {rows.map((r, i) => (
              <div
                key={`${r.rank}-${i}`}
                className={`league-ranking-row anim-fade-up${r.is_me ? ' is-me' : ''}`}
                data-podium={r.rank >= 1 && r.rank <= 3 ? r.rank : undefined}
                style={{ '--i': i } as React.CSSProperties}
              >
                <LeagueRankBadge rank={r.rank} />
                <span className="league-rank-name">
                  {r.is_me ? (user?.nickname ?? r.nickname) : r.nickname}
                </span>
                <span className="league-rank-xp"><span>{r.points.toLocaleString()}</span><span className="league-rank-xp-unit">XP</span></span>
              </div>
            ))}

            {/* 10위 밖이면 내 순위를 맨 아래에 따로 붙인다 */}
            {mine?.rank != null && !rows.some(r => r.is_me) && (
              <div
                className="league-ranking-row is-me is-own-separate"
              >
                <LeagueRankBadge rank={mine.rank} />
                <span className="league-rank-name">{user?.nickname ?? '나'}</span>
                <span className="league-rank-xp"><span>{mine.points.toLocaleString()}</span><span className="league-rank-xp-unit">XP</span></span>
              </div>
            )}
          </Card>
        )}

        <Spacing size={8} />
      </div>

      <BottomSheet
        open={sheet === 'rules'}
        onDimmerClick={() => setSheet(null)}
        header={<span style={{ paddingLeft: '20px', fontWeight: 700, color: 'var(--color-ink)' }}>리그 안내</span>}
      >
        <div className="px-5 pb-6"><LeagueRules /></div>
      </BottomSheet>

      <BottomSheet
        open={sheet === 'share'}
        onDimmerClick={() => setSheet(null)}
        header={<span style={{ paddingLeft: '20px', fontWeight: 700, color: 'var(--color-ink)' }}>리그 공유</span>}
      >
        <div className="px-5 pb-6 flex flex-col gap-3">
          {/* 받는 사람이 보게 될 내용 미리보기: 내 카드 + 문구. 내부 스킴 주소는 보여주지 않는다 */}
          <Card tone="card" pad="md" className="flex flex-col gap-3 anim-fade-up">
            <div className="flex items-center gap-3">
              <ProfileAvatar name={user?.nickname ?? '나'} size={44} />
              <div className="min-w-0">
                <p className="text-sm font-bold text-[var(--color-ink)] truncate">{user?.nickname ?? '나'}</p>
                <p className="text-2xs text-[var(--color-ink-4)]">{stage.name} · 이번 주 {(mine?.points ?? 0).toLocaleString()}XP{mine?.rank ? ` · ${mine.rank}위` : ''}</p>
              </div>
            </div>
            <p className="text-sm text-[var(--color-ink-2)] leading-relaxed break-keep">{shareMessage(stage.name, mine?.points ?? 0, mine?.rank)}</p>
          </Card>
          <p className="text-2xs text-[var(--color-ink-4)] px-1 anim-fade-up" style={{ '--i': 1 } as React.CSSProperties}>머니터미로 바로 열리는 토스 링크가 함께 보내져요.</p>
          <ActionButton
            fullWidth
            onClick={() => {
              logClick('league_share', { rank: mine?.rank ?? null, weekly_xp: mine?.points ?? 0 });
              shareTossLink('intoss://moneytermi/league', shareMessage(stage.name, mine?.points ?? 0, mine?.rank));
              setSheet(null);
            }}
            className="anim-fade-up"
            style={{ '--i': 2 } as React.CSSProperties}
          >
            토스로 공유하기
          </ActionButton>
        </div>
      </BottomSheet>
    </div>
  );
};

export default LeagueScreen;
