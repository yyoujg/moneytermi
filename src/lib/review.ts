import { requestReview } from '@apps-in-toss/web-framework';

// 만족도 높은 순간(보상 수령/퀴즈 완료)에 앱 리뷰 요청. 노출은 플랫폼이 제어.
// 미지원 버전/웹 환경에서는 조용히 무시한다.
export const requestAppReview = async (): Promise<void> => {
  try {
    if (typeof requestReview.isSupported === 'function' && !requestReview.isSupported()) return;
    await requestReview();
  } catch { /* 미지원/실패 무시 */ }
};
