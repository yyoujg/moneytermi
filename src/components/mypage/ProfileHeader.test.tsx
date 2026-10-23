import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ProfileHeader } from './ProfileHeader';

Object.defineProperty(globalThis, 'IS_REACT_ACT_ENVIRONMENT', { value: true, configurable: true });
let cleanup = () => {};
afterEach(() => cleanup());
const mount = (nickname = '예시 학습자') => {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);
  const onEditNickname = vi.fn();
  act(() => root.render(<ProfileHeader nickname={nickname} xp={120} onEditNickname={onEditNickname} />));
  cleanup = () => { act(() => root.unmount()); container.remove(); };
  return { container, onEditNickname };
};

describe('프로필 머리', () => {
  it('닉네임 첫 글자 프로필과 이름·경험치를 표시한다', () => {
    const { container } = mount();
    expect(container.querySelector('h3')).toHaveTextContent('예시 학습자');
    expect(container.querySelector('.my-profile-avatar, .profile-avatar')).toBeNull();
    expect(container.querySelector('img')).toBeNull();
    expect(container).toHaveTextContent('갓생러');
    expect(container).toHaveTextContent('재테크러까지 180 XP');
  });
  it('편집 버튼은 닉네임 변경 하나만 둔다', () => {
    const { container, onEditNickname } = mount();
    const buttons = [...container.querySelectorAll('button')];
    expect(buttons).toHaveLength(1);
    expect(buttons[0]).toHaveTextContent('닉네임 변경');
    expect(buttons[0].type).toBe('button');
    act(() => buttons[0].click());
    expect(onEditNickname).toHaveBeenCalledOnce();
    expect(container).not.toHaveTextContent('캐릭터 변경');
  });
  it('긴 닉네임을 데이터 단계에서 줄이지 않는다', () => {
    const nickname = '차근차근배우는수달';
    expect(mount(nickname).container.querySelector('h3')?.textContent).toBe(nickname);
  });
});
