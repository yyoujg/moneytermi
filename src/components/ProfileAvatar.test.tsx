import { act, type ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, describe, expect, it } from 'vitest';
import { ProfileAvatar } from './ProfileAvatar';

Object.defineProperty(globalThis, 'IS_REACT_ACT_ENVIRONMENT', { value: true, configurable: true });
let cleanup = () => {};
afterEach(() => cleanup());
const mount = (children: ReactNode) => {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);
  act(() => root.render(children));
  cleanup = () => { act(() => root.unmount()); container.remove(); };
  return container;
};

describe('글자 프로필', () => {
  it('닉네임 첫 글자를 요청한 크기의 원으로 표시하고 캐릭터 그림을 쓰지 않는다', () => {
    const container = mount(<ProfileAvatar name="  성실한코알라" size={56} />);
    const avatar = container.querySelector('.profile-avatar')!;
    expect(avatar).toHaveTextContent('성');
    expect(avatar).toHaveAttribute('aria-hidden', 'true');
    expect(avatar).toHaveStyle({ width: '56px', height: '56px' });
    expect(container.querySelector('img')).toBeNull();
  });
  it('빈 닉네임도 깨지지 않게 대체 글자를 표시한다', () => {
    expect(mount(<ProfileAvatar name=" " size={40} />).querySelector('.profile-avatar')).toHaveTextContent('?');
  });
});
