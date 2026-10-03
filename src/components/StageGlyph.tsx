// 리그 등급(GROWTH_STAGES id 1~5) 그림: public/tiers/{id}.png
export const StageGlyph = ({ id, size = 20, className = '' }: { id: number; size?: number; className?: string }) => (
  <img src={`/tiers/${id}.png`} alt="" aria-hidden="true" width={size} height={size} className={`shrink-0 ${className}`} />
);
