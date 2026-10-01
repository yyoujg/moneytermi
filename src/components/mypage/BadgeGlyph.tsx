import { BookMarked, BookOpen, Crown, Flame, LibraryBig, Medal, Sparkles, Sprout, Trophy, Zap, type LucideIcon } from 'lucide-react';

const GLYPHS: Record<string, LucideIcon> = {
  w1: Sprout,
  w10: BookOpen,
  w50: BookMarked,
  w100: LibraryBig,
  s3: Flame,
  s7: Zap,
  s30: Medal,
  x100: Sparkles,
  x500: Trophy,
  x1000: Crown,
} as const;

export const BadgeGlyph = ({ id, size = 22 }: { id: string; size?: number }) => {
  const Icon = GLYPHS[id] ?? Sparkles;
  return <Icon size={size} strokeWidth={2.2} aria-hidden="true" />;
};
