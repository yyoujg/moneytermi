import { BookBookmark, BookOpen, Books, Coin, Coins, Diamond, Fire, Lightning, Medal, Plant, type Icon } from '@phosphor-icons/react';

const STAT: Record<string, string> = { w: 'words', s: 'streak', x: 'xp' };
// 배지는 옅은 보라 원 안의 보라 선형 아이콘이다. 미획득은 회색 원과 회색 아이콘이다.
const BADGE_ICON: Record<string, Icon> = {
  w1: Plant, w10: BookOpen, w50: BookBookmark, w100: Books,
  s3: Fire, s7: Lightning, s30: Medal,
  x100: Coin, x500: Coins, x1000: Diamond, // 왕관은 경제고수 티어 표시라 겹치지 않게
};

export const BadgeGlyph = ({ id, size = 22, className = '', earned = true }: {
  id: string; size?: number; className?: string; earned?: boolean;
}) => {
  const Glyph = BADGE_ICON[id] ?? Medal;
  return (
    <span aria-hidden="true" data-badge-id={id} data-earned={earned} data-badge-stat={STAT[id[0]]}
      className={`badge-glyph shrink-0 ${earned ? '' : 'is-locked'} ${className}`} style={{ width: size, height: size }}>
      <Glyph weight="regular" size={size >= 80 ? 48 : 24} color="currentColor" focusable="false" />
    </span>
  );
};
