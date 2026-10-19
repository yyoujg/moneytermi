import { useEffect, useRef, useState } from 'react';
import { BookOpenText, CalendarDays, RotateCcw, Target } from '../components/ui/OtterIcons';
import { ArrowRight, ChevronRight } from '../components/ui/ControlIcons';
import { MissionRewardStatus } from '../components/home/MissionRewardStatus';
import { showModal } from '../components/AlertModal';
import { feedbackClaim, feedbackError } from '../lib/feedback';
import { useNavigate } from 'react-router-dom';
import { DEFAULT_NICKNAME, MISSION_XP, getGrowthStage } from '../constants';
import { useAppContext } from '../context/AppContext';
import { logClick } from '../lib/analytics';
import { msUntilNextSlot } from '../lib/date';
import { useAuth } from '../hooks/useAuth';
import { WeekStrip } from '../components/home/WeekStrip';
import { StageGlyph } from '../components/StageGlyph';
import { ProfileAvatar } from '../components/ProfileAvatar';
import { PointIcon, StreakIcon, XpIcon } from '../components/StatIcons';
import { calcStreak } from '../lib/streak';
import { Card } from '../components/ui/Card';
import { ActionButton } from '../components/ui/ActionButton';
import { PointCelebration, type PointReward } from '../components/PointCelebration';
import { praiseForMission } from '../lib/praise';
import type { Mission } from '../types';

// 서버의 순서나 식별자와 무관하게 미션 내용에 맞는 역할 그림을 고른다.
const missionIconFor = (title: string) => /출석|방문|접속/.test(title)
  ? CalendarDays
  : /퀴즈|정답|복습|문제/.test(title) ? Target : BookOpenText;

const HomeScreen = () => {
  const navigate = useNavigate();
  const { hydrated, xp, knownWords, unknownWords, missions, claimReward, claimingMissionIds, attendanceDates, dueQueue, myEmoji } = useAppContext();
  const { user } = useAuth();
  const isNewUser = hydrated && knownWords.length + unknownWords.length === 0;

  // 복습 카드 노출 로깅 (세션 1회 래치, hydration 전 프레임 오발화 방지)
  const reviewPromptLoggedRef = useRef(false);
  useEffect(() => {
    if (!hydrated || dueQueue.length === 0 || reviewPromptLoggedRef.current) return;
    reviewPromptLoggedRef.current = true;
    logClick('review_prompt_view', { count: dueQueue.length });
  }, [hydrated, dueQueue.length]);

  // 지금 할 미션이 먼저: 진행 중 → 받기 대기 → 완료(보상 받음). 같은 그룹 안에서는 서버 순서
  const missionRank = (m: Mission) => (m.isRewarded ? 2 : m.current >= m.target ? 1 : 0);
  const missionList = Object.values(missions).sort((a, b) => missionRank(a) - missionRank(b) || a.sortOrder - b.sortOrder);
  const streak = calcStreak(attendanceDates);
  const readyMissions = missionList.filter(m => !m.isRewarded && m.current >= m.target).length;
  const completedMissions = missionList.filter(m => m.isRewarded).length;

  // 보상 수령: 성공하면 축하 모달 + 정답과 같은 햅틱, 실패(슬롯이 바뀌었거나 네트워크)면 이유를 알려준다
  const [celebration, setCelebration] = useState<PointReward | null>(null);
  const handleClaim = async (missionId: string, reward: number) => {
    const res = await claimReward(missionId);
    if (res === 'pending') return;
    if (res) {
      feedbackClaim();
      setCelebration({ points: reward, xp: res.xpGained, source: 'mission' });   // 부스트 중이면 10
    } else {
      feedbackError();
      showModal('보상을 받지 못했어요. 잠시 후 다시 시도해주세요', 'error');
    }
  };
  const resetLabel = `${Math.ceil(msUntilNextSlot() / 3600000)}시간 뒤 초기화`;
  const stage = getGrowthStage(xp);

  return (
    <div className="app-soft-screen flex flex-col h-full pb-nav overflow-y-auto [&::-webkit-scrollbar]:hidden">

      {/* 히어로: 인사 · 티어 · 이번 주 출석 스트립 */}
      <div className="pt-4 px-5 pb-4">
        <div className="home-profile text-[var(--color-hero-ink)] anim-fade-up">
          <div className="home-profile-line">
            <div className="home-profile-avatar" style={{ borderRadius: 9999, background: 'var(--color-hero-chip)' }}>
              <ProfileAvatar emoji={myEmoji} size={56} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-base font-bold truncate">안녕하세요, {user?.nickname ?? DEFAULT_NICKNAME}님</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="inline-flex items-center gap-1 text-2xs font-bold pl-0.5 pr-2 py-0.5" style={{ borderRadius: 9999, background: 'var(--color-hero-chip)' }}>
                  <StageGlyph id={stage.id} size={18} />{stage.name}
                </span>
                <span className="inline-flex items-center gap-0.5 text-2xs font-bold">
                  <StreakIcon size={13} />{streak}일 연속
                </span>
              </div>
            </div>
          </div>

          {isNewUser ? (
            <ActionButton fullWidth size="lg" onClick={() => navigate('/course')} className="justify-between">
              돈 공부 시작하기 <ArrowRight size={18} />
            </ActionButton>
          ) : (
            <WeekStrip attendanceDates={attendanceDates} />
          )}
        </div>

        {/* 오늘 복습 카드 */}
        {dueQueue.length > 0 && (
          <Card
            pad="md"
            role="button"
            tabIndex={0}
            aria-label={`오늘 다시 볼 용어 ${dueQueue.length}개 복습 시작`}
            onClick={() => { logClick('review_start', { count: dueQueue.length, source: 'quest' }); navigate('/review'); }}
            onKeyDown={event => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                logClick('review_start', { count: dueQueue.length, source: 'quest' });
                navigate('/review');
              }
            }}
            className="mt-4 flex items-center justify-between active:opacity-80 cursor-pointer anim-fade-up focus-visible:outline-2 focus-visible:outline-brand-500"
            style={{ '--i': 1 } as React.CSSProperties}
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-brand-500/10 flex items-center justify-center shrink-0">
                <RotateCcw size={16} className="text-brand-500" />
              </div>
              <div className="text-left">
                <p className="text-sm font-bold text-[var(--color-ink)]">오늘 다시 볼 용어 {dueQueue.length}개</p>
                <p className="text-xs text-[var(--color-ink-3)]">다시 마주치면 바로 떠오르게요</p>
              </div>
            </div>
            <ChevronRight size={16} className="text-[var(--color-ink-4)]" />
          </Card>
        )}
      </div>

      {/* 오늘의 미션 */}
      <div className="px-5 flex flex-col gap-4">
        <div className="home-mission-heading anim-fade-up">
          <div>
            <h2 id="home-missions-heading">오늘의 미션</h2>
            <p className="mt-1! text-xs text-[var(--color-ink-3)] break-keep">{praiseForMission({ ready: readyMissions, completed: completedMissions })}</p>
          </div>
          <span className="shrink-0 text-2xs font-medium text-[var(--color-ink-4)]">{resetLabel}</span>
        </div>

        <Card pad="none" className="home-missions mb-4 anim-fade-up" aria-labelledby="home-missions-heading">
          <div className="flex flex-col">
            {missionList.map((mission, idx) => {
              const done = mission.current >= mission.target;
              const MissionIcon = missionIconFor(mission.title);
              return (
                <div key={mission.id} className="home-mission-row anim-fade-up" data-rewarded={mission.isRewarded || undefined} style={{ '--i': idx } as React.CSSProperties}>
                  <div className="home-mission-top">
                    <MissionIcon size={28} className="home-mission-icon" aria-hidden="true" />
                    <div className="home-mission-info">
                      <p className={`home-mission-title text-sm ${mission.isRewarded ? 'text-[var(--color-ink-4)] line-through' : 'text-[var(--color-ink)]'}`}>
                        {mission.title}
                      </p>
                      <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
                        <span className="home-mission-reward inline-flex items-center gap-1"><PointIcon size={16} />+{mission.reward}개</span>
                        <span className="inline-flex items-center gap-1 font-medium text-[var(--color-ink-3)]"><XpIcon size={13} />+{MISSION_XP} XP</span>
                      </p>
                    </div>
                    {mission.isRewarded || done
                      ? <MissionRewardStatus isRewarded={mission.isRewarded} pending={claimingMissionIds?.has(mission.id)} onClaim={() => handleClaim(mission.id, mission.reward)} />
                      : <span className="home-mission-count text-base font-bold text-[var(--color-ink)]">{mission.current}<span className="text-xs text-[var(--color-ink-4)]">/{mission.target}</span></span>
                    }
                  </div>
                  <div role="progressbar" aria-label={`${mission.title} 진행률`} aria-valuemin={0} aria-valuemax={mission.target} aria-valuenow={Math.min(mission.current, mission.target)} className="home-mission-progress flex gap-1">
                    {Array.from({ length: mission.target }).map((_, i) => (
                      <div
                        key={i}
                        className="flex-1 h-1 rounded-full transition-all duration-300"
                        style={{ backgroundColor: mission.isRewarded ? 'var(--color-line-strong)' : i < mission.current ? 'var(--color-progress)' : 'var(--color-surface)' }}
                      />
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
