import { Device } from '@apps-in-toss/web-framework';
import { logClick } from './analytics';

// 외부 링크는 Device.openURL로 연다. 토스 앱 웹뷰에서 <a target="_blank">가 동작하지 않아
// "외부 링크가 열리지 않는다"로 검수 2회 반려됐다(번들 124·125).
// openURL은 미지원/실패 시 reject되므로 catch 필수. 웹 개발 환경에서는 새 탭으로 폴백한다.
export const openExternalUrl = async (url: string): Promise<void> => {
  try {
    await Device.openURL(url);
  } catch {
    logClick('external_open_fallback');
    try { window.open(url, '_blank', 'noopener'); } catch { /* 폴백도 실패하면 무시 */ }
  }
};
