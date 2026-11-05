import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { LoadingScreen } from './LoadingScreen';

Object.defineProperty(globalThis, 'IS_REACT_ACT_ENVIRONMENT', { value: true, configurable: true });
let cleanup = () => {};
afterEach(() => { cleanup(); vi.useRealTimers(); });
const mount = (el: React.ReactElement) => {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);
  act(() => root.render(el));
  cleanup = () => { act(() => root.unmount()); container.remove(); };
  return container;
};

describe('달리 로딩 화면', () => {
  it('300ms 안에는 보이지 않고, 그 뒤 문구가 2.4초마다 바뀐다', () => {
    vi.useFakeTimers();
    const container = mount(<LoadingScreen />);
    expect(container.querySelector('[role="status"]')).toBeNull();
    act(() => { vi.advanceTimersByTime(300); });
    expect(container.querySelector('[role="status"]')).toHaveTextContent('오늘의 단어 준비 중');
    act(() => { vi.advanceTimersByTime(2400); });
    expect(container.querySelector('[role="status"]')).toHaveTextContent('달리가 단어장 넘기는 중');
  });

  it('문구를 주면 바꾸지 않고, 지연 0이면 바로 보인다', () => {
    const container = mount(<LoadingScreen message="채점 중이에요" delayMs={0} />);
    expect(container.querySelector('.loading-otter')).toHaveAttribute('src', '/loading/otter-study.svg');
    expect(container.querySelector('[role="status"]')).toHaveTextContent('채점 중이에요');
  });
});
