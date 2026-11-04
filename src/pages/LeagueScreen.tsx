import { useEffect, useState } from 'react';
import { BottomSheet, TextButton, Spacing } from '@toss/tds-mobile';
import { GROWTH_STAGES, getGrowthStage } from '../constants';
import { useAppContext } from '../context/AppContext';
import { useAuth } from '../hooks/useAuth';
import { supabase, getGuestClient } from '../lib/supabase';
import { logClick } from '../lib/analytics';
import { shareTossLink } from '../lib/share';
import { Card } from '../components/ui/Card';
import { ActionButton } from '../components/ui/ActionButton';
import { LeagueRules } from '../components/LeagueRules';
import { ProfileAvatar } from '../components/ProfileAvatar';
import { StageGlyph } from '../components/StageGlyph';
import { LeagueRankBadge } from '../components/league/LeagueRankBadge';
import { daysUntilReset } from '../lib/league';

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

  return (
    <div className="league-screen flex flex-col h-full pb-nav overflow-y-auto [&::-webkit-scrollbar]:hidden">
      <div className="pt-4 px-5 pb-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="type-page-title">리그</h2>
          <div className="flex items-center gap-1">
            <TextButton size="small" className="league-header-action" aria-label="리그 공유" onClick={() => setSheet('share')}>
              공유
            </TextButton>
            <TextButton size="small" className="league-header-action" aria-label="리그 안내" onClick={() => setSheet('rules')}>
              안내
            </TextButton>
          </div>
        </div>

        {/* 이번 주 내 순위: 홈에서 옮겨 왔다 */}
        <section aria-labelledby="league-my-rank" className="league-my-rank">
          <h3 id="league-my-rank" className="type-supporting">이번 주 내 순위</h3>
          {failed ? <button type="button" onClick={() => { setFailed(false); setRows(null); setReloadKey(key => key + 1); }} className="min-h-11 text-xs text-[var(--color-ink-2)] underline">순위 다시 불러오기</button> : <>
            <p className="league-my-rank-value">{mine?.rank ? `${mine.rank}위` : '-'}</p>
            <p className="type-supporting break-keep">{mine === null ? '순위 불러오는 중' : mine.rank ? `${mine.total.toLocaleString()}명 중 · ${mine.points.toLocaleString()}XP` : 'XP를 모으면 순위에 올라요'}</p>
          </>}
          <p className="mt-1! text-2xs text-[var(--color-ink-3)]">초기화까지 {daysUntilReset()}일</p>
        </section>

        {/* 티어 로드맵: 굵은 진행 트랙 위에 등급 노드를 올리고, 현재 등급은 테두리로 강조한다 */}
        <ol className="league-tier-road anim-fade-up" aria-label="등급 단계" style={{ '--i': 1, '--road-progress': (stage.id - 1) / (GROWTH_STAGES.length - 1) } as React.CSSProperties}>
          {GROWTH_STAGES.map(s => {
            const state = s.id < stage.id ? 'done' : s.id === stage.id ? 'current' : 'future';
            return (
              <li key={s.id} className="league-tier-step" data-state={state} aria-current={state === 'current' ? 'step' : undefined}>
                <span className="league-tier-node"><StageGlyph id={s.id} size={24} /></span>
                <span className="league-tier-name">{s.name}</span>
                <span className="league-tier-xp">{s.minPoints.toLocaleString()}XP</span>
              </li>
            );
          })}
        </ol>
      </div>

      {/* 랭킹 */}
      <div className="league-ranking-section px-5 pt-8">
        <div className="flex items-baseline justify-between mb-3">
          <h3 className="type-section-title">이번 주 TOP 10</h3>
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
                <ProfileAvatar name={r.is_me ? (user?.nickname ?? r.nickname) : r.nickname} size={32} />
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
                <ProfileAvatar name={user?.nickname ?? '나'} size={32} />
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
        header={<span className="sheet-title">리그 안내</span>}
      >
        <div className="px-5 pb-6"><LeagueRules /></div>
      </BottomSheet>

      <BottomSheet
        open={sheet === 'share'}
        onDimmerClick={() => setSheet(null)}
        header={<span className="sheet-title">리그 공유</span>}
      >
        <div className="px-5 pb-6 flex flex-col gap-3">
          {/* 받는 사람이 보게 될 내용 미리보기: 내 카드 + 문구. 내부 스킴 주소는 보여주지 않는다 */}
          <Card pad="md" className="flex flex-col gap-3 anim-fade-up">
            <div className="flex items-center gap-3">
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
