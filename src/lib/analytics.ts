import { Analytics } from '@apps-in-toss/web-framework';

// 행동 분석 로깅. 프로덕션에서만 집계되며, 웹/미지원/개발 환경은 조용히 무시한다.
// 네이밍 컨벤션: category_action (예: quiz_complete, mission_reward_claim)
type Props = Record<string, string | number | boolean | null | undefined>;

export const logScreen = (log_name: string, props?: Props) => {
  try { Analytics.screen({ log_name, ...props }); } catch { /* 미지원/실패 무시 */ }
};

export const logClick = (log_name: string, props?: Props) => {
  try { Analytics.click({ log_name, ...props }); } catch { /* 미지원/실패 무시 */ }
};
