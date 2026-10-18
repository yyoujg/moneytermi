import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, describe, expect, it } from 'vitest';
import { ProfileEditIcon } from './ProfileEditIcon';

Object.defineProperty(globalThis, 'IS_REACT_ACT_ENVIRONMENT', { value: true, configurable: true });
let cleanup = () => {};
afterEach(() => cleanup());
const mount = (size?: number) => {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);
  act(() => root.render(<ProfileEditIcon size={size} />));
  cleanup = () => { act(() => root.unmount()); container.remove(); };
  return container.querySelector('svg')!;
};

describe('잘 보이는 프로필 편집 표시', () => {
  it('기본 크기18픽셀과 일정한 선 굵기를 사용한다', () => {
    const icon = mount();
    expect(icon).toHaveAttribute('width', '18');
    expect(icon).toHaveAttribute('height', '18');
    expect(Number(icon.getAttribute('stroke-width'))).toBe(3);
    expect(icon.querySelector('path')).not.toBeNull();
  });
  it('닉네임 옆의 16픽셀에서도 같은 실제 선 굵기를 보존한다', () => {
    const icon = mount(16);
    expect(icon).toHaveAttribute('width', '16');
    expect(Number(icon.getAttribute('stroke-width')) * 16 / 24).toBe(2.25);
  });
  it('라이트·다크 모두 본문색을 따르고 중복 조작 이름을 만들지 않는다', () => {
    const icon = mount();
    expect(icon).toHaveClass('text-[var(--color-ink)]');
    expect(icon).toHaveAttribute('stroke', 'currentColor');
    expect(icon).toHaveAttribute('aria-hidden', 'true');
    expect(icon).toHaveAttribute('focusable', 'false');
  });
});
