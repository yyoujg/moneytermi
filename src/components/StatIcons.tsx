/* eslint-disable react-refresh/only-export-components */
// 상단바·마이페이지 요약 전용 아이콘(연속 학습·XP·포인트·배운 단어). 그림은 public/icons/*.png
type Props = { size?: number; className?: string };
// 숫자도 아이콘과 같은 색으로 칠할 수 있게 밖으로 꺼내 둔다
export const STAT_COLOR = { streak: '#f97316', xp: '#f59f00', points: '#fab005', words: '#3b82f6' } as const;

const Img = ({ src, size = 16, className }: Props & { src: string }) => (
  <img src={src} alt="" aria-hidden="true" width={size} height={size} className={`shrink-0 ${className ?? ''}`} />
);

export const StreakIcon = (p: Props) => <Img {...p} src="/icons/streak.png" />;
export const XpIcon = (p: Props) => <Img {...p} src="/icons/xp.png" />;
export const PointIcon = (p: Props) => <Img {...p} src="/icons/point.png" />;
export const WordsIcon = (p: Props) => <Img {...p} src="/icons/words.png" />;
