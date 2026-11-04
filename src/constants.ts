// 프로필 생성 시 서버/클라가 넣는 기본 닉네임. 이 값이면 사용자가 아직 직접 정하지 않은 것으로 보고
// 앱 진입 시 설정을 강제한다(App.tsx NicknameGate).
export const DEFAULT_NICKNAME = '새친구';
// 개미 컨셉을 걷어내기 전 기본값도 함께 막는다 — 기존 사용자가 그대로 남아 있다.
const LEGACY_DEFAULT_NICKNAMES = ['예비슈퍼개미'];
export const isDefaultNickname = (n?: string | null) => {
  const v = n?.trim();
  return !v || v === DEFAULT_NICKNAME || LEGACY_DEFAULT_NICKNAMES.includes(v);
};

// 코스 난이도: 데이터 값(기초·중급·고급·심화)은 그대로 두고 화면에 보이는 이름만 바꾼다
export const LEVEL_LABELS: Record<string, string> = { 기초: '입문', 중급: '기본', 고급: '응용', 심화: '전문' };
export const levelLabel = (level: string) => LEVEL_LABELS[level] ?? level;

export type GrowthStage = {
  id: number;
  name: string;
  emoji: string;
};

// 리그 티어. 서버가 매주 지난주 주간 순위로 정한다(profiles.league_stage, supabase/content/league-weekly-promotion).
// 상위 3명 승급, 참여자 7명 이상인 주의 하위 3명 강등.
export const LEAGUE_PROMOTE_TOP = 3;
export const LEAGUE_DEMOTE_BOTTOM = 3;
export const LEAGUE_DEMOTE_MIN_PLAYERS = 7;
// 포인트 경제 (migration_points_economy.sql). 레슨 시작 비용 / XP 마일스톤 보너스.
export const LESSON_COST = 10;
export const XP_BONUS_STEP = 50;
export const XP_BONUS_POINTS = 50;
export const ENERGY_MAX = 25;
// 참고 이미지의 3/25, 완충까지 21시간 53분 표기를 기준으로 1칸당 약 1시간 회복.
export const ENERGY_REGEN_MS = 60 * 60 * 1000;
export const ENERGY_ACTION_COST = 1;
export const ENERGY_AD_REWARD = 5;
export const ENERGY_REFILL_COST = 600;

// 미션 보상 수령 시 서버가 함께 주는 XP (migration_xp.sql STEP 7 claim_mission_reward → add_xp 5)
export const MISSION_XP = 5;

// 10단계. 그림은 public/league/v3(StageGlyph), 서버 league_stage 1~10과 같은 순서
export const GROWTH_STAGES: GrowthStage[] = [
  { id: 1, name: '새내기', emoji: '👛' },
  { id: 2, name: '기록가', emoji: '📒' },
  { id: 3, name: '절약가', emoji: '🪙' },
  { id: 4, name: '저축가', emoji: '🐷' },
  { id: 5, name: '계획가', emoji: '✨' },
  { id: 6, name: '분석가', emoji: '📰' },
  { id: 7, name: '투자가', emoji: '📈' },
  { id: 8, name: '전략가', emoji: '🧘' },
  { id: 9, name: '자산가', emoji: '🔑' },
  { id: 10, name: '큰손', emoji: '💰' },
];

export const getGrowthStage = (stageId: number): GrowthStage => GROWTH_STAGES.find(s => s.id === stageId) ?? GROWTH_STAGES[0];

// 하루 복습 큐 상한 (홈 "오늘 복습할 단어 N개")
export const DAILY_REVIEW_CAP = 10;

// 프로필 아바타 값(서버 저장값). 현재 화면에서는 쓰지 않는다.
export const AVATAR_OPTIONS = ['🍊','🐼','🥰','🦉'];
