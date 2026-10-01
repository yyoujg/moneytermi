import { useEffect, useRef, useState } from 'react';
import { BookOpen, BookOpenText, CalendarCheck2, ChevronRight, Clock3, Flame, NotebookText, Target, Trophy } from 'lucide-react';
import { Badge } from '@toss/tds-mobile';
import { showModal } from '../components/AlertModal';
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
import { StageGlyph } from '../components/StageGlyph';
import { ProfileAvatar } from '../components/ProfileAvatar';
import type { Mission } from '../types';

const HomeScreen = () => {
  const navigate = useNavigate();
  const { hydrated, xp, missions, claimReward, attendanceDates, dueQueue, myEmoji } = useAppContext();
  const { user } = useAuth();

  // 복습 카드 노출 로깅 (세션 1회 래치, hydration 전 프레임 오발화 방지)
  const reviewPromptLoggedRef = useRef(false);
  useEffect(() => {
    if (!hydrated || dueQueue.length === 0 || reviewPromptLoggedRef.current) return;
    reviewPromptLoggedRef.current = true;
    logClick('review_prompt_view', { count: dueQueue.length });
  }, [hydrated, dueQueue.length]);

  const missionList = Object.values(missions).sort((a, b) => a.sortOrder - b.sortOrder);
  const quiz3 = missionList.find(m => m.title.includes('퀴즈 정답') && m.target === 3);
  const quiz10 = missionList.find(m => m.title.includes('퀴즈 정답') && m.target === 10);
  const quizSteps = quiz3 && quiz10 ? [quiz3, quiz10] : [];
  const missionGroups: Mission[][] = [];
  for (const mission of missionList) {
    if (quizSteps.length === 2 && quizSteps.includes(mission)) {
      if (!missionGroups.includes(quizSteps)) missionGroups.push(quizSteps);
    } else {
      missionGroups.push([mission]);
    }
  }
  const streak = calcStreak(attendanceDates);

  // 보상 수령: 성공하면 축하 모달 + 정답과 같은 햅틱, 실패(슬롯이 바뀌었거나 네트워크)면 이유를 알려준다
  const [celebration, setCelebration] = useState<PointReward | null>(null);
  const handleClaim = async (missionId: string, reward: number) => {
    const res = await claimReward(missionId);
    if (res) {
      feedbackClaim();
      setCelebration({ points: reward, xp: res.xpGained, source: 'mission' });   // 부스트 중이면 10
    } else {
      feedbackError();
      showModal('보상을 받지 못했어요. 잠시 후 다시 시도해주세요', 'error');
    }
  };
  const stage = getGrowthStage(xp);
  const renderMission = (mission: Mission, grouped: boolean) => {
    const done = mission.current >= mission.target;
    const MissionIcon = mission.title.includes('출석') ? CalendarCheck2
      : mission.title.includes('새 단어') ? BookOpenText
        : mission.title.includes('10회') ? Trophy
          : mission.title.includes('퀴즈') ? Target : NotebookText;
    return (
      <div key={mission.id} className="py-3 first:pt-0 last:pb-0">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--color-brand-soft)] text-brand-500"><MissionIcon size={20} strokeWidth={2} /></span>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <p className={`min-w-0 truncate text-sm font-bold ${mission.isRewarded ? 'text-[var(--color-ink-3)]' : 'text-[var(--color-ink)]'}`}>{grouped ? `${mission.target}회 달성` : mission.title}</p>
              {mission.isRewarded
                ? <span className="anim-pop-in inline-flex shrink-0"><Badge color="elephant" size="small" variant="fill">완료</Badge></span>
                : <span className="shrink-0 text-base font-bold text-brand-ink">{mission.current}<span className="text-xs font-medium text-[var(--color-ink-3)]">/{mission.target}</span></span>}
            </div>
            <p className="mt-0.5! text-2xs text-[var(--color-ink-3)]">+{mission.reward}P · +{MISSION_XP} XP</p>
          </div>
        </div>
        <div className="ml-[52px] mt-2.5 h-1.5 overflow-hidden rounded-full bg-[var(--color-line)]">
          <div className="h-full rounded-full bg-brand-500 transition-all duration-[var(--dur-slow)] ease-soft"
            style={{ width: `${Math.min(100, (mission.current / mission.target) * 100)}%` }} />
        </div>
        {done && !mission.isRewarded && <button onClick={() => handleClaim(mission.id, mission.reward)} className="anim-attn ml-[52px] mt-3 min-h-11 rounded-button bg-brand-500 px-4 text-xs font-bold text-[var(--color-on-brand)] active:bg-brand-600">보상 받기</button>}
      </div>
    );
  };

  return (
    <div className="quest-screen flex flex-col h-full pb-nav overflow-y-auto [&::-webkit-scrollbar]:hidden" style={{ backgroundColor: 'var(--color-canvas)' }}>

      <div className="px-5 pb-5 pt-5">
        <div className="mb-4 flex items-center gap-3">
          <ProfileAvatar emoji={myEmoji} size={44} />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold truncate text-[var(--color-ink)]">{user?.nickname ?? DEFAULT_NICKNAME}님, 오늘도 함께 배워요</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="inline-flex items-center gap-1 text-2xs font-semibold text-[var(--color-ink-3)]">
                <StageGlyph id={stage.id} size={11} />{stage.name}
              </span>
              <span className="inline-flex items-center gap-0.5 text-2xs font-semibold text-[var(--color-ink-3)]">
                <Flame size={12} className="fill-current text-brand-500" />{streak}일 연속
              </span>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => { logClick('review_start', { count: dueQueue.length }); navigate('/review'); }}
          className="flex w-full items-center justify-between bg-[var(--color-card)] px-4 py-3.5 text-left active:opacity-80 anim-fade-up"
          style={{ '--i': 1, borderRadius: 20 } as React.CSSProperties}
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-brand-500/10 flex items-center justify-center shrink-0">
              <BookOpen size={23} className="text-brand-500" />
            </div>
            <div className="text-left">
              <p className="text-sm font-bold text-[var(--color-ink)]">오늘 복습할 단어</p>
              <p className="mt-0.5! text-lg font-bold text-[var(--color-ink)]">{dueQueue.length}개</p>
            </div>
          </div>
          <ChevronRight size={18} className="text-[var(--color-ink-3)]" />
        </button>
        <div className="mt-3 rounded-card bg-brand-500 px-4 py-3 text-[var(--color-on-brand)]">
          <p className="mb-2 text-xs font-bold">이번 주 출석</p>
          <WeekStrip attendanceDates={attendanceDates} />
        </div>
      </div>

      {/* 이번 미션 */}
      <div className="px-5">
        <Card pad="lg" className="mb-4 anim-fade-up" style={{ border: 0, '--i': 2 } as React.CSSProperties}>
          <div className="flex justify-between items-center gap-2 mb-4">
            <h2 className="flex items-center gap-1.5 text-base font-bold text-[var(--color-ink)]"><Clock3 size={18} className="text-brand-500" />이번 미션</h2>
            <span className="flex items-center gap-1 text-2xs font-medium text-[var(--color-ink-3)]"><Clock3 size={13} className="text-brand-500" />다음 미션까지 {Math.ceil(msUntilNextSlot() / 3600000)}시간</span>
          </div>

          <div className="flex flex-col divide-y divide-[var(--color-line)]">
            {missionGroups.map((group, idx) => (
              <div key={group[0].id} className="anim-fade-up py-3 first:pt-0 last:pb-0" style={{ '--i': idx + 2 } as React.CSSProperties}>
                {group.length > 1 && <p className="mb-3 text-sm font-bold text-[var(--color-ink)]">퀴즈 정답 · 단계별 보상</p>}
                <div className="divide-y divide-[var(--color-line)]">{group.map(mission => renderMission(mission, group.length > 1))}</div>
              </div>
            ))}
          </div>
        </Card>
        <button type="button" onClick={() => navigate('/course')}
          className="mb-5 flex w-full items-center gap-3 rounded-card bg-[var(--color-brand-soft)] px-4 py-4 text-left active:opacity-80">
          <ProfileAvatar emoji={myEmoji} size={44} />
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-bold text-[var(--color-ink)]">다음 주제 이어서 배우기</span>
            <span className="mt-1 block text-xs text-[var(--color-ink-3)]">오늘도 짧게 경제 단어를 익혀요</span>
          </span>
          <ChevronRight size={18} className="shrink-0 text-brand-500" />
        </button>
      </div>
      {celebration && <PointCelebration reward={celebration} onClose={() => setCelebration(null)} />}
    </div>
  );
};

export default HomeScreen;
