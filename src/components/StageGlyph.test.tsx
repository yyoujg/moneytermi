import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, describe, expect, it } from 'vitest';
import { StageGlyph } from './StageGlyph';

Object.defineProperty(globalThis, 'IS_REACT_ACT_ENVIRONMENT', { value: true, configurable: true });
let cleanup = () => {};
afterEach(() => cleanup());
const mount = (id: number) => {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);
  act(() => root.render(<StageGlyph id={id} size={40} />));
  cleanup = () => { act(() => root.unmount()); container.remove(); };
  return container;
};

describe('기존 리그 등급 그림 보존', () => {
  it('등급에 대응하는 기존 그림을 크기 변경 없이 표시한다', () => {
    const container = mount(3);
    const image = container.querySelector('img');
    expect(image?.getAttribute('src')).toBe('/otter/v3/tiers/3.png');
    expect(image?.getAttribute('width')).toBe('40');
    expect(image?.getAttribute('height')).toBe('40');
    expect(container.querySelector('svg')).toBeNull();
  });
  it('최고 등급도 기존 그림 경로와 장식용 접근성 속성을 유지한다', () => {
    const container = mount(5);
    const image = container.querySelector('img');
    expect(image?.getAttribute('src')).toBe('/otter/v3/tiers/5.png');
    expect(image?.getAttribute('aria-hidden')).toBe('true');
    expect(image?.getAttribute('alt')).toBe('');
  });
});
