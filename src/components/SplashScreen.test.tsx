import { createRoot } from 'react-dom/client';
import { act } from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import { SplashScreen } from './SplashScreen';

Object.defineProperty(globalThis, 'IS_REACT_ACT_ENVIRONMENT', { value: true, configurable: true });

let cleanup = () => {};
afterEach(() => cleanup());

const mount = () => {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);
  act(() => root.render(<SplashScreen />));
  cleanup = () => { act(() => root.unmount()); container.remove(); };
  return container;
};

describe('SplashScreen', () => {
  it('로딩 상태를 접근 가능한 상태 영역으로 보여준다', () => {
    const container = mount();
    const status = container.querySelector('[role="status"]');

    expect(status).toBeInTheDocument();
    expect(status).toHaveAttribute('aria-label', '머니터미를 불러오는 중');
    expect(container.textContent).toContain('곧 시작해요');
    expect(container.textContent).toContain('오늘의 학습을 준비하고 있어요');
  });

  it('머니터미 캐릭터 이미지를 사용한다', () => {
    const container = mount();
    const image = container.querySelector('img');

    expect(image).toHaveAttribute('src', '/otter/hello.jpg');
  });
});
