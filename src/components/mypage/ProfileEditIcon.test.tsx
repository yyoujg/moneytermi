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
  return container.querySelector('img')!;
};

describe('프로필 편집 표시', () => {
  it('수달 3색 연필 그림을 기본 20픽셀로, 장식으로만 쓴다', () => {
    const icon = mount();
    expect(icon).toHaveAttribute('src', '/icons/stat/icon-edit.svg');
    expect(icon).toHaveAttribute('width', '20');
    expect(icon).toHaveAttribute('alt', '');
    expect(icon).toHaveAttribute('aria-hidden', 'true');
  });
  it('크기를 바꿀 수 있다', () => {
    expect(mount(16)).toHaveAttribute('width', '16');
  });
});
