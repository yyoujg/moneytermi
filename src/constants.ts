// 프로필 생성 시 서버/클라가 넣는 기본 닉네임. 이 값이면 사용자가 아직 직접 정하지 않은 것으로 보고
// 앱 진입 시 설정을 강제한다(App.tsx NicknameGate).
export const DEFAULT_NICKNAME = '새친구';
// 개미 컨셉을 걷어내기 전 기본값도 함께 막는다 — 기존 사용자가 그대로 남아 있다.
const LEGACY_DEFAULT_NICKNAMES = ['예비슈퍼개미'];
export const isDefaultNickname = (n?: string | null) => {
  const v = n?.trim();
  return !v || v === DEFAULT_NICKNAME || LEGACY_DEFAULT_NICKNAMES.includes(v);
};

export type GrowthStage = {
  id: number;
  name: string;
  emoji: string;
  minPoints: number;
  nextMinPoints: number | null; // null = 최고 단계
};

// 리그 티어. 누적 XP로 결정된다.
// 기준선은 포인트 시절의 1/5 — XP는 포인트보다 훨씬 천천히 쌓인다(퀴즈 1정답 = 10~20P vs 2XP).
// 4000XP는 퀴즈 2000문제라 사실상 도달 불가였다.
// 포인트 경제 (migration_points_economy.sql). 레슨 시작 비용 / XP 마일스톤 보너스.
export const LESSON_COST = 10;
export const XP_BONUS_STEP = 50;
export const XP_BONUS_POINTS = 50;

// 미션 보상 수령 시 서버가 함께 주는 XP (migration_xp.sql STEP 7 claim_mission_reward → add_xp 5)
export const MISSION_XP = 5;

export const GROWTH_STAGES: Omit<GrowthStage, 'nextMinPoints'>[] = [
  { id: 1, name: '브론즈',   emoji: '🥉', minPoints: 0 },
  { id: 2, name: '실버',     emoji: '🥈', minPoints: 20 },
  { id: 3, name: '골드',     emoji: '🥇', minPoints: 100 },
  { id: 4, name: '플래티넘', emoji: '💠', minPoints: 300 },
  { id: 5, name: '다이아',   emoji: '💎', minPoints: 800 },
];

export const getGrowthStage = (points: number): GrowthStage => {
  const current = [...GROWTH_STAGES].reverse().find(s => points >= s.minPoints) ?? GROWTH_STAGES[0];
  const next = GROWTH_STAGES.find(s => s.id === current.id + 1) ?? null;
  return { ...current, nextMinPoints: next?.minPoints ?? null };
};

// 하루 복습 큐 상한 (홈 "오늘 복습할 단어 N개")
export const DAILY_REVIEW_CAP = 10;

