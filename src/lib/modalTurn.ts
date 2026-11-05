import { useEffect, useState, useSyncExternalStore } from 'react';

// 축하 모달이 동시에 생기면 먼저 요청한 것부터 하나씩 보여준다. 닫히면 다음 차례로 넘어간다.
let queue: symbol[] = [];
const listeners = new Set<() => void>();
const subscribe = (listener: () => void) => { listeners.add(listener); return () => { listeners.delete(listener); }; };
const emit = () => listeners.forEach(listener => listener());

export const useModalTurn = (wantsToShow: boolean) => {
  const [id] = useState(() => Symbol('modal'));
  useEffect(() => {
    if (!wantsToShow) return;
    queue = [...queue, id];
    emit();
    return () => { queue = queue.filter(item => item !== id); emit(); };
  }, [wantsToShow, id]);
  return useSyncExternalStore(subscribe, () => queue[0] === id, () => true);
};
