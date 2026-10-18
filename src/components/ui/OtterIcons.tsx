import { forwardRef } from 'react';
import type { ImgHTMLAttributes } from 'react';
import {
  Pencil as PencilSvg, LockKeyhole as LockSvg, ArrowRight as ArrowRightSvg,
  ArrowDown as ArrowDownSvg, ChevronRight as ChevronRightSvg,
  ChevronLeft as ChevronLeftSvg, ChevronDown as ChevronDownSvg,
  ChevronsUp as ChevronsUpSvg, RotateCcw as RotateCcwSvg,
  ExternalLink as ExternalLinkSvg, Link2 as LinkSvg, Share2 as ShareSvg,
  Check as CheckSvg, X as CrossSvg, TrendingUp as TrendingSvg,
  Sparkles as SparklesSvg, BadgeCheck as BadgeCheckSvg,
  Info as InfoSvg, CircleAlert as AlertSvg, CircleHelp as HelpSvg,
  type LucideIcon, type LucideProps,
} from 'lucide-react';

type OtterIconProps = Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'width' | 'height' | 'color'> & {
  size?: number | string; strokeWidth?: number | string; color?: string;
  fill?: string; absoluteStrokeWidth?: boolean;
};

// 역할 그림은 연한 원형 바탕과 윤곽선 없는 단순한 파스텔 사물 그림을 공유한다.
const createIcon = (name: string, key: string) => {
  const Icon = forwardRef<HTMLImageElement, OtterIconProps>(({
    size = 24, className = '', style, alt = '',
    strokeWidth, color, fill, absoluteStrokeWidth, ...props
  }, ref) => {
    void [strokeWidth, color, fill, absoluteStrokeWidth];
    return <img aria-hidden="true" draggable={false} {...props} ref={ref}
      src={`/otter/v3/icons/${key}.png`} alt={alt} data-icon={name}
      width={size} height={size} className={`otter-icon ${className}`}
      style={{ width: size, height: size, objectFit: 'contain', ...style }} />;
  });
  Icon.displayName = name;
  return Icon;
};

// 작은 조작 표시는 색이 고정된 그림 대신 현재 글자색을 따르는 선으로 읽히게 한다.
const createControl = (Icon: LucideIcon, name: string) => {
  const Control = forwardRef<SVGSVGElement, LucideProps>(({ className = '', ...props }, ref) => (
    <Icon size={18} strokeWidth={2.25} absoluteStrokeWidth aria-hidden="true" focusable="false"
      {...props} ref={ref} data-icon={name} className={`otter-control ${className}`} />
  ));
  Control.displayName = name;
  return Control;
};

export const BookOpen = createIcon('BookOpen', 'book');
export const BookOpenText = createIcon('BookOpenText', 'book');
export const LibraryBig = createIcon('LibraryBig', 'library');
export const ListChecks = createIcon('ListChecks', 'checklist');
export const BarChart3 = createIcon('BarChart3', 'chart');
export const ChartNoAxesColumnIncreasing = createIcon('ChartNoAxesColumnIncreasing', 'chart');
export const UserRound = createIcon('UserRound', 'profile');
export const Trophy = createIcon('Trophy', 'trophy');
export const CalendarDays = createIcon('CalendarDays', 'calendar');
export const WalletCards = createIcon('WalletCards', 'wallet');
export const Newspaper = createIcon('Newspaper', 'newspaper');
export const Settings = createIcon('Settings', 'settings');
export const Bell = createIcon('Bell', 'bell');
export const Moon = createIcon('Moon', 'moon');
export const Volume2 = createIcon('Volume2', 'speaker');
export const Music2 = createIcon('Music2', 'music');
export const Vibrate = createIcon('Vibrate', 'vibrate');
export const Lightbulb = createIcon('Lightbulb', 'bulb');
export const Target = createIcon('Target', 'target');
export const Flame = createIcon('Flame', 'flame');
export const Tv = createIcon('Tv', 'tv');
export const VolumeX = createIcon('VolumeX', 'mute');

export const Pencil = createControl(PencilSvg, 'Pencil');
export const Lock = createControl(LockSvg, 'Lock');
export const LockKeyhole = createControl(LockSvg, 'LockKeyhole');
export const ArrowRight = createControl(ArrowRightSvg, 'ArrowRight');
export const ArrowDown = createControl(ArrowDownSvg, 'ArrowDown');
export const ChevronRight = createControl(ChevronRightSvg, 'ChevronRight');
export const ChevronLeft = createControl(ChevronLeftSvg, 'ChevronLeft');
export const ChevronDown = createControl(ChevronDownSvg, 'ChevronDown');
export const ChevronsUp = createControl(ChevronsUpSvg, 'ChevronsUp');
export const RotateCcw = createControl(RotateCcwSvg, 'RotateCcw');
export const ExternalLink = createControl(ExternalLinkSvg, 'ExternalLink');
export const Link2 = createControl(LinkSvg, 'Link2');
export const Share2 = createControl(ShareSvg, 'Share2');
export const Check = createControl(CheckSvg, 'Check');
export const X = createControl(CrossSvg, 'X');
export const TrendingUp = createControl(TrendingSvg, 'TrendingUp');
export const Sparkles = createControl(SparklesSvg, 'Sparkles');
export const BadgeCheck = createControl(BadgeCheckSvg, 'BadgeCheck');
export const Info = createControl(InfoSvg, 'Info');
export const AlertCircle = createControl(AlertSvg, 'AlertCircle');
export const CircleHelp = createControl(HelpSvg, 'CircleHelp');
