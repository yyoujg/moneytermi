import { requestReview } from '@apps-in-toss/web-framework';
import { logClick } from './analytics';

// 만족도 높은 순간(보상 수령/퀴즈 완료)에 앱 리뷰 요청. 노출은 플랫폼이 제어.
// 미지원 버전/웹 환경에서는 조용히 무시한다.
// 로깅 주의: review_request_called는 "SDK 호출이 resolve됐다"는 뜻일 뿐, 실제 리뷰 시트 노출 여부는 알 수 없다.
export const requestAppReview = async (): Promise<void> => {
  try {
    if (typeof requestReview.isSupported === 'function' && !requestReview.isSupported()) {
      logClick('review_request_unsupported');
      return;
    }
    await requestReview();
    logClick('review_request_called');
  } catch {
    logClick('review_request_error');
  }
};
