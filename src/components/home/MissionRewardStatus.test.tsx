import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { cwd } from 'node:process';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { MissionRewardStatus } from './MissionRewardStatus';

Object.defineProperty(globalThis, 'IS_REACT_ACT_ENVIRONMENT', { value: true, configurable: true });
let cleanup = () => {};
afterEach(() => cleanup());
const mount = (isRewarded: boolean) => {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);
  const onClaim = vi.fn();
  act(() => root.render(<MissionRewardStatus isRewarded={isRewarded} onClaim={onClaim} />));
  cleanup = () => { act(() => root.unmount()); container.remove(); };
  return { container, onClaim };
};

describe('미션 보상 버튼과 완료 상태의 동일한 크기', () => {
  it('받기는 공통 크기를 쓰는 버튼이며 기존 보상 요청을 호출한다', () => {
    const { container, onClaim } = mount(false);
    const button = container.querySelector('button')!;
    expect(button).toHaveClass('mission-reward-status', 'bg-brand-500');
    expect(button).toHaveAttribute('type', 'button');
    expect(button).toHaveTextContent('받기');
    act(() => button.click());
    expect(onClaim).toHaveBeenCalledOnce();
  });
  it('완료도 같은 크기이며 초점·클릭 가능한 버튼으로 바뀌지 않는다', () => {
    const { container, onClaim } = mount(true);
    const complete = container.querySelector('[data-state="claimed"]')!;
    expect(complete).toHaveClass('mission-reward-status');
    expect(complete).toHaveTextContent('완료');
    expect(container.querySelector('button')).toBeNull();
    expect(complete).not.toHaveAttribute('tabindex');
    act(() => (complete as HTMLElement).click());
    expect(onClaim).not.toHaveBeenCalled();
  });
  it('두 상태에 같은 너비·최소 터치 높이·글자 크기를 지정한다', () => {
    const css = readFileSync(resolve(cwd(), 'src/index.css'), 'utf8');
    expect(css).toMatch(/\.mission-reward-status,\s*button\.mission-reward-status\s*\{[^}]*width: 64px;[^}]*height: var\(--size-touch-min\);[^}]*font-size: 14px !important;[^}]*font-weight: 600 !important;/s);
  });
});
