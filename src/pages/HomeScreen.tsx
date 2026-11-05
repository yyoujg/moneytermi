import { useEffect, useState } from 'react';
import { MissionRewardStatus } from '../components/home/MissionRewardStatus';
import { showModal } from '../components/AlertModal';
import { feedbackClaim, feedbackError } from '../lib/feedback';
import { MISSION_XP } from '../constants';
import { useAppContext } from '../context/AppContext';
import { msUntilNextSlot } from '../lib/date';
import { Card } from '../components/ui/Card';
import { Check } from '../components/ui/OtterIcons';
import { PointCelebration, type PointReward } from '../components/PointCelebration';
import type { Mission } from '../types';
import { XpIcon } from '../components/StatIcons';
import { useAuth } from '../hooks/useAuth';
import { supabase, getGuestClient } from '../lib/supabase';
import { daysLeftInMonth, daysLeftInWeek, periodMissions, type PeriodMission } from '../lib/periodMissions';

const HomeScreen = () => {
  const { missions, claimReward, claimingMissionIds, attendanceDates, periodClaimed } = useAppContext();
  const { guestToken } = useAuth();
  // 이번 주 XP는 리그와 같은 값(my_league_rank). 못 받으면 0으로 둔다
  const [weeklyXp, setWeeklyXp] = useState(0);
  useEffect(() => {
    const db = guestToken ? getGuestClient(guestToken) : supabase;
    db.rpc('my_league_rank').then(({ data }) => setWeeklyXp((data as { points?: number } | null)?.points ?? 0), () => {});
  }, [guestToken]);
  const period = periodMissions(attendanceDates, weeklyXp);

  const missionRank = (m: Mission) => (m.isRewarded ? 2 : m.current >= m.target ? 0 : 1);
  const missionList = Object.values(missions).sort((a, b) => missionRank(a) - missionRank(b) || a.sortOrder - b.sortOrder);
  const readyMissions = missionList.filter(m => !m.isRewarded && m.current >= m.target).length;
  const completedMissions = missionList.filter(m => m.isRewarded).length;
  const doneMissions = readyMissions + completedMissions;
  const allMissionsDone = missionList.length > 0 && completedMissions === missionList.length;

  // 보상 수령: 성공하면 축하 모달 + 정답과 같은 햅틱, 실패(슬롯이 바뀌었거나 네트워크)면 이유를 알려준다
  const [celebration, setCelebration] = useState<PointReward | null>(null);
  const handleClaim = async (missionId: string) => {
    const res = await claimReward(missionId);
    if (res === 'pending') return;
    if (res) {
      feedbackClaim();
      setCelebration({ xp: res.xpGained });
    } else {
      feedbackError();
      showModal('보상을 받지 못했어요. 잠시 후 다시 시도해주세요', 'error');
    }
  };
  const resetLabel = `${Math.ceil(msUntilNextSlot() / 3600000)}시간 뒤 초기화`;

  return (
    <div className="quest-screen flex flex-col h-full pb-nav overflow-y-auto [&::-webkit-scrollbar]:hidden">

      <div className="pt-4 px-5 pb-4">
        <h2 className="type-page-title mb-4!">퀘스트</h2>
        {missionList.length > 0 && <section className="quest-hero" aria-label="지금 미션 요약">
          {allMissionsDone && <img className="quest-hero-character" src="/otter/v5/otter-cheer.svg" data-otter="cheer" alt="" aria-hidden="true" width={72} height={72} />}
          <div className="min-w-0 flex-1">
            {/* '지금 미션' 제목은 아래 목록에만 둔다 */}
            {allMissionsDone && <p className="type-supporting">지금 미션을 모두 마쳤어요</p>}
            <p className="quest-hero-count">지금 <strong>{doneMissions}</strong> / {missionList.length} 완료</p>
            <div role="progressbar" aria-label="지금 미션 전체 진행률" aria-valuemin={0} aria-valuemax={missionList.length} aria-valuenow={doneMissions} className="course-home-progress-track mt-2">
              <span style={{ width: `${Math.round(doneMissions / missionList.length * 100)}%` }} />
            </div>
          </div>
        </section>}
      </div>

      {/* 지금 미션(0·8·16시에 바뀐다) */}
      {missionList.length > 0 && <div className="quest-missions-section px-5 pt-4 flex flex-col gap-4">
        <Card pad="none" className="home-missions mb-4 anim-fade-up" aria-labelledby="home-missions-heading">
        <div className="home-mission-heading anim-fade-up">
          <div>
            <h2 id="home-missions-heading">지금 미션</h2>
            {/* 완료 수는 위 요약에 있으므로 받을 보상이 있을 때만 알려준다 */}
            {readyMissions > 0 && <p className="mt-1! text-xs text-[var(--color-ink-3)] break-keep">받을 수 있는 보상 {readyMissions}개</p>}
          </div>
          <span className="shrink-0 text-xs font-normal text-[var(--color-ink-3)]">{resetLabel}</span>
        </div>
          <div id="home-mission-list" className="flex flex-col">
            {missionList.map(mission => {
              const done = mission.current >= mission.target;
              return (
                // 미션마다 게이지를 두면 한눈에 안 들어와, 왼쪽 원(끝내면 체크)과 오른쪽 숫자로만 보여준다. 게이지는 위 전체 진행 하나
                <div key={mission.id} className="home-mission-row" data-rewarded={mission.isRewarded || undefined} data-done={done || undefined}>
                  <div className="home-mission-top">
                    <span className="home-mission-check" aria-hidden="true">{done && <Check size={16} />}</span>
                    <div className="home-mission-info">
                      <p className={`home-mission-title text-sm ${mission.isRewarded ? 'text-[var(--color-ink-3)]' : 'text-[var(--color-ink)]'}`}>
                        {mission.title}
                      </p>
                      <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
                        <span className="home-mission-reward inline-flex items-center gap-1"><XpIcon size={16} />+{MISSION_XP} XP</span>
                      </p>
                    </div>
                    {mission.isRewarded || done
                      ? <MissionRewardStatus isRewarded={mission.isRewarded} pending={claimingMissionIds?.has(mission.id)} onClaim={() => handleClaim(mission.id)} />
                      : <span className="home-mission-count text-sm font-semibold text-[var(--color-ink)]">{mission.current}<span className="text-xs font-normal text-[var(--color-ink-4)]">/{mission.target}</span></span>
                    }
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
        <PeriodMissionList id="week" title="이번 주 미션" resetLabel={`${daysLeftInWeek()}일 뒤 초기화`} missions={period.weekly} claimed={periodClaimed} />
        <PeriodMissionList id="month" title="이번 달 미션" resetLabel={`${daysLeftInMonth()}일 뒤 초기화`} missions={period.monthly} claimed={periodClaimed} />
      </div>}
      {celebration && <PointCelebration reward={celebration} onClose={() => setCelebration(null)} />}
    </div>
  );
};

// 주간·월간 미션. 행 모양은 일일 미션과 같다. 보상은 달성하면 AppContext가 자동으로 받고 축하 모달로 알린다.
// 서버에 보상 테이블이 없으면(claimed가 null) 진행도와 완료만 보여준다
const PeriodMissionList = ({ id, title, resetLabel, missions, claimed }: {
  id: string; title: string; resetLabel: string; missions: PeriodMission[]; claimed: Set<string> | null;
}) => (
  <Card pad="none" className="home-missions mb-4 anim-fade-up" aria-labelledby={`${id}-missions-heading`} data-period={id}>
    <div className="home-mission-heading">
      <div><h2 id={`${id}-missions-heading`}>{title}</h2></div>
      <span className="shrink-0 text-xs font-normal text-[var(--color-ink-3)]">{resetLabel}</span>
    </div>
    <div className="flex flex-col">
      {missions.map(mission => {
        const done = mission.current >= mission.target;
        const rewarded = claimed ? claimed.has(`${mission.id}:${mission.periodStart}`) : done;
        return (
          <div key={mission.id} className="home-mission-row" data-done={done || undefined} data-rewarded={rewarded || undefined}>
            <div className="home-mission-top">
              <span className="home-mission-check" aria-hidden="true">{done && <Check size={16} />}</span>
              <div className="home-mission-info">
                <p className={`home-mission-title text-sm ${rewarded ? 'text-[var(--color-ink-3)]' : 'text-[var(--color-ink)]'}`}>{mission.title}</p>
                {claimed && <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
                  <span className="home-mission-reward inline-flex items-center gap-1"><XpIcon size={16} />+{mission.xp} XP</span>
                </p>}
              </div>
              {done
                ? <MissionRewardStatus isRewarded={rewarded} pending onClaim={() => {}} />
                : <span className="home-mission-count text-sm font-semibold text-[var(--color-ink)]">{mission.current}<span className="text-xs font-normal text-[var(--color-ink-4)]">/{mission.target}</span></span>}
            </div>
          </div>
        );
      })}
    </div>
  </Card>
);

export default HomeScreen;
