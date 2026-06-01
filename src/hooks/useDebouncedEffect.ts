import { useEffect } from 'react';

// deps 변경 후 delayMs 디바운스하여 effect 실행. 다음 변경/언마운트 시 타이머 취소.
export const useDebouncedEffect = (effect: () => void, deps: unknown[], delayMs: number) => {
  useEffect(() => {
    const t = setTimeout(effect, delayMs);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, delayMs]);
};
