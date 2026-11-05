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
  it('배지마다 수달 그림체 일러스트 하나를 그리고, 작으면 단순화본을 쓴다', () => {
    const container = mount(<>{BADGES.map(b => <BadgeGlyph key={b.id} id={b.id} size={44} />)}</>);
    const glyphs = [...container.querySelectorAll('.badge-glyph')];
    expect(glyphs).toHaveLength(BADGES.length);
    for (const [i, badge] of BADGES.entries()) {
      expect(glyphs[i]).toHaveAttribute('data-badge-stat', badge.stat);
      expect(glyphs[i].querySelectorAll('img')).toHaveLength(1);
      expect(glyphs[i].querySelector('img')?.getAttribute('src')).toMatch(/^\/badges\/v3\/badge-[a-z]+\d+\.svg$/);
    }
    // 배지마다 전용 그림(같은 그림을 빌려 쓰지 않는다)
    expect(new Set(glyphs.map(g => g.querySelector('img')?.getAttribute('src'))).size).toBe(BADGES.length);
    const small = mount(<BadgeGlyph id="w1" size={32} />).querySelector('img');
    expect(small).toHaveAttribute('src', '/badges/v3/badge-word1-small.svg');
  });
  it.each(['w1', 'w10'])('%s 미획득 배지는 잠김 표시와 요청한 크기를 유지한다', id => {
    const glyph = mount(<BadgeGlyph id={id} size={96} earned={false} />).querySelector('.badge-glyph')!;
    expect(glyph).toHaveAttribute('data-earned', 'false');
    expect(glyph).toHaveClass('is-locked');
    expect(glyph).toHaveStyle({ width: '96px', height: '96px' });
    expect(glyph.querySelector('img')?.getAttribute('src')).toMatch(/-locked\.svg$/);
  });
});
