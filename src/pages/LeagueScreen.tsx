import { useEffect, useState } from 'react';
import { Info, Share2 } from 'lucide-react';
import { BottomSheet, TextButton, Spacing } from '@toss/tds-mobile';
import { GROWTH_STAGES, getGrowthStage } from '../constants';
import { useAppContext } from '../context/AppContext';
import { useAuth } from '../hooks/useAuth';
import { supabase, getGuestClient } from '../lib/supabase';
import { logClick } from '../lib/analytics';
import { shareTossLink } from '../lib/share';
import { daysUntilReset } from '../lib/league';
import { Card } from '../components/ui/Card';
import { LeagueRules } from '../components/LeagueRules';

type Row = { rank: number; nickname: string; emoji: string; points: number; is_me: boolean };
type MyRank = { rank: number | null; total: number; points: number };

const MEDAL = ['🥇', '🥈', '🥉'];
const SHARE_MSG = '머니터미에서 경제 용어 배우고 리그 순위 올려봐요!';

const LeagueScreen = () => {
  const { xp, myEmoji } = useAppContext();
  const { user, guestToken } = useAuth();
  const [rows, setRows] = useState<Row[] | null>(null);
  const [mine, setMine] = useState<MyRank | null>(null);
  const [failed, setFailed] = useState(false);
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
  }, [guestToken]);

  const stage = getGrowthStage(xp);
  const next = stage.nextMinPoints;

  return (
    <div className="flex flex-col h-full bg-[var(--color-canvas)] pb-nav overflow-y-auto [&::-webkit-scrollbar]:hidden">
      <div className="bg-[var(--color-card)] pt-4 px-5 pb-5">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-[var(--color-ink)]">리그</h2>
          <div className="flex items-center gap-1">
            <TextButton size="small" onClick={() => setSheet('share')}>
              <span className="flex items-center gap-1"><Share2 size={13} />공유</span>
            </TextButton>
            <TextButton size="small" onClick={() => setSheet('rules')}>
              <span className="flex items-center gap-1"><Info size={13} />안내</span>
            </TextButton>
          </div>
        </div>

        {/* 내 티어 */}
        <Card tone="surface" pad="lg" className="flex flex-col items-center text-center">
          <div className="text-6xl mb-2">{stage.emoji}</div>
          <p className="text-lg font-bold text-[var(--color-ink)] mb-1!">{stage.name}</p>
          <p className="text-xs text-[var(--color-ink-3)] mb-1!">
            {mine?.rank ? `${mine.total}명 중 ${mine.rank}위` : '이번 주 XP를 모으면 순위에 올라요'}
          </p>
          <p className="text-2xs font-medium text-brand-500 mb-3!">이번 주 {mine?.points?.toLocaleString() ?? 0}XP · {daysUntilReset()}일 남음</p>
          <div className="w-full bg-[var(--color-card)] rounded-full h-1.5 overflow-hidden mb-1.5">
            <div
              className="bg-brand-500 h-full rounded-full transition-all duration-700"
              style={{ width: `${next === null ? 100 : Math.min(100, Math.round(((xp - stage.minPoints) / (next - stage.minPoints)) * 100))}%` }}
            />
          </div>
          <p className="text-xs text-[var(--color-ink-4)]">
            {next === null ? '최고 티어예요 🎉' : `다음 티어까지 ${next - xp}XP`}
          </p>
        </Card>

        {/* 티어 로드맵 */}
        <div className="flex justify-between items-start relative mt-5">
          <div className="absolute top-4 left-4 right-4 h-[2px] bg-[var(--color-line)] z-0 rounded-full">
            <div
              className="h-full bg-brand-500 rounded-full transition-all duration-1000"
              style={{ width: `${((stage.id - 1) / (GROWTH_STAGES.length - 1)) * 100}%` }}
            />
          </div>
          {GROWTH_STAGES.map(s => {
            const isCurrent = s.id === stage.id;
            return (
              <div key={s.id} className="flex flex-col items-center relative z-10 w-14">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm transition-all
                  ${isCurrent ? 'bg-brand-500 scale-110' : s.id < stage.id ? 'bg-[var(--color-line)]' : 'bg-[var(--color-surface)]'}`}>
                  {s.emoji}
                </div>
                <span className={`text-3xs font-medium text-center mt-1.5 ${isCurrent ? 'text-brand-500' : 'text-[var(--color-ink-4)]'}`}>
                  {s.name}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 랭킹 */}
      <div className="px-5 pt-5">
        <div className="flex items-baseline justify-between mb-3">
          <p className="text-sm font-bold text-[var(--color-ink-2)]">이번 주 TOP 10</p>
          <span className="text-2xs text-[var(--color-ink-4)]">매주 월요일 초기화 · {daysUntilReset()}일 남음</span>
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
          <Card pad="none" className="overflow-hidden">
            {rows.map((r, i) => (
              <div
                key={`${r.rank}-${i}`}
                className={`flex items-center gap-3 px-4 py-3 ${i < rows.length - 1 ? 'border-b border-[var(--color-line)]' : ''}`}
                style={r.is_me ? { backgroundColor: 'var(--color-brand-soft)' } : undefined}
              >
                <span className="w-7 text-center text-sm font-bold text-[var(--color-ink-3)] shrink-0">
                  {r.rank <= 3 ? MEDAL[r.rank - 1] : r.rank}
                </span>
                <span className="text-lg shrink-0">{r.is_me ? myEmoji : r.emoji}</span>
                <span className={`flex-1 text-sm truncate ${r.is_me ? 'font-bold text-brand-500' : 'font-medium text-[var(--color-ink)]'}`}>
                  {r.is_me ? (user?.nickname ?? r.nickname) : r.nickname}
                </span>
                <span className="text-sm font-bold text-[var(--color-ink-2)] shrink-0">{r.points.toLocaleString()}XP</span>
              </div>
            ))}

            {/* 10위 밖이면 내 순위를 맨 아래에 따로 붙인다 */}
            {mine?.rank != null && !rows.some(r => r.is_me) && (
              <div
                className="flex items-center gap-3 px-4 py-3 border-t-2 border-dashed border-[var(--color-line)]"
                style={{ backgroundColor: 'var(--color-brand-soft)' }}
              >
                <span className="w-7 text-center text-sm font-bold text-brand-500 shrink-0">{mine.rank}</span>
                <span className="text-lg shrink-0">{myEmoji}</span>
                <span className="flex-1 text-sm font-bold text-brand-500 truncate">{user?.nickname ?? '나'}</span>
                <span className="text-sm font-bold text-[var(--color-ink-2)] shrink-0">{mine.points.toLocaleString()}XP</span>
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
        <div className="px-3 pb-6"><LeagueRules /></div>
      </BottomSheet>

      <BottomSheet
        open={sheet === 'share'}
        onDimmerClick={() => setSheet(null)}
        header={<span style={{ paddingLeft: '20px', fontWeight: 700, color: 'var(--color-ink)' }}>리그 공유</span>}
      >
        <div className="px-5 pb-6 flex flex-col gap-3">
          <Card tone="surface" pad="md">
            <p className="text-sm text-[var(--color-ink-2)] leading-relaxed break-keep">{SHARE_MSG}</p>
            <p className="text-2xs text-[var(--color-ink-4)] mt-2!">intoss://moneytermi/league</p>
          </Card>
          <button
            onClick={() => {
              logClick('league_share');
              shareTossLink('intoss://moneytermi/league', SHARE_MSG);
              setSheet(null);
            }}
            className="w-full py-4 rounded-button bg-brand-500 text-sm font-bold text-white active:opacity-90"
          >
            토스로 공유하기
          </button>
        </div>
      </BottomSheet>
    </div>
  );
};

export default LeagueScreen;
