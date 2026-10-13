import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, describe, expect, it } from 'vitest';
import { WordVisuals } from './WordVisuals';

Object.defineProperty(globalThis, 'IS_REACT_ACT_ENVIRONMENT', { value: true, configurable: true });

let cleanup = () => {};
afterEach(() => cleanup());

const mount = (visuals: Parameters<typeof WordVisuals>[0]['visuals']) => {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);
  act(() => root.render(<WordVisuals visuals={visuals} />));
  cleanup = () => { act(() => root.unmount()); container.remove(); };
  return container;
};

describe('WordVisuals tables and charts', () => {
  it('gives long first-column labels more room in three-column tables', () => {
    const container = mount([{
      type: 'table',
      title: '단리와 복리 비교',
      columns: ['구분', '단리', '복리'],
      rows: [
        ['이자가 붙는 곳', '원금에만', '원금 + 쌓인 이자'],
        ['10년 뒤 (100만 원, 연 10%)', '200만 원', '약 259만 원'],
      ],
    }]);

    expect([...container.querySelectorAll('col')].map(col => (col as HTMLTableColElement).style.width)).toEqual(['34%', '30%', '36%']);
  });

  it('keeps wide tables horizontally scrollable instead of squeezing every column', () => {
    const container = mount([{
      type: 'table',
      title: '자동차로 계산해 보기',
      columns: ['연도', '생산량 × 가격', '명목 GDP', '실질 GDP'],
      rows: [
        ['1년차(기준연도)', '100대 × 1,000만 원', '10억', '10억'],
        ['2년차', '100대 × 1,100만 원', '11억', '10억'],
      ],
    }]);

    expect(container.querySelector('table')).toHaveStyle({ minWidth: '520px' });
  });

  it('ignores broken line series instead of crashing the card', () => {
    expect(() => mount([{
      type: 'line',
      title: '값 변화',
      x: ['1월', '2월'],
      series: [{ name: '불완전', values: [1] }],
    }])).not.toThrow();
  });
});
