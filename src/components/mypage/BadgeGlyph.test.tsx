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

describe('목표 숫자 배지', () => {
  it('배지 10개를 분야 색과 목표 숫자로 표시하고 그림을 쓰지 않는다', () => {
    const container = mount(<>{BADGES.map(b => <BadgeGlyph key={b.id} id={b.id} />)}</>);
    const glyphs = [...container.querySelectorAll('.badge-glyph')];
    expect(glyphs).toHaveLength(BADGES.length);
    expect(container.querySelector('img')).toBeNull();
    for (const [i, badge] of BADGES.entries()) {
      expect(glyphs[i]).toHaveAttribute('data-badge-stat', badge.stat);
      expect(glyphs[i]).toHaveTextContent(String(badge.need));
    }
  });
  it('미획득 배지는 기존 미획득 색 규칙으로 구분하고 요청한 크기를 유지한다', () => {
    const glyph = mount(<BadgeGlyph id="w10" size={96} earned={false} />).querySelector('.badge-glyph')!;
    expect(glyph).toHaveAttribute('data-earned', 'false');
    expect(glyph).toHaveClass('badge-tone');
    expect(glyph).toHaveStyle({ width: '96px', height: '96px' });
  });
});
