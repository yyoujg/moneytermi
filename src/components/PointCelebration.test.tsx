import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { PointCelebration, type PointReward } from './PointCelebration';
import { logClick } from '../lib/analytics';

vi.mock('../lib/analytics', () => ({ logClick: vi.fn() }));
Object.defineProperty(globalThis, 'IS_REACT_ACT_ENVIRONMENT', { value: true, configurable: true });
let cleanup = () => {};
afterEach(() => { cleanup(); vi.clearAllMocks(); });

const mount = (reward: PointReward) => {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);
  const onClose = vi.fn();
  act(() => root.render(<PointCelebration reward={reward} onClose={onClose} />));
  cleanup = () => { act(() => root.unmount()); container.remove(); };
  return { container, onClose };
};

describe('수달과 미션 보상 안내', () => {
  it('미션으로 받은 실제 경험치만 보여준다', () => {
    const { container, onClose } = mount({ xp: 10 });
    expect(container).toHaveTextContent('미션 완료!');
    expect(container).toHaveTextContent('미션을 마치고 경험치를 모았어요.');
    expect(container).toHaveTextContent('+10 XP');
    expect(container.querySelector('[role="dialog"]')).toHaveAttribute('aria-label', '미션 완료');
    expect(container).not.toHaveTextContent(/코인|포인트/);
    expect(container.querySelector('img[src*="/characters/"]')).toBeNull();
    expect(container.querySelector('button')).toHaveTextContent('확인');
    act(() => container.querySelector('button')!.click());
    expect(onClose).toHaveBeenCalledOnce();
    expect(logClick).toHaveBeenCalledWith('point_celebration_close', { xp: 10 });
  });
});
