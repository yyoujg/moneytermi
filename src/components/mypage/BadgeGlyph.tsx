// 새 앱 수달과 같은 그림체의 성취 배지. 획득 조건과 미획득 표시 규칙은 유지한다.
export const BadgeGlyph = ({ id, size = 22, className = '', earned = true }: {
  id: string; size?: number; className?: string; earned?: boolean;
}) => (
  <img src={`/otter/v3/badges/${id}.png`} alt="" aria-hidden="true" width={size} height={size}
    data-badge-id={id} data-earned={earned}
    className={`identity-badge shrink-0 ${earned ? '' : 'grayscale opacity-40'} ${className}`} />
);
