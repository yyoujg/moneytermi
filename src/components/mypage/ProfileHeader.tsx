import type { ReactNode } from 'react';
import { ProfileEditIcon } from './ProfileEditIcon';
import { ProfileAvatar } from '../ProfileAvatar';

export const ProfileHeader = ({ nickname, avatar, subtitle, onEditAvatar, onEditNickname }: {
  nickname: string;
  avatar?: string;
  // 닉네임 아래 한 줄(예: 리그 등급)
  subtitle?: ReactNode;
  onEditAvatar?: () => void;
  onEditNickname: () => void;
}) => (
  <section className="my-profile-card" aria-label="내 프로필">
    <div className="my-profile-identity">
      <button type="button" className="my-profile-avatar" onClick={onEditAvatar} aria-label="프로필 그림 변경"><ProfileAvatar name={nickname} size={64} avatar={avatar} /></button>
      <div className="my-profile-details">
        <button type="button" onClick={onEditNickname} className="my-profile-name-button" aria-label="닉네임 변경">
          <h3 className="my-profile-name">{nickname}</h3><ProfileEditIcon size={20} />
        </button>
        {subtitle && <p className="my-profile-subtitle">{subtitle}</p>}
      </div>
    </div>
  </section>
);
