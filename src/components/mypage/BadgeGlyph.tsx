const STAT: Record<string, string> = { w: 'words', s: 'streak', x: 'xp' };

// 성취 배지는 분야 색 원 안에 목표 숫자를 쓴다. 획득 조건과 미획득 표시 규칙은 유지한다.
export const BadgeGlyph = ({ id, size = 22, className = '', earned = true }: {
  id: string; size?: number; className?: string; earned?: boolean;
}) => (
  <span aria-hidden="true" data-badge-id={id} data-earned={earned} data-badge-stat={STAT[id[0]]}
    className={`identity-badge badge-tone badge-glyph ${className}`}
    style={{ width: size, height: size, fontSize: Math.round(size * 0.3) }}>
    {id.slice(1)}
  </span>
);
