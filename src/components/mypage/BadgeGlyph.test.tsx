/// <reference types="node" />
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { act, type ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, describe, expect, it } from 'vitest';
import { BadgeGlyph } from './BadgeGlyph';
import { BADGES } from '../../lib/badges';

Object.defineProperty(globalThis, 'IS_REACT_ACT_ENVIRONMENT', { value: true, configurable: true });
let cleanup = () => {};
afterEach(() => cleanup());
const mount = (children: ReactNode) => {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);
  act(() => root.render(children));
  cleanup = () => { act(() => root.unmount()); container.remove(); };
  return container;
};

describe('새 수달 그림체 배지', () => {
  it('배지 10개를 같은 새 수달 그림체의 개별 이미지로 표시한다', () => {
    const container = mount(<>{BADGES.map(b => <BadgeGlyph key={b.id} id={b.id} />)}</>);
    expect(container.querySelectorAll('img')).toHaveLength(BADGES.length);
    expect([...container.querySelectorAll('img')].map(el => el.getAttribute('src')))
      .toEqual(BADGES.map(b => `/otter/v3/badges/${b.id}.png`));
    expect(container.querySelector('svg')).toBeNull();
  });
  it('미획득 배지는 기존처럼 흑백·흐림으로 구분한다', () => {
    const container = mount(<BadgeGlyph id="w10" earned={false} />);
    const image = container.querySelector('img')!;
    expect(image.getAttribute('data-earned')).toBe('false');
    expect(image.classList.contains('grayscale')).toBe(true);
    expect(image.classList.contains('opacity-40')).toBe(true);
  });
  it('축하 화면은 선명한 새 그림과 요청한 크기를 유지한다', () => {
    const container = mount(<BadgeGlyph id="x1000" size={140} className="celebration" />);
    const image = container.querySelector('img')!;
    expect(image.getAttribute('data-earned')).toBe('true');
    expect(image.getAttribute('width')).toBe('140');
    expect(image.classList.contains('celebration')).toBe(true);
    expect(image.classList.contains('grayscale')).toBe(false);
    expect(image.getAttribute('aria-hidden')).toBe('true');
  });
  it('새 배지 10개가 512픽셀 투명 PNG로 존재한다', () => {
    for (const badge of BADGES) {
      const bytes = readFileSync(resolve(process.cwd(), `public/otter/v3/badges/${badge.id}.png`));
      expect([...bytes.subarray(0, 8)]).toEqual([137, 80, 78, 71, 13, 10, 26, 10]);
      expect(bytes.readUInt32BE(16)).toBe(512);
      expect(bytes.readUInt32BE(20)).toBe(512);
      expect(bytes[25]).toBe(6);
    }
  });
});
