import { act, type ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, describe, expect, it } from 'vitest';
import { StageGlyph } from './StageGlyph';

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

describe('리그 등급 표식', () => {
  it('등급을 선형 단색 아이콘으로 표시하고 그림 파일을 쓰지 않는다', () => {
    const container = mount(<StageGlyph id={3} size={40} className="scale-125" />);
    const glyph = container.querySelector('.stage-glyph')!;
    expect(glyph.tagName.toLowerCase()).toBe('svg');
    expect(glyph).toHaveAttribute('fill', 'currentColor');
    expect(glyph).toHaveAttribute('data-stage-id', '3');
    expect(glyph).toHaveAttribute('aria-hidden', 'true');
    expect(glyph).toHaveClass('scale-125');
    expect(glyph).toHaveStyle({ width: '40px', height: '40px' });
    expect(container.querySelector('img')).toBeNull();
  });
});
