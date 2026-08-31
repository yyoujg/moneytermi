export type GrowthStage = {
  id: number;
  name: string;
  emoji: string;
  minPoints: number;
  nextMinPoints: number | null; // null = 최고 단계
};

export const GROWTH_STAGES: Omit<GrowthStage, 'nextMinPoints'>[] = [
  { id: 1, name: '알개미',   emoji: '🥚', minPoints: 0 },
  { id: 2, name: '뽀시래기', emoji: '🐛', minPoints: 100 },
  { id: 3, name: '왕개미',   emoji: '🐜', minPoints: 500 },
  { id: 4, name: '전투개미', emoji: '🐝', minPoints: 1500 },
  { id: 5, name: '슈퍼개미', emoji: '🦸', minPoints: 4000 },
];

export const getGrowthStage = (points: number): GrowthStage => {
  const current = [...GROWTH_STAGES].reverse().find(s => points >= s.minPoints) ?? GROWTH_STAGES[0];
  const next = GROWTH_STAGES.find(s => s.id === current.id + 1) ?? null;
  return { ...current, nextMinPoints: next?.minPoints ?? null };
};

// 하루 복습 큐 상한 (홈 "오늘 복습할 단어 N개")
export const DAILY_REVIEW_CAP = 10;

