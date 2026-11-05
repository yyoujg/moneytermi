import { useEffect, useRef, useState } from 'react';
import { BottomSheet, TextButton, Spacing } from '@toss/tds-mobile';
import { GROWTH_STAGES, getGrowthStage } from '../constants';
import { useAppContext } from '../context/AppContext';
import { useAuth } from '../hooks/useAuth';
import { supabase, getGuestClient } from '../lib/supabase';
import { Card } from '../components/ui/Card';
import { ActionButton } from '../components/ui/ActionButton';
import { LeagueRules } from '../components/LeagueRules';
import { ProfileAvatar } from '../components/ProfileAvatar';
import { StageIcon } from '../components/StageGlyph';
import { LeagueRankBadge } from '../components/league/LeagueRankBadge';
import { timeLeftLabel } from '../lib/league';

type Row = { rank: number; nickname: string; emoji: string; points: number; is_me: boolean };
type MyRank = { rank: number | null; total: number; points: number };

const LeagueScreen = () => {
  const { leagueStage, myEmoji } = useAppContext();
  const { user, guestToken } = useAuth();
  const [rows, setRows] = useState<Row[] | null>(null);
  const [mine, setMine] = useState<MyRank | null>(null);
  const [failed, setFailed] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const [sheet, setSheet] = useState<'rules' | null>(null);
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

  const stage = getGrowthStage(leagueStage ?? 1);
  const roadRef = useRef<HTMLOListElement>(null);
  useEffect(() => {
    const road = roadRef.current;
    const current = road?.querySelector<HTMLElement>('[aria-current="step"]');
    if (road && current) road.scrollLeft = current.offsetLeft - (road.clientWidth - current.offsetWidth) / 2;
  }, [stage.id]);

  return (
    <div className="league-screen flex flex-col h-full pb-nav overflow-y-auto [&::-webkit-scrollbar]:hidden">
      <div className="pt-4 px-5 pb-4">
        {/* 화면 제목은 하단 탭 이름과 겹쳐 스크린리더용으로만 둔다. 안내 버튼은 TOP 10 줄 오른쪽 */}
        <h2 className="sr-only">리그</h2>

        {/* 티어 로드맵: 테두리·선 없이 등급 아이콘(80px 원 안 44px)과 이름을 가로로 넘기고 처음에 현재 등급을 가운데로 둔다. 규칙 설명은 안내 시트(LeagueRules)에만 둔다 */}
        <ol ref={roadRef} className="league-tier-road anim-fade-up" aria-label="등급 단계" style={{ '--i': 1 } as React.CSSProperties}>
          {GROWTH_STAGES.map(s => {
            const state = s.id < stage.id ? 'done' : s.id === stage.id ? 'current' : 'future';
            return (
              <li key={s.id} className="league-tier-step" data-state={state} aria-label={s.name} aria-current={state === 'current' ? 'step' : undefined}>
                <span className="league-tier-node" style={{ background: state === 'future' ? 'var(--color-neutral-soft)' : `var(--league-bg-${s.id})` }}><StageIcon id={s.id} size={44} locked={state === 'future'} /></span>
                <span className="league-tier-name" aria-hidden="true">{s.name}</span>
              </li>
            );
          })}
        </ol>
      </div>

      {/* 랭킹 */}
      <div className="league-ranking-section px-5 pt-8">
        {/* 남은 기간은 제목 바로 옆 뱃지로 */}
        <div className="flex items-center gap-2 mb-4">
          <h3 className="type-section-title">이번 주 TOP 10</h3>
          <span className="league-time-left" aria-label={`리그 종료까지 ${timeLeftLabel()}`}>{timeLeftLabel()}</span>
          <span className="ml-auto -my-3 flex">
            <TextButton size="small" className="league-header-action" aria-label="리그 안내" onClick={() => setSheet('rules')}>
              안내
            </TextButton>
          </span>
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
              {[1, 2, 3].map(i => <div key={i} className="h-5 bg-[var(--color-surface)] rounded-chip animate-pulse" />)}
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
                <ProfileAvatar name={r.is_me ? (user?.nickname ?? r.nickname) : r.nickname} size={56} avatar={r.is_me ? myEmoji : r.emoji} />
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
                <ProfileAvatar name={user?.nickname ?? '나'} size={56} avatar={myEmoji} />
                <span className="league-rank-name">{user?.nickname ?? '나'}</span>
                <span className="league-rank-xp"><span>{mine.points.toLocaleString()}</span><span className="league-rank-xp-unit">XP</span></span>
              </div>
            )}
          </Card>
        )}
        {!failed && rows && rows.length > 0 && mine && mine.rank == null && !rows.some(r => r.is_me) && (
          <p className="py-4 text-sm text-[var(--color-ink-3)] text-center">아직 이번 주 순위에 없어요</p>
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
    </div>
  );
};

export default LeagueScreen;
