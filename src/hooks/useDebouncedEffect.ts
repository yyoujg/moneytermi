import { useEffect } from 'react';

// deps 변경 후 delayMs 디바운스하여 effect 실행. 다음 변경/언마운트 시 타이머 취소.
// 앱이 백그라운드로 가면(닫힘 직전) 기다리지 않고 바로 실행해 저장이 유실되지 않게 한다.
export const useDebouncedEffect = (effect: () => void, deps: unknown[], delayMs: number) => {
  useEffect(() => {
    let done = false;
    const run = () => { if (done) return; done = true; clearTimeout(t); document.removeEventListener('visibilitychange', onHide); effect(); };
    const onHide = () => { if (document.visibilityState === 'hidden') run(); };
    const t = setTimeout(run, delayMs);
    document.addEventListener('visibilitychange', onHide);
    return () => { done = true; clearTimeout(t); document.removeEventListener('visibilitychange', onHide); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, delayMs]);
};
