import { useState } from 'react';
import { MissionRewardStatus } from '../components/home/MissionRewardStatus';
import { showModal } from '../components/AlertModal';
import { feedbackClaim, feedbackError } from '../lib/feedback';
import { MISSION_XP } from '../constants';
import { useAppContext } from '../context/AppContext';
import { msUntilNextSlot } from '../lib/date';
import { Card } from '../components/ui/Card';
import { PointCelebration, type PointReward } from '../components/PointCelebration';
import type { Mission } from '../types';
import { XpIcon } from '../components/StatIcons';

const HomeScreen = () => {
  const { missions, claimReward, claimingMissionIds } = useAppContext();

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
    <div className="app-soft-screen flex flex-col h-full pb-nav overflow-y-auto [&::-webkit-scrollbar]:hidden">

      <div className="pt-4 px-5 pb-4">
        <h2 className="type-page-title mb-4!">퀘스트</h2>
        {missionList.length > 0 && <section className="quest-hero" aria-label="오늘의 미션 요약">
          <img className="quest-hero-character" src={allMissionsDone ? '/otter/v4/joy.png' : '/otter/v4/hello.png'} alt="" aria-hidden="true" width={72} height={100} />
          <div className="min-w-0 flex-1">
            <p className="type-supporting">{allMissionsDone ? '오늘 미션을 모두 마쳤어요' : '오늘의 미션'}</p>
            <p className="quest-hero-count"><strong>{doneMissions}</strong> / {missionList.length} 완료</p>
            <div role="progressbar" aria-label="오늘의 미션 전체 진행률" aria-valuemin={0} aria-valuemax={missionList.length} aria-valuenow={doneMissions} className="course-home-progress-track mt-2">
              <span style={{ width: `${Math.round(doneMissions / missionList.length * 100)}%` }} />
            </div>
          </div>
        </section>}
      </div>

      {/* 오늘의 미션 */}
      {missionList.length > 0 && <div className="quest-missions-section px-5 pt-4 flex flex-col gap-4">
        <Card pad="none" className="home-missions mb-4 anim-fade-up" aria-labelledby="home-missions-heading">
        <div className="home-mission-heading anim-fade-up">
          <div>
            <h2 id="home-missions-heading">오늘의 미션</h2>
            {/* 완료 수는 위 요약에 있으므로 받을 보상이 있을 때만 알려준다 */}
            {readyMissions > 0 && <p className="mt-1! text-xs text-[var(--color-ink-3)] break-keep">받을 수 있는 보상 {readyMissions}개</p>}
          </div>
          <span className="shrink-0 text-2xs font-normal text-[var(--color-ink-3)]">{resetLabel}</span>
        </div>
          <div id="home-mission-list" className="flex flex-col">
            {missionList.map(mission => {
              const done = mission.current >= mission.target;
              return (
                <div key={mission.id} className="home-mission-row" data-rewarded={mission.isRewarded || undefined}>
                  <div className="home-mission-top">
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
                      : <span className="home-mission-count text-sm font-semibold text-[var(--color-ink)]">{mission.current}<span className="text-xs text-[var(--color-ink-4)]">/{mission.target}</span></span>
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
      </div>}
      {celebration && <PointCelebration reward={celebration} onClose={() => setCelebration(null)} />}
    </div>
  );
};

export default HomeScreen;
