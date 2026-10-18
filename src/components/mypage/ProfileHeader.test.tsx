import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { AVATAR_OPTIONS } from '../../constants';
import { getOtterAvatarPose, OTTER_AVATAR_IMAGES } from '../../lib/otter';
import { ProfileHeader } from './ProfileHeader';

Object.defineProperty(globalThis, 'IS_REACT_ACT_ENVIRONMENT', { value: true, configurable: true });
let cleanup = () => {};
afterEach(() => cleanup());
const mount = (nickname = '예시 학습자', emoji = AVATAR_OPTIONS[0]) => {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);
  const onEditAvatar = vi.fn(), onEditNickname = vi.fn();
  act(() => root.render(<ProfileHeader nickname={nickname} emoji={emoji} xp={120} onEditAvatar={onEditAvatar} onEditNickname={onEditNickname} />));
  cleanup = () => { act(() => root.unmount()); container.remove(); };
  return { container, onEditAvatar, onEditNickname };
};

describe('구분되는 프로필 편집 행동', () => {
  it.each(AVATAR_OPTIONS)('기존 아바타 저장값 %s의 그림 매핑과 이름·경험치를 유지한다', emoji => {
    const { container } = mount('예시 학습자', emoji);
    expect(container.querySelector('h3')).toHaveTextContent('예시 학습자');
    expect(container.querySelector('.my-profile-avatar img')).toHaveAttribute('src', OTTER_AVATAR_IMAGES[getOtterAvatarPose(emoji)]);
    expect(container).toHaveTextContent('탐험수달');
    expect(container).toHaveTextContent('척척수달까지 180 XP');
    expect(container.querySelector('.my-profile-avatar button')).toBeNull();
  });
  it('두 편집 버튼은 역할과 실제 동작을 구분한다', () => {
    const { container, onEditAvatar, onEditNickname } = mount();
    const buttons = [...container.querySelectorAll('button')];
    expect(buttons).toHaveLength(2);
    expect(buttons[0]).toHaveTextContent('캐릭터 변경');
    expect(buttons[1]).toHaveTextContent('닉네임 변경');
    act(() => buttons[0].click());
    expect(onEditAvatar).toHaveBeenCalledOnce();
    expect(onEditNickname).not.toHaveBeenCalled();
    act(() => buttons[1].click());
    expect(onEditNickname).toHaveBeenCalledOnce();
    expect(container.querySelectorAll('.lucide-pencil')).toHaveLength(1);
    expect(buttons.every(b => b.type === 'button')).toBe(true);
  });
  it('긴 닉네임을 데이터 단계에서 줄이지 않는다', () => {
    const nickname = '차근차근배우는수달';
    expect(mount(nickname).container.querySelector('h3')?.textContent).toBe(nickname);
  });
});
