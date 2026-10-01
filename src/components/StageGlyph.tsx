import { Award, Crosshair, Gem, Mountain, Sprout } from 'lucide-react';

const ICONS = [Sprout, Mountain, Crosshair, Gem, Award];

export const StageGlyph = ({ id, size = 20, className = '' }: { id: number; size?: number; className?: string }) => {
  const Icon = ICONS[id - 1]!;
  return <Icon size={size} strokeWidth={2.2} className={className} aria-hidden="true" />;
};
