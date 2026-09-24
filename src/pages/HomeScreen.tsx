import { useEffect, useRef } from 'react';
import { ChevronRight, Zap, Flame, BookOpen, RotateCcw } from 'lucide-react';
import { Badge } from '@toss/tds-mobile';
import { useNavigate } from 'react-router-dom';
import { DEFAULT_NICKNAME, getGrowthStage } from '../constants';
import { useAppContext } from '../context/AppContext';
import { logClick } from '../lib/analytics';
import { calcStreak } from '../lib/streak';
import { msUntilNextSlot } from '../lib/date';
import { useAuth } from '../hooks/useAuth';
import { WeeklyBarChart } from '../components/home/WeeklyBarChart';
import { Card } from '../components/ui/Card';
import { StatCard } from '../components/ui/StatCard';

const HomeScreen = () => {
  const navigate = useNavigate();
  const { hydrated, points, knownWords, unknownWords, missions, claimReward, attendanceDates, allWords, dueQueue, myEmoji } = useAppContext();
  const { user } = useAuth();
  const totalWords = allWords.length;
  const isNewUser = hydrated && knownWords.length + unknownWords.length === 0;

  // 복습 카드 노출 로깅 (세션 1회 래치, hydration 전 프레임 오발화 방지)
  const reviewPromptLoggedRef = useRef(false);
  useEffect(() => {
    if (!hydrated || dueQueue.length === 0 || reviewPromptLoggedRef.current) return;
    reviewPromptLoggedRef.current = true;
    logClick('review_prompt_view', { count: dueQueue.length });
  }, [hydrated, dueQueue.length]);

  const streak = calcStreak(attendanceDates);

  const missionList = Object.values(missions).sort((a, b) => a.sortOrder - b.sortOrder);
  const resetLabel = `${Math.ceil(msUntilNextSlot() / 3600000)}시간 뒤 초기화`;
  const stage = getGrowthStage(points);

  return (
    <div className="flex flex-col h-full pb-nav overflow-y-auto [&::-webkit-scrollbar]:hidden" style={{ backgroundColor: 'var(--color-canvas)' }}>

      {/* 헤더 */}
      <div className="pt-4 px-5 pb-4">
        <div className="flex justify-between items-center mb-4">
          <div>
            <div className="inline-flex items-center px-2 py-1 rounded mb-2" style={{ backgroundColor: 'var(--color-surface)' }}>
              <span className="text-2xs font-medium text-[var(--color-ink-4)]">{stage.emoji} {stage.name}</span>
            </div>
            <h1 className="text-xl font-bold text-[var(--color-ink)]">안녕하세요, {user?.nickname ?? DEFAULT_NICKNAME}님</h1>
          </div>
          <div className="w-10 h-10 bg-[var(--color-surface)] rounded-full flex items-center justify-center overflow-hidden shrink-0">
            <span className="text-lg">{myEmoji}</span>
          </div>
        </div>

        {/* 오늘 복습 카드 */}
        {dueQueue.length > 0 && (
          <Card
            pad="md"
            role="button"
            onClick={() => { logClick('review_start', { count: dueQueue.length }); navigate('/review'); }}
            className="mb-4 flex items-center justify-between active:opacity-80 cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-brand-500/10 flex items-center justify-center shrink-0">
                <RotateCcw size={16} className="text-brand-500" />
              </div>
              <div className="text-left">
                <p className="text-sm font-bold text-[var(--color-ink)]">오늘 복습할 단어 {dueQueue.length}개</p>
                <p className="text-2xs text-[var(--color-ink-4)]">기억이 흐려지기 전에 복습해요</p>
              </div>
            </div>
            <ChevronRight size={16} className="text-[var(--color-ink-4)]" />
          </Card>
        )}

        {/* 빠른 통계 */}
        {!isNewUser && (
        <div className="flex gap-3 mb-4">
          <StatCard
            icon={<Zap size={14} className="text-[var(--color-ink-4)] fill-current shrink-0" />}
            label="포인트"
            value={<>{points.toLocaleString()}<span className="text-xs text-[var(--color-ink-4)] ml-0.5">P</span></>}
          />
          <StatCard
            icon={<Flame size={14} className="text-[var(--color-ink-4)] shrink-0" />}
            label="연속 출석"
            value={<>{streak}<span className="text-xs text-[var(--color-ink-4)] ml-0.5">일</span></>}
          />
          <StatCard
            icon={<BookOpen size={14} className="text-[var(--color-ink-4)] shrink-0" />}
            label="학습 단어"
            value={<>{knownWords.length}<span className="text-xs text-[var(--color-ink-4)] ml-0.5">/{totalWords}</span></>}
          />
        </div>
        )}

        {/* 주간 바 차트 */}
        {!isNewUser && (
        <Card pad="none" className="px-5 pt-4 pb-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-bold text-[var(--color-ink)]">이번 주</p>
          </div>
          <WeeklyBarChart attendanceDates={attendanceDates} />
        </Card>
        )}
      </div>

      {/* 오늘의 미션 */}
      <div className="px-5 flex flex-col gap-4">
        <Card pad="lg" className="mb-4">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-sm font-bold text-[var(--color-ink-2)]">오늘의 미션</h2>
            <span className="text-2xs font-medium text-[var(--color-ink-4)]">{resetLabel}</span>
          </div>

          <div className="flex flex-col">
            {missionList.map((mission, idx) => {
              const done = mission.current >= mission.target;
              return (
                <div key={mission.id} className={idx > 0 ? 'pt-3 mt-3 border-t border-[var(--color-line)]' : ''}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="min-w-0">
                      <p className={`text-sm font-bold truncate ${mission.isRewarded ? 'text-[var(--color-ink-4)] line-through' : 'text-[var(--color-ink)]'}`}>
                        {mission.title}
                      </p>
                      <p className="text-2xs text-[var(--color-ink-4)] mt-0.5!">+{mission.reward}P</p>
                    </div>
                    {mission.isRewarded
                      ? <Badge color="elephant" size="small" variant="fill">완료</Badge>
                      : done
                        ? <button onClick={() => claimReward(mission.id)} className="px-3 py-1.5 rounded-button bg-brand-500 text-white text-xs font-bold active:bg-brand-600 shrink-0">받기</button>
                        : <span className="text-base font-bold text-[var(--color-ink)] shrink-0">{mission.current}<span className="text-xs text-[var(--color-ink-4)]">/{mission.target}</span></span>
                    }
                  </div>
                  <div className="flex gap-1">
                    {Array.from({ length: mission.target }).map((_, i) => (
                      <div key={i} className={`flex-1 h-1.5 rounded-full transition-all duration-300 ${i < mission.current ? 'bg-brand-500' : 'bg-[var(--color-line)]'}`} />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default HomeScreen;
