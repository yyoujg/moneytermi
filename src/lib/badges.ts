// 배지/업적 — 이미 있는 값(XP·연속 학습일·학습한 단어 수)에서 파생한다.
// 획득 기록을 따로 저장하지 않으므로 서버 변경이 필요 없고, 조건을 다시 만족하면 항상 같은 결과가 나온다.
export type BadgeStat = 'words' | 'streak' | 'xp';

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
  { id: 'w200',  icon: '📚', title: '200단어',     stat: 'words',  need: 200 },
  { id: 'w500',  icon: '📚', title: '500단어',     stat: 'words',  need: 500 },
  { id: 'w1000', icon: '📚', title: '1,000단어',   stat: 'words',  need: 1000 },
  { id: 's3',    icon: '🔥', title: '3일 연속',    stat: 'streak', need: 3 },
  { id: 's7',    icon: '⚡', title: '일주일 연속', stat: 'streak', need: 7 },
  { id: 's14',   icon: '⚡', title: '2주 연속',    stat: 'streak', need: 14 },
  { id: 's30',   icon: '🏅', title: '한 달 연속',  stat: 'streak', need: 30 },
  { id: 's60',   icon: '🏅', title: '두 달 연속',  stat: 'streak', need: 60 },
  { id: 's100',  icon: '🏅', title: '100일 연속',  stat: 'streak', need: 100 },
  { id: 'x100',  icon: '🪙', title: '100 XP',      stat: 'xp',     need: 100 },
  { id: 'x500',  icon: '💰', title: '500 XP',      stat: 'xp',     need: 500 },
  { id: 'x1000', icon: '👑', title: '1,000 XP',    stat: 'xp',     need: 1000 },
  { id: 'x2000', icon: '👑', title: '2,000 XP',    stat: 'xp',     need: 2000 },
  { id: 'x5000', icon: '👑', title: '5,000 XP',    stat: 'xp',     need: 5000 },
  { id: 'x10000', icon: '👑', title: '10,000 XP',  stat: 'xp',     need: 10000 },
];

// 배지 더보기 화면의 묶음 순서와 이름
export const BADGE_GROUPS: { stat: BadgeStat; title: string; unit: string }[] = [
  // 용어 배지는 익힌 용어(knownWords) 기준이라 마이 통계의 '살펴본 용어'와 이름을 나눈다
  { stat: 'words', title: '익힌 용어', unit: '개' },
  { stat: 'streak', title: '연속 학습', unit: '일' },
  { stat: 'xp', title: '경험치', unit: 'XP' },
];

export type BadgeStats = { words: number; streak: number; xp: number };
export type Badge = BadgeDef & { earned: boolean; progress: number };

export const buildBadges = (stats: BadgeStats): Badge[] =>
  BADGES.map(b => {
    const cur = stats[b.stat];
    return { ...b, earned: cur >= b.need, progress: Math.min(1, cur / b.need) };
  });

export const earnedCount = (stats: BadgeStats): number =>
  buildBadges(stats).filter(b => b.earned).length;
