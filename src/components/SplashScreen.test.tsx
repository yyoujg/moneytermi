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
  it('배경은 그림 바탕과 같은 단색이라 넓은 화면에서도 양옆 색이 갈리지 않는다', () => {
    const css = readFileSync(resolve(process.cwd(), 'src/index.css'), 'utf8');
    const background = css.match(/\.splash-screen\s*\{([^}]+)\}/)?.[1] ?? '';
    expect(background).toContain('background: var(--color-splash-bg)');
    expect(background).toContain('justify-content: center');
    expect(background).not.toMatch(/gradient|background-image/);
    // 토큰 색 = 스플래시 그림 첫 사각형(바탕) 색
    const tokens = readFileSync(resolve(process.cwd(), 'src/styles/tokens.css'), 'utf8');
    const ref = tokens.match(/--color-splash-bg:\s*var\((--[a-z0-9-]+)\)/)?.[1];
    const tokenHex = tokens.match(new RegExp(`${ref}:\\s*(#[0-9a-fA-F]{6})`))?.[1];
    const svg = readFileSync(resolve(process.cwd(), 'public/splash/splash.svg'), 'utf8');
    const artHex = svg.match(/<rect[^>]*fill="(#[0-9A-Fa-f]{6})"/)?.[1];
    expect(tokenHex?.toLowerCase()).toBe(artHex?.toLowerCase());
  });

  it('진행률이 없으니 막대 대신 1초 뒤에 나타나는 스피너만 둔다', () => {
    const css = readFileSync(resolve(process.cwd(), 'src/index.css'), 'utf8');
    expect(css).not.toContain('.splash-progress');
    expect(css.match(/\.splash-spinner\s*\{([^}]+)\}/)?.[1]).toMatch(/opacity: 0;[\s\S]*splash-reveal 0s linear 1s forwards/);
  });

  it('로딩 상태를 접근 가능한 상태 영역으로 보여주고 안내 문구는 두지 않는다', () => {
    const container = mount();
    const status = container.querySelector('[role="status"]');

    expect(status).toHaveAttribute('aria-label', '머니터미를 불러오는 중');
    expect(container.textContent).toBe('');
    // 글자까지 들어간 스플래시 그림 한 장(장식)
    expect(container.querySelectorAll('img')).toHaveLength(1);
    expect(container.querySelector('img')).toHaveAttribute('src', '/splash/splash.svg');
    expect(container.querySelector('img')).toHaveAttribute('alt', '');
  });
});
