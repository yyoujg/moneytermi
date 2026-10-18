import { act } from 'react';
import { createRoot } from 'react-dom/client';
import type { ReactNode } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { LearningCompletionScreen } from './LearningCompletionScreen';
import { LearningEmptyState } from './LearningEmptyState';

vi.mock('../DailyAlarmPromptCard', () => ({ DailyAlarmPromptCard: () => <div>알림 안내</div> }));
vi.mock('../StreakCelebration', () => ({ StreakCelebration: () => <div>출석 안내</div> }));
Object.defineProperty(globalThis, 'IS_REACT_ACT_ENVIRONMENT', { value: true, configurable: true });
let cleanup = () => {};
afterEach(() => cleanup());

const mount = (element: ReactNode) => {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);
  act(() => root.render(element));
  cleanup = () => { act(() => root.unmount()); container.remove(); };
  return container;
};

describe('학습 시작 전과 완료 후 수달 안내', () => {
  it('빈 화면 기본값은 공부 수달이며 실제 안내와 버튼 동작을 유지한다', () => {
    const onAction = vi.fn();
    const container = mount(<LearningEmptyState title="아직 풀 문제가 없어요" description="용어를 먼저 확인해요." actionLabel="시작하러 가기" onAction={onAction} />);
    expect(container.querySelector('img')).toHaveAttribute('src', '/otter/v3/characters/study.png');
    expect(container).toHaveTextContent('아직 풀 문제가 없어요');
    expect(container).toHaveTextContent('용어를 먼저 확인해요.');
    const button = container.querySelector('button')!;
    expect(button).toHaveTextContent('시작하러 가기');
    act(() => button.click());
    expect(onAction).toHaveBeenCalledOnce();
  });

  it('명시한 수달 포즈와 화면 안 버튼 배치를 유지한다', () => {
    const container = mount(<LearningEmptyState mascot="error" title="확인해 주세요" description="잠시 후 다시 시도해요." actionLabel="다시 시도" onAction={() => {}} actionPlacement="inline" />);
    expect(container.querySelector('img')).toHaveAttribute('src', '/otter/v3/characters/think.png');
    expect(container.querySelector('button')?.parentElement).toContainElement(container.querySelector('h2'));
  });

  it.each(['bottom', 'inline'] as const)('완료 화면 %s 배치에서도 결과와 동작은 유지하고 보상을 약속하지 않는다', actionPlacement => {
    const onAction = vi.fn();
    const container = mount(<LearningCompletionScreen mascot="great" title="확인 완료!" subtitle="3문제 완료" actionLabel="주제로 돌아가기" onAction={onAction} actionPlacement={actionPlacement}><div>획득 포인트 +0P · 첫 시도 정답률 67%</div></LearningCompletionScreen>);
    expect(container).toHaveTextContent('확인 완료!');
    expect(container).toHaveTextContent('3문제 완료');
    expect(container).toHaveTextContent('획득 포인트 +0P · 첫 시도 정답률 67%');
    expect(container).toHaveTextContent('수달과 함께, 오늘도 차근차근 배웠어요.');
    expect(container).not.toHaveTextContent('포인트를 받았어요');
    expect(container).toHaveTextContent('알림 안내');
    expect(container).toHaveTextContent('출석 안내');
    const button = container.querySelector('button')!;
    expect(button).toHaveTextContent('주제로 돌아가기');
    act(() => button.click());
    expect(onAction).toHaveBeenCalledOnce();
  });
});
