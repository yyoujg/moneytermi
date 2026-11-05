/* eslint-disable react-refresh/only-export-components */
import { BookOpen, Coins, Fire, Star, type Icon } from '@phosphor-icons/react';
// 상단바·마이페이지 요약 전용 아이콘(연속 학습·XP·코인·배운 단어). 선형 단색이고 글자색을 따른다(포인트 컬러는 보라 하나).
type Props = { size?: number; className?: string };
// 숫자도 아이콘과 같은 색으로 칠할 수 있게 밖으로 꺼내 둔다
// 숫자는 강조 중립색(neutral-strong) 볼드
export const STAT_COLOR = { streak: 'var(--color-neutral-strong)', xp: 'var(--color-neutral-strong)', points: 'var(--color-neutral-strong)', words: 'var(--color-neutral-strong)' } as const;

const Line = ({ icon: Glyph, name, size = 16, className }: Props & { icon: Icon; name: string }) => (
  <Glyph weight="bold" size={size} color="currentColor" aria-hidden="true" focusable="false" data-icon={name} className={`shrink-0 ${className ?? ''}`} />
);

export const StreakIcon = (p: Props) => <Line {...p} icon={Fire} name="Streak" />;
export const XpIcon = (p: Props) => <Line {...p} icon={Star} name="Xp" />;
export const PointIcon = (p: Props) => <Line {...p} icon={Coins} name="Point" />;
export const WordsIcon = (p: Props) => <Line {...p} icon={BookOpen} name="Words" />;

export const EnergyIcon = ({ size = 16, className = '' }: Props) => <img src="/icons/stat/icon-energy.svg" alt="" aria-hidden="true" width={size} height={size} data-stat-icon="energy" className={`shrink-0 ${className}`} />;
