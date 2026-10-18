import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ReviewCompletionScreen } from './ReviewCompletionScreen';

vi.mock('../DailyAlarmPromptCard', () => ({ DailyAlarmPromptCard: () => <div>알림 안내</div> }));
vi.mock('../StreakCelebration', () => ({ StreakCelebration: () => <div>출석 안내</div> }));
Object.defineProperty(globalThis, 'IS_REACT_ACT_ENVIRONMENT', { value: true, configurable: true });
let cleanup = () => {};
afterEach(() => cleanup());
const mount = (firstCorrect: number, points = 180) => {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);
  const onAction = vi.fn();
  act(() => root.render(<ReviewCompletionScreen initialTotal={2} firstCorrect={firstCorrect} points={points} note="기존 복습 안내" onAction={onAction} />));
  cleanup = () => { act(() => root.unmount()); container.remove(); };
  return { container, onAction };
};

describe('복습 완료 전용 화면', () => {
  it.each([0, 1, 2])('첫 시도 %i개 정답도 실제 최초 문제 수와 분리해 그대로 표시한다', correct => {
    const { container } = mount(correct);
    expect(container.querySelector('[data-review-total]')).toHaveTextContent('2문제');
    expect(container.querySelector('[data-review-correct]')).toHaveTextContent(`${correct}개`);
    expect(container.querySelector('.review-complete-summary')).toHaveAttribute('aria-label', `첫 시도 2문제 중 ${correct}개 정답`);
    expect(container).toHaveTextContent('기존 복습 안내');
  });
  it.each([0, 1234])('보유 조개 %i개를 획득 보상으로 바꾸지 않는다', points => {
    const { container } = mount(1, points);
    expect(container.querySelector('.review-complete-wallet')).toHaveAttribute('aria-label', `보유 조개 ${points}개`);
    expect(container.querySelector('[data-review-balance]')).toHaveTextContent(`${points}개`);
    expect(container).not.toHaveTextContent('획득');
    expect(container).not.toHaveTextContent('보너스');
  });
  it('기존 수달과 알림·출석 안내를 유지하고 완료 제목으로 초점을 옮긴다', () => {
    const { container } = mount(0);
    expect(container.querySelector('.review-complete-mascot img')).toHaveAttribute('src', '/otter/v3/characters/joy.png');
    expect(container).toHaveTextContent('알림 안내');
    expect(container).toHaveTextContent('출석 안내');
    expect(document.activeElement).toBe(container.querySelector('h1'));
  });
  it('하단 행동은 전달받은 이동을 한 번만 실행한다', () => {
    const { container, onAction } = mount(2);
    const button = container.querySelector('footer button')!;
    expect(button).toHaveTextContent('학습 홈으로');
    act(() => (button as HTMLButtonElement).click());
    expect(onAction).toHaveBeenCalledOnce();
  });
});
