// 등급은 수달과 같은 낙서 그림체 일러스트로 구분한다: 새싹 → 저금통 → 자명종 → 상승 차트 → 왕관
// (public/league/v1, docs/character/league/trace_league.py로 벡터화). 아직 못 간 등급은 회색 잠김본, 40px 이하는 단순화본.
const STAGE_FILE: Record<number, string> = { 1: 'tier1-moneybeginner', 2: 'tier2-saver', 3: 'tier3-routine', 4: 'tier4-investor', 5: 'tier5-master' };

export const StageGlyph = ({ id, size = 20, className = '', locked = false }: { id: number; size?: number; className?: string; locked?: boolean }) => {
  const variant = locked ? '-locked' : size <= 40 ? '-small' : '';
  return (
    <img src={`/league/v1/league-${STAGE_FILE[id] ?? STAGE_FILE[1]}${variant}.svg`} alt="" aria-hidden="true" data-stage-id={id}
      width={size} height={size} className={`stage-glyph shrink-0 ${className}`} style={{ width: size, height: size }} />
  );
};
