/* eslint-disable react-refresh/only-export-components */
import { BookOpen, Coins, Flame, Lightning, Trophy } from './ui/OtterIcons';

// 재화와 학습 정보는 색 없는 선형 아이콘으로 표시한다. 숫자는 본문색을 쓴다.
type Props = { size?: number; className?: string };
export const STAT_COLOR = {
  streak: 'var(--color-ink-2)',
  xp: 'var(--color-ink-2)',
  points: 'var(--color-ink-2)',
  words: 'var(--color-ink-2)',
} as const;

export const StreakIcon = ({ size = 16, className = '' }: Props) => (
  <Flame size={size} className={`shrink-0 text-[var(--color-stat-streak)] ${className}`} />
);
export const XpIcon = ({ size = 16, className = '' }: Props) => (
  <Trophy size={size} className={`shrink-0 text-[var(--color-stat-xp)] ${className}`} />
);
export const PointIcon = ({ size = 16, className = '' }: Props) => (
  <Coins size={size} className={`shrink-0 text-[var(--color-stat-points)] ${className}`} />
);
export const EnergyIcon = ({ size = 16, className = '' }: Props) => (
  <Lightning size={size} className={`shrink-0 text-[var(--color-stat-energy)] ${className}`} />
);
export const WordsIcon = ({ size = 16, className = '' }: Props) => (
  <BookOpen size={size} className={`shrink-0 text-[var(--color-stat-words)] ${className}`} />
);
