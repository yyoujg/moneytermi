import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, describe, expect, it } from 'vitest';
import { ProfileAvatar } from './ProfileAvatar';

Object.defineProperty(globalThis, 'IS_REACT_ACT_ENVIRONMENT', { value: true, configurable: true });
let cleanup = () => {};
afterEach(() => cleanup());
const mount = (avatar: string | undefined, size = 64) => {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);
  act(() => root.render(<ProfileAvatar name="예시" size={size} avatar={avatar} />));
  cleanup = () => { act(() => root.unmount()); container.remove(); };
  return container;
};

describe('사용자 프로필 그림', () => {
  it('고른 수달은 그림으로, 40px 이하는 단순화본으로 보여준다', () => {
    expect(mount('otter:happy').querySelector('img')).toHaveAttribute('src', '/profile/profile-happy.svg');
    expect(mount('otter:happy', 32).querySelector('img')).toHaveAttribute('src', '/profile/profile-happy-small.svg');
  });

  it('고르지 않았거나 예전 이모지·모르는 값이면 닉네임 첫 글자', () => {
    for (const value of [undefined, '', '🍊', 'otter:unknown']) {
      const container = mount(value);
      expect(container.querySelector('img')).toBeNull();
      expect(container.querySelector('[data-avatar-initial]')).toHaveTextContent('예');
    }
  });
});
