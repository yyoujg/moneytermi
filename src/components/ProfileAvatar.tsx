// 사용자 아바타: 고른 수달 프로필(public/profile) 또는 기본값인 닉네임 첫 글자. 목록·저장 형식은 lib/profileAvatars
import { avatarId } from '../lib/profileAvatars';

export const ProfileAvatar = ({ name, size, avatar }: { name: string; size: number; avatar?: string | null }) => {
  const id = avatarId(avatar);
  // 40px 이하는 선을 굵게 한 단순화본
  if (id) return <img src={`/profile/profile-${id}${size <= 40 ? '-small' : ''}.svg`} alt="" aria-hidden="true" data-avatar-otter={id}
    width={size} height={size} className="profile-avatar shrink-0" style={{ width: size, height: size }} />;
  return (
    <span aria-hidden="true" data-avatar-initial className="profile-avatar shrink-0"
      style={{ width: size, height: size, background: 'var(--color-neutral-soft)', fontSize: size >= 56 ? 'var(--font-size-title-2)' : size >= 40 ? 'var(--font-size-headline)' : 'var(--font-size-label)' }}>
      {Array.from(name.trim())[0] ?? '?'}
    </span>
  );
};
