// 배지/업적 — 이미 있는 값(포인트·연속 학습일·학습한 단어 수)에서 파생한다.
// 획득 기록을 따로 저장하지 않으므로 서버 변경이 필요 없고, 조건을 다시 만족하면 항상 같은 결과가 나온다.
export type BadgeStat = 'words' | 'streak' | 'points';

export type BadgeDef = {
  id: string;
  icon: string;
  title: string;
  stat: BadgeStat;
  need: number;
};

export const BADGES: BadgeDef[] = [
  { id: 'w1',    icon: '🌱', title: '첫 단어',     stat: 'words',  need: 1 },
  { id: 'w10',   icon: '📗', title: '10단어',      stat: 'words',  need: 10 },
  { id: 'w50',   icon: '📘', title: '50단어',      stat: 'words',  need: 50 },
  { id: 'w100',  icon: '📚', title: '100단어',     stat: 'words',  need: 100 },
  { id: 's3',    icon: '🔥', title: '3일 연속',    stat: 'streak', need: 3 },
  { id: 's7',    icon: '⚡', title: '일주일 연속', stat: 'streak', need: 7 },
  { id: 's30',   icon: '🏅', title: '한 달 연속',  stat: 'streak', need: 30 },
  { id: 'p100',  icon: '🪙', title: '100P',        stat: 'points', need: 100 },
  { id: 'p1000', icon: '💰', title: '1,000P',      stat: 'points', need: 1000 },
  { id: 'p5000', icon: '👑', title: '5,000P',      stat: 'points', need: 5000 },
];

export type BadgeStats = { words: number; streak: number; points: number };
export type Badge = BadgeDef & { earned: boolean; progress: number };

export const buildBadges = (stats: BadgeStats): Badge[] =>
  BADGES.map(b => {
    const cur = stats[b.stat];
    return { ...b, earned: cur >= b.need, progress: Math.min(1, cur / b.need) };
  });

export const earnedCount = (stats: BadgeStats): number =>
  buildBadges(stats).filter(b => b.earned).length;
