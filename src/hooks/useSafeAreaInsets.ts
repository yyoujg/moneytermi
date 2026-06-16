import { useEffect, useState } from 'react';
import { SafeAreaInsets } from '@apps-in-toss/web-framework';

type Insets = { top: number; bottom: number; left: number; right: number };

const ZERO: Insets = { top: 0, bottom: 0, left: 0, right: 0 };

// 토스앱: 상태바/노치/홈인디케이터 인셋. 웹/미지원 환경에서는 0으로 폴백.
export const useSafeAreaInsets = (): Insets => {
  const [insets, setInsets] = useState<Insets>(() => {
    try { return SafeAreaInsets.get(); } catch { return ZERO; }
  });

  useEffect(() => {
    let cleanup: (() => void) | undefined;
    try {
      cleanup = SafeAreaInsets.subscribe({ onEvent: setInsets });
    } catch { /* 웹 환경 미지원 */ }
    return () => cleanup?.();
  }, []);

  return insets;
};
