import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, describe, expect, it } from 'vitest';
import { ProfileAvatar } from './ProfileAvatar';

Object.defineProperty(globalThis, 'IS_REACT_ACT_ENVIRONMENT', { value: true, configurable: true });
let cleanup = () => {};
afterEach(() => cleanup());
const mount = (emoji: string) => {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);
  act(() => root.render(<ProfileAvatar emoji={emoji} size={32} />));
  cleanup = () => { act(() => root.unmount()); container.remove(); };
  return container.querySelector('img')!;
};

describe('새 수달 프로필', () => {
  it('기본 프로필은 작은 크기에 맞춘 새 얼굴 그림을 사용한다', () => {
    const image = mount('🍊');
    expect(image).toHaveAttribute('src', '/otter/v3/avatar/hello.png');
    expect(image).toHaveAttribute('width', '32');
    expect(image).toHaveAttribute('height', '32');
    expect(image).toHaveClass('rounded-full');
    expect(image).not.toHaveClass('bg-white');
  });
  it('예전 저장값은 보존한 채 대응하는 새 얼굴을 표시한다', () => {
    expect(mount('🚀')).toHaveAttribute('src', '/otter/v3/avatar/joy.png');
  });
  it('미등록 값도 깨진 그림 없이 기본 얼굴을 표시한다', () => {
    expect(mount('')).toHaveAttribute('src', '/otter/v3/avatar/hello.png');
  });
});
