/* eslint-disable react-refresh/only-export-components */
import { BookOpen, CalendarDays, Trophy } from './ui/OtterIcons';
import { OTTER_ITEM_IMAGES } from '../lib/otter';

// 재화와 학습 정보는 공통 원형 파스텔 그림, 숫자는 기존 본문색으로 표시한다.
type Props = { size?: number; className?: string };
// 숫자는 공통 본문색을 사용하고, 아이콘의 기존 장식색과 분리한다
export const STAT_COLOR = {
  streak: 'var(--color-ink-2)',
  xp: 'var(--color-ink-2)',
  points: 'var(--color-ink-2)',
  words: 'var(--color-ink-2)',
} as const;

export const StreakIcon = ({ size = 16, className = '' }: Props) => (
  <CalendarDays size={size} strokeWidth={1.8} aria-hidden="true" className={`shrink-0 text-[var(--color-stat-streak)] ${className}`} />
);
export const XpIcon = ({ size = 16, className = '' }: Props) => (
  <Trophy size={size} strokeWidth={1.8} aria-hidden="true" className={`shrink-0 text-[var(--color-stat-xp)] ${className}`} />
);
export const PointIcon = ({ size = 16, className = '' }: Props) => (
  <img src={OTTER_ITEM_IMAGES.shell} alt="" aria-hidden="true" draggable={false} width={size} height={size}
    className={`otter-item-icon shrink-0 object-contain ${className}`} style={{ width: size, height: size }} />
);
export const EnergyIcon = ({ size = 16, className = '' }: Props) => (
  <img src={OTTER_ITEM_IMAGES.fish} alt="" aria-hidden="true" draggable={false} width={size} height={size}
    className={`otter-item-icon shrink-0 object-contain ${className}`} style={{ width: size, height: size }} />
);
export const WordsIcon = ({ size = 16, className = '' }: Props) => (
  <BookOpen size={size} strokeWidth={2} aria-hidden="true" className={`shrink-0 text-[var(--color-stat-words)] ${className}`} />
);
