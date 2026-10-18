// 리그 등급(GROWTH_STAGES id 1~5) 그림: public/otter/v3/tiers/{id}.png
export const StageGlyph = ({ id, size = 20, className = '' }: { id: number; size?: number; className?: string }) => (
  <img src={`/otter/v3/tiers/${id}.png`} alt="" aria-hidden="true" width={size} height={size} className={`shrink-0 ${className}`} />
);
