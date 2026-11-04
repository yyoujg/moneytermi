import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, describe, expect, it, vi } from 'vitest';
import BadgesScreen from './BadgesScreen';

const ctx = vi.hoisted(() => ({ value: { xp: 150, knownWords: Array.from({ length: 120 }, (_, i) => ({ id: i })), attendanceDates: [] as string[] } }));
vi.mock('../context/AppContext', () => ({ useAppContext: () => ctx.value }));

Object.defineProperty(globalThis, 'IS_REACT_ACT_ENVIRONMENT', { value: true, configurable: true });
let cleanup = () => {};
afterEach(() => cleanup());
const mount = () => {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);
  act(() => root.render(<BadgesScreen />));
  cleanup = () => { act(() => root.unmount()); container.remove(); };
  return container;
};

describe('배지 더보기', () => {
  it('계열별로 모든 배지를 보여주고 못 받은 배지는 지금 값/목표를 적는다', () => {
    const container = mount();
    expect(container.querySelectorAll('section h3')).toHaveLength(3);
    expect(container.querySelectorAll('li')).toHaveLength(19);
    const words200 = container.querySelector('[data-badge-id="w200"]')!.closest('li')!;
    expect(words200).toHaveTextContent('120 / 200개');
    expect(container.querySelector('[data-badge-id="w100"]')!.closest('li')).toHaveTextContent('획득');
  });
});
