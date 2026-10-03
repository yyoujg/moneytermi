// 배지 그림은 public/badges/{id}.png (수달 배지 시트에서 잘라냄)
export const BadgeGlyph = ({ id, size = 22, className }: { id: string; size?: number; className?: string }) => (
  <img src={`/badges/${id}.png`} alt="" aria-hidden="true" width={size} height={size} className={`shrink-0 ${className ?? ''}`} />
);
