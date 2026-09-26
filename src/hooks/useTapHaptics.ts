import { useEffect } from 'react';
import { feedbackTick, preloadSfx } from '../lib/feedback';

// 앱 전체: 누를 수 있는 것을 누르는 순간(pointerdown) 짧게 진동하고 톡 소리를 낸다. 비활성 버튼은 제외.
// 개별 화면은 탭 진동을 따로 넣지 않는다 — 결과 진동(정답·축하·수령)만 각자 울린다.
const TAPPABLE = 'button, [role="button"], [role="switch"], [role="tab"], a[href], input[type="checkbox"], input[type="radio"]';   // :has()는 구형 웹뷰에서 closest()가 throw

export const useTapHaptics = () => {
  useEffect(() => {
    const onDown = (e: PointerEvent) => {
      const el = (e.target as Element | null)?.closest?.(TAPPABLE) as HTMLElement | null;
      if (el && !(el as HTMLButtonElement).disabled && el.getAttribute('aria-disabled') !== 'true') feedbackTick();   // 진동 먼저
      preloadSfx();   // 첫 제스처에서 효과음 파일 로드 (이미 받았으면 no-op)
    };
    document.addEventListener('pointerdown', onDown, { capture: true, passive: true });
    return () => document.removeEventListener('pointerdown', onDown, { capture: true });
  }, []);
};
