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
  it.each([1, 2, 3])('%i위는 금·은·동 메달과 실제 순위를 표시한다', rank => {
    const container = mount(rank);
    expect(container.querySelector('.league-rank-badge')).toHaveAttribute('data-podium', String(rank));
    expect(container).toHaveTextContent(`${rank}위`);
    expect(container.querySelector('.sr-only')).toHaveTextContent('위');
    // 이모지 메달 없이 숫자만 쓴다
    expect(container.textContent).not.toMatch(/[🥇🥈🥉]/u);
    expect(container.querySelector('svg')).toBeNull();
  });
  it.each([4, 10, 12345])('%i위도 숫자를 바꾸거나 세 자리로 잘라내지 않는다', rank => {
    const container = mount(rank);
    expect(container.querySelector('.league-rank-badge')).not.toHaveAttribute('data-podium');
    expect(container).toHaveTextContent(`${rank}위`);
    expect(container.querySelector('button')).toBeNull();
  });
});
