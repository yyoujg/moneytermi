import { act, createRef } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, describe, expect, it } from 'vitest';
import * as Controls from './ControlIcons';

Object.defineProperty(globalThis, 'IS_REACT_ACT_ENVIRONMENT', { value: true, configurable: true });
let cleanup = () => {};
afterEach(() => cleanup());
const mount = (content: React.ReactNode) => {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);
  act(() => root.render(content));
  cleanup = () => { act(() => root.unmount()); container.remove(); };
  return container;
};

describe('버튼 글자색을 따르는 작은 조작 표시', () => {
  it('방향·재시도·부스트 표시는 현재 글자색을 따르는 선형이다', () => {
    const container = mount(<>{Object.entries(Controls).map(([name, Icon]) => <Icon key={name} />)}</>);
    expect(container.querySelector('img')).toBeNull();
    expect(container.querySelectorAll('svg')).toHaveLength(6);
    for (const icon of container.querySelectorAll('svg')) {
      expect(icon).toHaveAttribute('fill', 'currentColor');
      expect(icon).toHaveAttribute('width', '18');
      expect(icon.querySelector('[opacity=\"0.2\"]')).toBeNull();
      expect(icon).toHaveAttribute('aria-hidden', 'true');
      expect(icon).toHaveAttribute('focusable', 'false');
    }
  });
  it('크기·펼침 상태·참조를 전달한다', () => {
    const ref = createRef<SVGSVGElement>();
    const container = mount(<Controls.ChevronDown ref={ref} size={13} className="is-open" />);
    const icon = container.querySelector('svg')!;
    expect(ref.current).toBe(icon);
    expect(icon).toHaveClass('is-open');
    expect(icon).toHaveAttribute('width', '13');
  });
});
