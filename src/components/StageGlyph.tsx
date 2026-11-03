import { ChartLineUp, Crown, ListChecks, PiggyBank, Plant, type Icon } from '@phosphor-icons/react';

// 등급은 선형 아이콘으로 구분한다: 씨앗 → 저금통 → 체크리스트 → 상승 차트 → 왕관
const STAGE_ICON: Record<number, Icon> = { 1: Plant, 2: PiggyBank, 3: ListChecks, 4: ChartLineUp, 5: Crown };

export const StageGlyph = ({ id, size = 20, className = '' }: { id: number; size?: number; className?: string }) => {
  const Glyph = STAGE_ICON[id] ?? Plant;
  return (
    <Glyph weight="regular" size={size} color="currentColor" aria-hidden="true" focusable="false" data-stage-id={id}
      className={`stage-glyph shrink-0 ${className}`} style={{ width: size, height: size }} />
  );
};
