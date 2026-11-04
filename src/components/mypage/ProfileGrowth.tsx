import { StageGlyph } from '../StageGlyph';
import { getGrowthStage, GROWTH_STAGES, LEAGUE_PROMOTE_TOP } from '../../constants';

// 등급은 주간 순위로 오른다(서버 정산). 진행 막대 대신 다음 등급 조건만 한 줄로 보여준다.
export const ProfileGrowth = ({ stageId }: { stageId: number }) => {
  const stage = getGrowthStage(stageId);
  const next = GROWTH_STAGES.find(candidate => candidate.id === stage.id + 1);

  return (
    <div role="group" aria-label="등급 성장" className="profile-growth">
      <p className="profile-growth-stage"><StageGlyph id={stage.id} size={24} />{stage.name}</p>
      <p className="profile-growth-detail">
        {next ? <>주간 <span>{LEAGUE_PROMOTE_TOP}위 안</span>에 들면 다음 주 {next.name}</> : '최고 단계에 도달했어요'}
      </p>
    </div>
  );
};
