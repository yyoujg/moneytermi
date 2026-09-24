import { useCallback, useEffect, useState } from 'react';
import { Storage } from '../lib/storage';
import { FULL, MAX_HEARTS, msUntilNext, regen, spend, type HeartState } from '../lib/hearts';

const KEY = 'course_hearts';

// 깨진 값/없는 값은 만충으로 fail-open. Origin 변경이나 재설치로 유실돼도 학습이 막히지 않는다.
const parse = (raw: string | null): HeartState => {
  if (!raw) return FULL;
  try {
    const v = JSON.parse(raw) as Partial<HeartState>;
    if (typeof v.hearts !== 'number' || typeof v.updatedAt !== 'number') return FULL;
    if (v.hearts < 0 || v.hearts > MAX_HEARTS) return FULL;
    return { hearts: v.hearts, updatedAt: v.updatedAt };
  } catch { return FULL; }
};

export const useHearts = () => {
  const [state, setState] = useState<HeartState>(FULL);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    Storage.getItem(KEY)
      .then(raw => setState(regen(parse(raw), Date.now())))
      .catch(() => setState(FULL))
      .finally(() => setLoaded(true));
  }, []);

  // 백그라운드에 오래 있다 돌아오면 회복분을 반영한다.
  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === 'visible') setState(s => regen(s, Date.now()));
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, []);

  // 1개 소모. 부족하면 false를 주고 상태를 바꾸지 않는다.
  const trySpend = useCallback(() => {
    const next = spend(state, Date.now());
    if (!next) return false;
    setState(next);
    Storage.setItem(KEY, JSON.stringify(next)).catch(() => {});
    return true;
  }, [state]);

  return { hearts: state.hearts, loaded, trySpend, msUntilNext: () => msUntilNext(state, Date.now()) };
};
