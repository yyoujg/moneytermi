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
  it('기본 크기 18픽셀의 듀오톤 표시를 사용한다', () => {
    const icon = mount();
    expect(icon).toHaveAttribute('width', '18');
    expect(icon).toHaveAttribute('height', '18');
    expect(icon.querySelector('[opacity="0.2"]')).not.toBeNull();
  });
  it('닉네임 옆의 16픽셀 크기도 전달한다', () => {
    const icon = mount(16);
    expect(icon).toHaveAttribute('width', '16');
  });
  it('라이트·다크 모두 본문색을 따르고 중복 조작 이름을 만들지 않는다', () => {
    const icon = mount();
    expect(icon).toHaveClass('text-[var(--color-ink)]');
    expect(icon).toHaveAttribute('fill', 'currentColor');
    expect(icon).toHaveAttribute('aria-hidden', 'true');
    expect(icon).toHaveAttribute('focusable', 'false');
  });
});
