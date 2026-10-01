import { BookOpen, Coins, Flame, Zap } from 'lucide-react';

type Props = { size?: number; className?: string };

export const StreakIcon = ({ size = 16, className = '' }: Props) => (
  <Flame size={size} strokeWidth={2} className={className} color="var(--color-stat-streak)" aria-hidden="true" />
);

export const XpIcon = ({ size = 16, className = '' }: Props) => (
  <Zap size={size} strokeWidth={2} className={className} color="var(--color-stat-xp)" aria-hidden="true" />
);

export const PointIcon = ({ size = 16, className = '' }: Props) => (
  <Coins size={size} strokeWidth={2} className={className} color="var(--color-stat-points)" aria-hidden="true" />
);

export const WordsIcon = ({ size = 16, className = '' }: Props) => (
  <BookOpen size={size} strokeWidth={2} className={className} color="var(--color-stat-words)" aria-hidden="true" />
);
