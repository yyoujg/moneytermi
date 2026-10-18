import { getGrowthStage, GROWTH_STAGES } from '../../constants';

// 경험치와 등급 기준은 그대로 두고 현재 등급 구간의 진행만 표시한다.
export const ProfileGrowth = ({ xp }: { xp: number }) => {
  const stage = getGrowthStage(xp);
  const next = GROWTH_STAGES.find(candidate => candidate.id === stage.id + 1);
  const remaining = next ? Math.max(0, next.minPoints - xp) : null;
  const span = next ? next.minPoints - stage.minPoints : 0;
  const earned = next ? Math.min(span, Math.max(0, xp - stage.minPoints)) : 0;
  const progress = span > 0 ? earned / span * 100 : 0;

  return (
    <div role="group" aria-label="수달 성장" className="profile-growth">
      <p className="profile-growth-stage">{stage.name}</p>
      <p className="profile-growth-detail">
        {next && remaining !== null ? (
          <>{next.name}까지 <span>{remaining.toLocaleString()} XP</span></>
        ) : '최고 단계에 도달했어요'}
      </p>
      {next && <div className="profile-growth-track" role="progressbar" aria-label={`${stage.name} 성장 진행률`}
        aria-valuemin={0} aria-valuemax={span} aria-valuenow={earned}
        aria-valuetext={`현재 등급에서 ${earned.toLocaleString()} / ${span.toLocaleString()} XP, ${next.name}까지 ${remaining?.toLocaleString()} XP`}>
        <span style={{ width: `${progress}%` }} />
      </div>}
    </div>
  );
};
