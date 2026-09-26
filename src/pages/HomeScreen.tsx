import { useEffect, useRef, useState } from 'react';
import { ChevronRight, RotateCcw, Flame, ArrowRight } from 'lucide-react';
import { Badge } from '@toss/tds-mobile';
import { toast } from 'sonner';
import { feedbackClaim, feedbackError } from '../lib/feedback';
import { useNavigate } from 'react-router-dom';
import { DEFAULT_NICKNAME, MISSION_XP, getGrowthStage } from '../constants';
import { useAppContext } from '../context/AppContext';
import { logClick } from '../lib/analytics';
import { msUntilNextSlot } from '../lib/date';
import { useAuth } from '../hooks/useAuth';
import { WeekStrip } from '../components/home/WeekStrip';
import { calcStreak } from '../lib/streak';
import { Card } from '../components/ui/Card';
import { PointCelebration, type PointReward } from '../components/PointCelebration';

const HomeScreen = () => {
  const navigate = useNavigate();
  const { hydrated, xp, knownWords, unknownWords, missions, claimReward, attendanceDates, dueQueue, myEmoji } = useAppContext();
  const { user } = useAuth();
  const isNewUser = hydrated && knownWords.length + unknownWords.length === 0;

  // 복습 카드 노출 로깅 (세션 1회 래치, hydration 전 프레임 오발화 방지)
  const reviewPromptLoggedRef = useRef(false);
  useEffect(() => {
    if (!hydrated || dueQueue.length === 0 || reviewPromptLoggedRef.current) return;
    reviewPromptLoggedRef.current = true;
    logClick('review_prompt_view', { count: dueQueue.length });
  }, [hydrated, dueQueue.length]);

  const missionList = Object.values(missions).sort((a, b) => a.sortOrder - b.sortOrder);
  const streak = calcStreak(attendanceDates);

  // 보상 수령: 성공하면 축하 모달 + 정답과 같은 햅틱, 실패(슬롯이 바뀌었거나 네트워크)면 이유를 알려준다
  const [celebration, setCelebration] = useState<PointReward | null>(null);
  const handleClaim = async (missionId: string, reward: number) => {
    const ok = await claimReward(missionId);
    if (ok) {
      feedbackClaim();
      setCelebration({ points: reward, xp: MISSION_XP, source: 'mission' });
    } else {
      feedbackError();
      toast.error('보상을 받지 못했어요. 잠시 후 다시 시도해주세요');
    }
  };
  const resetLabel = `${Math.ceil(msUntilNextSlot() / 3600000)}시간 뒤 초기화`;
  const stage = getGrowthStage(xp);

  return (
    <div className="flex flex-col h-full pb-nav overflow-y-auto [&::-webkit-scrollbar]:hidden" style={{ backgroundColor: 'var(--color-canvas)' }}>

      {/* 히어로: 인사 · 티어 · 이번 주 출석 스트립 */}
      <div className="pt-4 px-5 pb-4">
        <div
          className="rounded-card px-5 pt-5 pb-4 text-white shadow-lg anim-fade-up"
          style={{ background: 'linear-gradient(135deg, #f97316 0%, #fb923c 100%)' }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 flex items-center justify-center text-2xl shrink-0" style={{ borderRadius: 9999, background: 'rgba(255,255,255,0.22)' }}>
              {myEmoji}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-base font-bold truncate">안녕하세요, {user?.nickname ?? DEFAULT_NICKNAME}님</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="inline-flex items-center gap-1 text-2xs font-bold px-2 py-0.5" style={{ borderRadius: 9999, background: 'rgba(255,255,255,0.22)' }}>
                  {stage.emoji} {stage.name}
                </span>
                <span className="inline-flex items-center gap-0.5 text-2xs font-bold">
                  <Flame size={12} className="fill-current" />{streak}일 연속
                </span>
              </div>
            </div>
          </div>

          {isNewUser ? (
            <button
              onClick={() => navigate('/course')}
              className="w-full flex items-center justify-between rounded-button bg-white px-4 py-3 text-sm font-bold text-brand-500 active:opacity-90"
            >
              오늘 첫 단어를 배워봐요 <ArrowRight size={16} />
            </button>
          ) : (
            <WeekStrip attendanceDates={attendanceDates} />
          )}
        </div>

        {/* 오늘 복습 카드 */}
        {dueQueue.length > 0 && (
          <Card
            pad="md"
            role="button"
            onClick={() => { logClick('review_start', { count: dueQueue.length }); navigate('/review'); }}
            className="mt-4 flex items-center justify-between active:opacity-80 cursor-pointer anim-fade-up"
            style={{ '--i': 1 } as React.CSSProperties}
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
      </div>

      {/* 오늘의 미션 */}
      <div className="px-5 flex flex-col gap-4">
        <Card pad="lg" className="mb-4 anim-fade-up">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-sm font-bold text-[var(--color-ink-2)]">오늘의 미션</h2>
            <span className="text-2xs font-medium text-[var(--color-ink-4)]">{resetLabel}</span>
          </div>

          <div className="flex flex-col">
            {missionList.map((mission, idx) => {
              const done = mission.current >= mission.target;
              return (
                <div key={mission.id} className={`anim-fade-up ${idx > 0 ? 'pt-3 mt-3 border-t border-[var(--color-line)]' : ''}`} style={{ '--i': idx } as React.CSSProperties}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="min-w-0">
                      <p className={`text-sm font-bold truncate ${mission.isRewarded ? 'text-[var(--color-ink-4)] line-through' : 'text-[var(--color-ink)]'}`}>
                        {mission.title}
                      </p>
                      <p className="text-2xs text-[var(--color-ink-4)] mt-0.5!">+{mission.reward}P · +{MISSION_XP} XP</p>
                    </div>
                    {mission.isRewarded
                      ? <span className="anim-pop-in inline-flex"><Badge color="elephant" size="small" variant="fill">완료</Badge></span>
                      : done
                        ? <button onClick={() => handleClaim(mission.id, mission.reward)} className="anim-attn px-3 py-1.5 rounded-button bg-brand-500 text-white text-xs font-bold active:bg-brand-600 shrink-0">받기</button>
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
      {celebration && <PointCelebration reward={celebration} onClose={() => setCelebration(null)} />}
    </div>
  );
};

export default HomeScreen;
