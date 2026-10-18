import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, describe, expect, it } from 'vitest';
import { LeagueRankBadge } from './LeagueRankBadge';

Object.defineProperty(globalThis, 'IS_REACT_ACT_ENVIRONMENT', { value: true, configurable: true });
let cleanup = () => {};
afterEach(() => cleanup());
const mount = (rank: number) => {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);
  act(() => root.render(<LeagueRankBadge rank={rank} />));
  cleanup = () => { act(() => root.unmount()); container.remove(); };
  return container;
};

describe('읽기 쉬운 리그 순위 숫자', () => {
  it.each([1, 2, 3])('%i위는 실제 숫자와 같은 형태의 메달을 연결한다', rank => {
    const container = mount(rank);
    expect(container.querySelector('.league-rank-badge')).toHaveAttribute('data-podium', String(rank));
    expect(container).toHaveTextContent(`${rank}위`);
    expect(container.querySelector('.sr-only')).toHaveTextContent('위');
    expect(container.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
    expect(container.querySelector('svg')).toHaveAttribute('data-style', 'pastel-object');
    expect(container.querySelector('svg')).toHaveAttribute('viewBox', '0 0 100 100');
    expect(container.querySelector('circle')).toHaveAttribute('r', '48');
    expect(container.querySelector('[data-rank-face]')).toHaveAttribute('cy', '55');
    expect(container.querySelector('[data-rank-face]')).toHaveAttribute('r', '18');
    expect(container.querySelector('[data-rank-shape]')).toHaveAttribute('data-rank-shape', 'medal');
    expect(container.textContent).not.toMatch(/[🥇🥈🥉]/u);
  });
  it.each([4, 10, 12345])('%i위도 숫자를 바꾸거나 세 자리로 잘라내지 않는다', rank => {
    const container = mount(rank);
    expect(container.querySelector('.league-rank-badge')).not.toHaveAttribute('data-podium');
    expect(container).toHaveTextContent(`${rank}위`);
    expect(container.querySelector('button')).toBeNull();
  });
});
