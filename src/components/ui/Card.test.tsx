import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Card } from './Card';

Object.defineProperty(globalThis, 'IS_REACT_ACT_ENVIRONMENT', { value: true, configurable: true });
let cleanup = () => {};
afterEach(() => cleanup());
const mount = (props: Parameters<typeof Card>[0] = {}) => {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);
  act(() => root.render(<Card {...props}>경제 기초</Card>));
  cleanup = () => { act(() => root.unmount()); container.remove(); };
  return container.firstElementChild as HTMLDivElement;
};

describe('수달 컨셉 공통 카드', () => {
  it('기본 카드는 입체 표면과 공통 곡률을 연결한다', () => {
    const card = mount();
    expect(card).toHaveClass('app-card', 'rounded-card', 'p-4');
    expect(card).toHaveAttribute('data-card-tone', 'card');
    expect(card).toHaveTextContent('경제 기초');
  });
  it('중첩 보조 표면은 별도 역할로 구분한다', () => {
    const card = mount({ tone: 'surface', pad: 'lg' });
    expect(card).toHaveAttribute('data-card-tone', 'surface');
    expect(card).toHaveClass('bg-[var(--color-surface)]', 'p-5');
    expect(card.classList.contains('border')).toBe(false);
  });
  it('크기·접근성·직접 스타일을 보존한다', () => {
    const card = mount({ pad: 'none', className: 'custom', role: 'group', 'aria-label': '결과 요약', style: { border: 0 } });
    expect(card).toHaveClass('custom');
    expect(card).not.toHaveClass('p-4');
    expect(card).toHaveAttribute('aria-label', '결과 요약');
    expect(card).toHaveAttribute('role', 'group');
    expect(card.style.border).toBe('0px');
  });
  it('상호작용 카드의 기존 동작을 막지 않는다', () => {
    const onClick = vi.fn();
    const card = mount({ role: 'button', tabIndex: 0, onClick });
    act(() => card.click());
    expect(onClick).toHaveBeenCalledOnce();
    expect(card.tabIndex).toBe(0);
  });
});
