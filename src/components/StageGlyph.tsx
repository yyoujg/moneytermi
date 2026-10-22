// 리그 등급(GROWTH_STAGES id 1~5)은 단계 번호로 표시한다.
export const StageGlyph = ({ id, size = 20, className = '' }: { id: number; size?: number; className?: string }) => (
  <span aria-hidden="true" data-stage-id={id} className={`stage-glyph ${className}`} style={{ width: size, height: size, fontSize: Math.round(size * 0.4) }}>{id}</span>
);
