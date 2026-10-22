import { forwardRef } from 'react';
import {
  BookOpen as BookSvg, BookOpenText as BookTextSvg, Books as BooksSvg, ListChecks as ListChecksSvg,
  ChartBar as ChartSvg, User as UserSvg, Trophy as TrophySvg, CalendarBlank as CalendarSvg,
  Wallet as WalletSvg, Newspaper as NewspaperSvg, Gear as GearSvg, Bell as BellSvg, Moon as MoonSvg,
  SpeakerHigh as SpeakerSvg, MusicNotes as MusicSvg, Vibrate as VibrateSvg, Lightbulb as BulbSvg,
  Target as TargetSvg, Flame as FlameSvg, Television as TvSvg, SpeakerX as MuteSvg,
  PencilSimple as PencilSvg, Lock as LockSvg, ArrowRight as ArrowRightSvg, ArrowDown as ArrowDownSvg,
  CaretRight as CaretRightSvg, CaretLeft as CaretLeftSvg, CaretDown as CaretDownSvg,
  CaretDoubleUp as CaretDoubleUpSvg, ArrowCounterClockwise as RotateSvg, ArrowSquareOut as ExternalSvg,
  LinkSimple as LinkSvg, ShareNetwork as ShareSvg, Check as CheckSvg, X as CrossSvg, TrendUp as TrendSvg,
  Sparkle as SparkleSvg, SealCheck as SealCheckSvg, Info as InfoSvg, WarningCircle as AlertSvg,
  Question as HelpSvg, Coins as CoinsSvg, Lightning as LightningSvg,
  type Icon as PhosphorIcon, type IconProps, type IconWeight,
} from '@phosphor-icons/react';

// 이전 선 아이콘 호출부가 넘기던 선 굵기 props는 받아서 버린다.
export type DuotoneIconProps = IconProps & { strokeWidth?: number | string; absoluteStrokeWidth?: boolean };

// 모든 아이콘은 현재 글자색을 따르는 듀오톤 한 벌로 통일한다. 바탕 도형은 두지 않는다.
const createIcon = (Icon: PhosphorIcon, name: string, defaultSize = 24, weight: IconWeight = 'duotone') => {
  const Duotone = forwardRef<SVGSVGElement, DuotoneIconProps>(({ strokeWidth, absoluteStrokeWidth, size = defaultSize, ...props }, ref) => {
    void [strokeWidth, absoluteStrokeWidth];
    return <Icon weight={weight} color="currentColor" aria-hidden="true" focusable="false" size={size} data-icon={name} {...props} ref={ref} />;
  });
  Duotone.displayName = name;
  return Duotone;
};
const createControl = (Icon: PhosphorIcon, name: string) => createIcon(Icon, name, 18);
// 꺾쇠는 듀오톤 채움이 삼각형(▷)처럼 읽혀서 선형으로 그린다.
const createCaret = (Icon: PhosphorIcon, name: string) => createIcon(Icon, name, 18, 'bold');

export const BookOpen = createIcon(BookSvg, 'BookOpen');
export const BookOpenText = createIcon(BookTextSvg, 'BookOpenText');
export const LibraryBig = createIcon(BooksSvg, 'LibraryBig');
export const ListChecks = createIcon(ListChecksSvg, 'ListChecks');
export const BarChart3 = createIcon(ChartSvg, 'BarChart3');
export const ChartNoAxesColumnIncreasing = createIcon(ChartSvg, 'ChartNoAxesColumnIncreasing');
export const UserRound = createIcon(UserSvg, 'UserRound');
export const Trophy = createIcon(TrophySvg, 'Trophy');
export const CalendarDays = createIcon(CalendarSvg, 'CalendarDays');
export const WalletCards = createIcon(WalletSvg, 'WalletCards');
export const Newspaper = createIcon(NewspaperSvg, 'Newspaper');
export const Settings = createIcon(GearSvg, 'Settings');
export const Bell = createIcon(BellSvg, 'Bell');
export const Moon = createIcon(MoonSvg, 'Moon');
export const Volume2 = createIcon(SpeakerSvg, 'Volume2');
export const Music2 = createIcon(MusicSvg, 'Music2');
export const Vibrate = createIcon(VibrateSvg, 'Vibrate');
export const Lightbulb = createIcon(BulbSvg, 'Lightbulb');
export const Target = createIcon(TargetSvg, 'Target');
export const Flame = createIcon(FlameSvg, 'Flame');
export const Tv = createIcon(TvSvg, 'Tv');
export const VolumeX = createIcon(MuteSvg, 'VolumeX');
export const Coins = createIcon(CoinsSvg, 'Coins');
export const Lightning = createIcon(LightningSvg, 'Lightning');

export const Pencil = createControl(PencilSvg, 'Pencil');
export const Lock = createControl(LockSvg, 'Lock');
export const LockKeyhole = createControl(LockSvg, 'LockKeyhole');
export const ArrowRight = createControl(ArrowRightSvg, 'ArrowRight');
export const ArrowDown = createControl(ArrowDownSvg, 'ArrowDown');
export const ChevronRight = createCaret(CaretRightSvg, 'ChevronRight');
export const ChevronLeft = createCaret(CaretLeftSvg, 'ChevronLeft');
export const ChevronDown = createCaret(CaretDownSvg, 'ChevronDown');
export const ChevronsUp = createCaret(CaretDoubleUpSvg, 'ChevronsUp');
export const RotateCcw = createControl(RotateSvg, 'RotateCcw');
export const ExternalLink = createControl(ExternalSvg, 'ExternalLink');
export const Link2 = createControl(LinkSvg, 'Link2');
export const Share2 = createControl(ShareSvg, 'Share2');
export const Check = createControl(CheckSvg, 'Check');
export const X = createControl(CrossSvg, 'X');
export const TrendingUp = createControl(TrendSvg, 'TrendingUp');
export const Sparkles = createControl(SparkleSvg, 'Sparkles');
export const BadgeCheck = createControl(SealCheckSvg, 'BadgeCheck');
export const Info = createControl(InfoSvg, 'Info');
export const AlertCircle = createControl(AlertSvg, 'AlertCircle');
export const CircleHelp = createControl(HelpSvg, 'CircleHelp');
