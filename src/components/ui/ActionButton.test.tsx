import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ActionButton } from './ActionButton';

Object.defineProperty(globalThis, 'IS_REACT_ACT_ENVIRONMENT', { value: true, configurable: true });
let cleanup = () => {};
afterEach(() => cleanup());

const mount = (props: Parameters<typeof ActionButton>[0] = {}) => {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);
  act(() => root.render(<ActionButton {...props}>학습 시작하기</ActionButton>));
  cleanup = () => { act(() => root.unmount()); container.remove(); };
  return container.querySelector('button')!;
};

describe('공통 행동 버튼', () => {
  it('기본 버튼은 의도치 않은 폼 전송 없이 주요 행동을 표시한다', () => {
    const button = mount();
    expect(button.type).toBe('button');
    expect(button.dataset.tone).toBe('primary');
    expect(button.dataset.size).toBe('md');
    expect(button.textContent).toBe('학습 시작하기');
  });
  it('보조·큰 버튼도 같은 규칙을 사용하고 접근성 속성을 전달한다', () => {
    const button = mount({ tone: 'secondary', size: 'lg', fullWidth: true, 'aria-label': '이전 용어', className: 'custom' });
    expect(button.dataset.tone).toBe('secondary');
    expect(button.dataset.size).toBe('lg');
    expect(button.classList.contains('w-full')).toBe(true);
    expect(button.classList.contains('custom')).toBe(true);
    expect(button.getAttribute('aria-label')).toBe('이전 용어');
  });
  it('활성 버튼의 동작을 그대로 전달한다', () => {
    const onClick = vi.fn();
    const button = mount({ onClick, tone: 'primary' });
    act(() => button.click());
    expect(onClick).toHaveBeenCalledOnce();
    expect(button.dataset.tone).toBe('primary');
  });
  it('밝은 보조 버튼은 활성 상태에서 클릭과 접근성 속성을 유지한다', () => {
    const onClick = vi.fn();
    const button = mount({ onClick, tone: 'soft', 'aria-label': '자세히 보기' });
    expect(button.dataset.tone).toBe('soft');
    expect(button.disabled).toBe(false);
    expect(button.getAttribute('aria-label')).toBe('자세히 보기');
    act(() => button.click());
    expect(onClick).toHaveBeenCalledOnce();
  });
  it('밝은 보조 버튼도 실제 비활성일 때만 클릭을 차단한다', () => {
    const onClick = vi.fn();
    const button = mount({ onClick, tone: 'soft', disabled: true });
    act(() => button.click());
    expect(button.disabled).toBe(true);
    expect(button.dataset.tone).toBe('soft');
    expect(onClick).not.toHaveBeenCalled();
  });
  it('비활성 상태에서 클릭을 차단하고 제출 유형을 보존한다', () => {
    const onClick = vi.fn();
    const button = mount({ onClick, disabled: true, type: 'submit' });
    act(() => button.click());
    expect(button.disabled).toBe(true);
    expect(button.type).toBe('submit');
    expect(onClick).not.toHaveBeenCalled();
  });
});
