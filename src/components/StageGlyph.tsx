// 등급은 달리 장면으로 구분한다: 빈 지갑 → 돈 세기 → 안경·폰 → 투자 차트 → 돈더미 만세
// (public/league/v2, docs/character/league-final). 아직 못 간 등급은 회색 잠김본. 단순화본이 없어 크기와 상관없이 같은 그림을 쓴다.
const STAGE_FILE: Record<number, string> = { 1: 'tier1-moneybeginner', 2: 'tier2-saver', 3: 'tier3-routine', 4: 'tier4-investor', 5: 'tier5-master' };

export const StageGlyph = ({ id, size = 20, className = '', locked = false }: { id: number; size?: number; className?: string; locked?: boolean }) => {
  const variant = locked ? '-locked' : '';
  return (
    <img src={`/league/v2/league-${STAGE_FILE[id] ?? STAGE_FILE[1]}${variant}.svg`} alt="" aria-hidden="true" data-stage-id={id}
      width={size} height={size} className={`stage-glyph shrink-0 ${className}`} style={{ width: size, height: size }} />
  );
};
