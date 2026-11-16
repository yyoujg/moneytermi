import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Flag, Gift } from '@phosphor-icons/react';
import { MissionRewardStatus } from '../components/home/MissionRewardStatus';
import { showModal } from '../components/AlertModal';
import { feedbackClaim, feedbackError } from '../lib/feedback';
import { MISSION_XP } from '../constants';
import { useAppContext } from '../context/AppContext';
import { msUntilNextSlot } from '../lib/date';
import { PointCelebration, type PointReward } from '../components/PointCelebration';
import type { Mission } from '../types';
import { XpIcon } from '../components/StatIcons';
import { Check, ChevronRight, ListChecks } from '../components/ui/OtterIcons';
import { useAuth } from '../hooks/useAuth';
import { m } from 'motion/react';
import { supabase, getGuestClient } from '../lib/supabase';
import { daysLeftInMonth, daysLeftInWeek, periodMissions, type PeriodMission } from '../lib/periodMissions';
import './HomeScreen.css';

const HomeScreen = () => {
  const { missions, claimReward, claimingMissionIds, attendanceDates, periodClaimed } = useAppContext();
  const { guestToken } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<'now' | 'rewards'>('now');
  const screenRef = useRef<HTMLDivElement>(null);
  const tabsRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (screenRef.current) screenRef.current.scrollTop = 0;
  }, [tab]);
  const [weeklyXp, setWeeklyXp] = useState(0);
  useEffect(() => {
    const db = guestToken ? getGuestClient(guestToken) : supabase;
    db.rpc('my_league_rank').then(({ data }) => setWeeklyXp((data as { points?: number } | null)?.points ?? 0), () => {});
  }, [guestToken]);
  const period = periodMissions(attendanceDates, weeklyXp);
  const maxPeriodXp = Math.max(...period.weekly.map(mission => mission.xp), ...period.monthly.map(mission => mission.xp));

  const missionRank = (m: Mission) => (m.isRewarded ? 2 : m.current >= m.target ? 0 : 1);
  const missionList = Object.values(missions).sort((a, b) => missionRank(a) - missionRank(b) || a.sortOrder - b.sortOrder);
  const readyMissions = missionList.filter(m => !m.isRewarded && m.current >= m.target).length;
  const completedMissions = missionList.filter(m => m.isRewarded).length;
  const doneMissions = readyMissions + completedMissions;
  const allMissionsDone = missionList.length > 0 && completedMissions === missionList.length;

  const [celebration, setCelebration] = useState<PointReward | null>(null);
  const handleClaim = async (missionId: string) => {
    const res = await claimReward(missionId);
    if (res === 'pending') return;
    if (res) {
      feedbackClaim();
      setCelebration({ xp: res.xpGained });
    } else {
      feedbackError();
      showModal('보상을 받지 못했어요. 잠시 후 다시 받아 주세요.', 'error');
    }
  };
  const resetLabel = `${Math.ceil(msUntilNextSlot() / 3600000)}시간 뒤 새 미션`;

  return (
    <div ref={screenRef} className="quest-screen flex flex-col h-full pb-nav overflow-y-auto [&::-webkit-scrollbar]:hidden">
      <h2 className="sr-only">퀘스트</h2>
      <div ref={tabsRef} className="quest-tabs" role="tablist" aria-label="미션 종류" onKeyDown={event => {
        if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
        event.preventDefault();
        const next = event.key === 'Home' ? 'now' : event.key === 'End' ? 'rewards' : tab === 'now' ? 'rewards' : 'now';
        setTab(next);
        tabsRef.current?.querySelector<HTMLButtonElement>(`#quest-tab-${next}`)?.focus();
      }}>
        <button type="button" id="quest-tab-now" role="tab" aria-selected={tab === 'now'} aria-controls="quest-panel-now" tabIndex={tab === 'now' ? 0 : -1} onClick={() => setTab('now')}>
          <Flag size={20} weight="regular" aria-hidden="true" />
          <span>지금 미션</span>
          {readyMissions > 0 && <span className="quest-tab-dot" aria-label={`받을 보상 ${readyMissions}개`} />}
        </button>
        <button type="button" id="quest-tab-rewards" role="tab" aria-selected={tab === 'rewards'} aria-controls="quest-panel-rewards" tabIndex={tab === 'rewards' ? 0 : -1} onClick={() => setTab('rewards')}>
          <Gift size={20} weight="regular" aria-hidden="true" />
          <span>큰 보상</span>
        </button>
      </div>

      <div id="quest-panel-now" role="tabpanel" aria-labelledby="quest-tab-now" hidden={tab !== 'now'} className="quest-panel">
        <section className="quest-intro" aria-labelledby="quest-intro-title">
          <div>
            <p className="quest-eyebrow">돈 공부, 오늘도 한 판</p>
            <h2 id="quest-intro-title">미션은 가볍게<br />보상은 차곡차곡</h2>
            <p className="quest-intro-caption">하나씩 클리어하고 XP 챙겨 가!</p>
          </div>
          <img src="/otter/v5/otter-explain.svg" alt="" width={116} height={136} />
        </section>

        {missionList.length > 0 ? <section className="quest-daily-card" aria-labelledby="quest-daily-title">
          <div className="quest-card-heading">
            <h2 id="quest-daily-title">지금 미션</h2>
            <span className="quest-reset">{resetLabel}</span>
          </div>
          <div className="quest-daily-progress">
            <ProgressBar label="지금 미션 완료" current={doneMissions} target={missionList.length} />
            <span><strong>{doneMissions}</strong> / {missionList.length}</span>
          </div>
          <p className="quest-daily-caption" aria-live="polite">{allMissionsDone ? '지금 미션 올클!' : readyMissions > 0 ? `받을 수 있는 보상 ${readyMissions}개` : '미션 하나 깨고, 보상도 챙기자'}</p>
          <div className="quest-mission-list">
            {missionList.map(mission => {
              const done = mission.current >= mission.target;
              return (
                <m.div layout="position" transition={{ type: 'spring', stiffness: 420, damping: 36 }} key={mission.id} className="quest-mission-row" data-rewarded={mission.isRewarded || undefined}>
                  <span className="quest-mission-icon" data-done={done || undefined} aria-hidden="true">
                    {done ? <Check size={18} /> : <ListChecks size={20} />}
                  </span>
                  <div className="quest-mission-info">
                    <p className="quest-mission-title">{mission.title}</p>
                    <p className="quest-mission-meta"><span><XpIcon size={14} />+{MISSION_XP} XP</span>{!done && <span>{mission.current}/{mission.target}</span>}</p>
                  </div>
                  {mission.isRewarded || done
                    ? <MissionRewardStatus isRewarded={mission.isRewarded} pending={claimingMissionIds?.has(mission.id)} onClaim={() => handleClaim(mission.id)} />
                    : <button type="button" className="quest-go" aria-label={`${mission.title} 도전`} onClick={() => navigate('/course')}>도전</button>}
                </m.div>
              );
            })}
          </div>
        </section> : <div className="quest-empty"><p>새 미션 준비 중! 먼저 공부해 볼까?</p><button type="button" className="quest-go" onClick={() => navigate('/course')}>학습하기</button></div>}

        <button type="button" className="quest-rewards-link" onClick={() => setTab('rewards')}>
          <span className="quest-link-icon"><Gift size={20} weight="regular" aria-hidden="true" /></span>
          <span><strong>꾸준히 하면 보상도 레벨업</strong><span>미션당 최대 {maxPeriodXp} XP · 지금 미션의 {maxPeriodXp / MISSION_XP}배</span></span>
          <ChevronRight size={18} />
        </button>
        <p className="quest-footnote">지금 미션은 매일 0시·8시·16시에 바뀌어요</p>
      </div>

      <div id="quest-panel-rewards" role="tabpanel" aria-labelledby="quest-tab-rewards" hidden={tab !== 'rewards'} className="quest-panel">
        <div className="quest-rewards-heading">
          <p className="quest-eyebrow">지금 미션은 하나당 {MISSION_XP} XP</p>
          <h2>차곡차곡 쌓으면<br />최대 {maxPeriodXp / MISSION_XP}배의 보상</h2>
          <p>주간·월간 미션 하나를 달성했을 때의 보상이에요.</p>
          {!periodClaimed && <p className="quest-reward-unavailable" role="status">아래는 보상 기준이에요. 현재 지급 상태는 확인할 수 없어요.</p>}
        </div>
        <div className="quest-reward-cards">
          {period.weekly.map(mission => <PeriodMissionCard key={mission.id} mission={mission} claimed={periodClaimed} period="week" resetLabel={`${daysLeftInWeek()}일 남음`} onGo={() => navigate('/course')} />)}
          {period.monthly.map(mission => <PeriodMissionCard key={mission.id} mission={mission} claimed={periodClaimed} period="month" resetLabel={`${daysLeftInMonth()}일 남음`} onGo={() => navigate('/course')} />)}
        </div>
      </div>
      {celebration && <PointCelebration reward={celebration} onClose={() => setCelebration(null)} />}
    </div>
  );
};

const PeriodMissionCard = ({ mission, claimed, period, resetLabel, onGo }: {
  mission: PeriodMission; claimed: Set<string> | null; period: 'week' | 'month'; resetLabel: string; onGo: () => void;
}) => {
  const done = mission.current >= mission.target;
  const rewarded = claimed ? claimed.has(`${mission.id}:${mission.periodStart}`) : done;
  const illustration = mission.id === 'w-xp' ? 'otter-explain' : period === 'month' ? 'otter-cheer' : 'otter-idle';
  return (
    <section className="quest-reward-card" data-period={period} data-mission={mission.id} aria-labelledby={`reward-${mission.id}`}>
      <div className="quest-reward-card-top"><span>{period === 'week' ? '이번 주 미션' : '이번 달 미션'}</span><span>{resetLabel}</span></div>
      <div className="quest-reward-card-body">
        <div className="quest-reward-detail">
          <h3 id={`reward-${mission.id}`}>{mission.title}</h3>
          <p className="quest-reward-amount" aria-label={`보상 기준 ${mission.xp} XP`}><strong>+{mission.xp}</strong><span>XP</span></p>
          <p className="quest-reward-multiplier">지금 미션 1개 보상의 <strong>{mission.xp / MISSION_XP}배</strong></p>
        </div>
        <img className="quest-reward-art" src={`/otter/v5/${illustration}.svg`} alt="" width={80} height={112} />
      </div>
      <div className="quest-reward-progress"><ProgressBar label={mission.title} current={mission.current} target={mission.target} /><span>{mission.current}/{mission.target}</span></div>
      <div className="quest-reward-action">
        <span className="quest-reward-delivery">{claimed ? rewarded ? '보상 적립 완료' : '달성하면 자동 적립' : '보상 기준 안내'}</span>
        {done ? <MissionRewardStatus isRewarded={rewarded} pending onClaim={() => {}} /> : <button type="button" className="quest-go" onClick={onGo}>학습하기<ChevronRight size={14} /></button>}
      </div>
    </section>
  );
};

const ProgressBar = ({ label, current, target }: { label: string; current: number; target: number }) => (
  <div className="quest-progress-track" role="progressbar" aria-label={label} aria-valuemin={0} aria-valuemax={target} aria-valuenow={Math.min(current, target)}>
    <span style={{ width: `${Math.min(current / target, 1) * 100}%` }} />
  </div>
);

export default HomeScreen;
