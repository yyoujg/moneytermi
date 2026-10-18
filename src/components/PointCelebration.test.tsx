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

describe('수달과 조개 보상 안내', () => {
  it('미션으로 받은 실제 조개와 경험치를 그대로 보여준다', () => {
    const { container } = mount({ source: 'mission', points: 30, xp: 10 });
    expect(container).toHaveTextContent('오늘의 미션 완료!');
    expect(container).toHaveTextContent('미션을 마치고 조개를 모았어요.');
    expect(container).toHaveTextContent('+30개');
    expect(container.querySelector('[role="dialog"]')).toHaveAttribute('aria-label', '조개 획득');
    expect(container).not.toHaveTextContent('포인트');
    expect(container).not.toHaveTextContent('+30P');
    expect(container).toHaveTextContent('+10 XP');
    expect(container.querySelector('img')).toHaveAttribute('src', '/otter/v3/characters/joy.png');
    expect(container.querySelector('button')).toHaveTextContent('확인');
  });

  it('광고 보상을 공부 보상으로 표현하거나 없는 경험치를 보여주지 않는다', () => {
    const { container, onClose } = mount({ source: 'ad', points: 5 });
    expect(container).toHaveTextContent('광고 시청 보상으로 조개를 받았어요.');
    expect(container).toHaveTextContent('+5개');
    expect(container).toHaveTextContent('조개를 받았어요!');
    expect(container.querySelector('[role="dialog"]')).toHaveAttribute('aria-label', '조개 획득');
    expect(container).not.toHaveTextContent('포인트');
    expect(container).not.toHaveTextContent('+5P');
    expect(container).not.toHaveTextContent('XP');
    expect(container).not.toHaveTextContent('미션을 마치고');
    act(() => container.querySelector('button')!.click());
    expect(onClose).toHaveBeenCalledOnce();
    expect(logClick).toHaveBeenCalledWith('point_celebration_close', { source: 'ad', points: 5 });
  });
});
