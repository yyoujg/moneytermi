// 상단바·마이페이지 요약 전용 채워진 아이콘(연속 학습·XP·포인트·배운 단어). lucide는 선 아이콘이라 채우면 안쪽 선이 묻혀서 직접 그렸다.
// 아이콘은 차분한 강조색으로 구분하고, 숫자는 중립 잉크색으로 읽기 쉽게 둔다.
type Props = { size?: number; className?: string };
// 숫자도 아이콘과 같은 색으로 칠할 수 있게 밖으로 꺼내 둔다
export const STAT_COLOR = { streak: 'var(--color-stat-streak)', xp: 'var(--color-stat-xp)', points: 'var(--color-stat-points)', words: 'var(--color-stat-words)' } as const;

const Svg = ({ size = 16, className, color, children }: Props & { color: string; children: React.ReactNode }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className} style={{ color }} aria-hidden="true"
    fill="currentColor" stroke="currentColor" strokeWidth={1.5} strokeLinejoin="round" strokeLinecap="round">
    {children}
  </svg>
);
const HL = { fill: '#fff', fillOpacity: 0.4, stroke: 'none' } as const;

export const StreakIcon = (p: Props) => (
  <Svg {...p} color={STAT_COLOR.streak}>
    {/* 불꽃은 바닥을 축으로 살랑이고, 안쪽 불꽃은 반 박자 늦게 따라간다 */}
    <path className="anim-flicker" d="M12 2.5c.7 3.3 6 5.6 6 11a6 6 0 0 1-12 0c0-2.4 1.2-4 2.5-5.1.2 1.6 1 2.7 2.1 3.2C10.3 8.6 11 5.4 12 2.5z" />
    <path {...HL} className="anim-flicker" style={{ animationDelay: '-0.9s' }} d="M12 13.2c1.3 1 2.2 2.1 2.2 3.4a2.2 2.2 0 0 1-4.4 0c0-1.3.9-2.4 2.2-3.4z" />
  </Svg>
);

export const XpIcon = (p: Props) => (
  <Svg {...p} color={STAT_COLOR.xp}>
    <path d="M7 3.5h10l4 5L12 20.5 3 8.5l4-5z" />
    <path {...HL} d="M8.4 8.5h7.2L12 18.2 8.4 8.5z" />
    <path {...HL} fillOpacity={0.25} d="M7 3.5 8.4 8.5H3L7 3.5z" />
  </Svg>
);

export const PointIcon = (p: Props) => (
  <Svg {...p} color={STAT_COLOR.points}>
    <path d="M13.5 2.5 5 13.5h6l-1 8 8.5-11.2h-6.2l1.2-7.8z" />
    <path {...HL} d="M12.2 5.8 7.8 11.6h3.1l.1-.8 1.2-5z" />
  </Svg>
);

export const WordsIcon = (p: Props) => (
  <Svg {...p} color={STAT_COLOR.words}>
    <path d="M6.5 3h11a1 1 0 0 1 1 1v16.5l-6.5-3.8-6.5 3.8V4a1 1 0 0 1 1-1z" />
    <path {...HL} d="M9 7h6v1.6H9zM9 10.2h4v1.6H9z" />
  </Svg>
);
