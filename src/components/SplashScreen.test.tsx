/// <reference types="node" />
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
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
  it('스플래시 글자는 중성색으로 구분하고 주황은 진행 표시에 유지한다', () => {
    const css = readFileSync(resolve(process.cwd(), 'src/index.css'), 'utf8');
    const brand = css.match(/\.splash-brand\s*\{([^}]+)\}/)?.[1] ?? '';
    const subtitle = css.match(/\.splash-copy p\s*\{([^}]+)\}/)?.[1] ?? '';
    const title = css.match(/\.splash-copy h1\s*\{([^}]+)\}/)?.[1] ?? '';
    expect(brand).toContain('color: var(--color-ink)');
    expect(subtitle).toContain('color: var(--color-ink-3)');
    expect(title).toContain('color: var(--color-ink)');
    expect(brand + subtitle).not.toContain('--color-brand-ink');
    expect(css.match(/\.splash-progress span\s*\{([^}]+)\}/)?.[1]).toContain('background: var(--color-brand-action)');
  });

  it('배경에 점무늬나 하단 장식 색면을 추가하지 않는다', () => {
    const css = readFileSync(resolve(process.cwd(), 'src/index.css'), 'utf8');
    expect(css).toMatch(/\.splash-screen::before,\s*\.splash-screen::after\s*\{\s*content:\s*none;\s*\}/);
    const background = css.match(/\.splash-screen\s*\{([^}]+)\}/)?.[1] ?? '';
    expect(background).toContain('background: var(--color-canvas)');
    expect(background).not.toMatch(/gradient|background-image/);
  });

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

    expect(image).toHaveAttribute('src', '/otter/v3/characters/hello.png');
    expect(container.querySelector('.splash-dash')).toBeNull();
  });
});
