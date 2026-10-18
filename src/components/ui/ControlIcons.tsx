import { forwardRef } from 'react';
import {
  ArrowRight as ArrowRightSvg,
  ChevronLeft as ChevronLeftSvg,
  ChevronRight as ChevronRightSvg,
  ChevronDown as ChevronDownSvg,
  RotateCcw as RotateCcwSvg,
  ChevronsUp as ChevronsUpSvg,
  type LucideIcon,
  type LucideProps,
} from 'lucide-react';

// 작은 방향·조작 표시는 버튼의 글자색을 따른다. 역할을 나타내는 입체 그림은 바꾸지 않는다.
const createControlIcon = (Icon: LucideIcon, name: string) => {
  const ControlIcon = forwardRef<SVGSVGElement, LucideProps>((props, ref) => (
    <Icon
      size={18}
      strokeWidth={2.25}
      absoluteStrokeWidth
      aria-hidden="true"
      focusable="false"
      {...props}
      ref={ref}
    />
  ));
  ControlIcon.displayName = name;
  return ControlIcon;
};

export const ArrowRight = createControlIcon(ArrowRightSvg, 'ControlArrowRight');
export const ChevronLeft = createControlIcon(ChevronLeftSvg, 'ControlChevronLeft');
export const ChevronRight = createControlIcon(ChevronRightSvg, 'ControlChevronRight');
export const ChevronDown = createControlIcon(ChevronDownSvg, 'ControlChevronDown');
export const RotateCcw = createControlIcon(RotateCcwSvg, 'ControlRotateCcw');
export const ChevronsUp = createControlIcon(ChevronsUpSvg, 'ControlChevronsUp');
