// 프로필 생성 시 서버/클라가 넣는 기본 닉네임. 이 값이면 사용자가 아직 직접 정하지 않은 것으로 보고
// 앱 진입 시 설정을 강제한다(App.tsx NicknameGate).
export const DEFAULT_NICKNAME = '예비슈퍼개미';
export const isDefaultNickname = (n?: string | null) => !n?.trim() || n.trim() === DEFAULT_NICKNAME;

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

