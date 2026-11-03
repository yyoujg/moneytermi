import { ProfileEditIcon } from './ProfileEditIcon';
import { ProfileGrowth } from './ProfileGrowth';
import { ProfileAvatar } from '../ProfileAvatar';

export const ProfileHeader = ({ nickname, xp, emoji = '', onEditAvatar, onEditNickname }: {
  nickname: string;
  xp: number;
  emoji?: string;
  onEditAvatar?: () => void;
  onEditNickname: () => void;
}) => (
  <section className="my-profile-card" aria-label="내 프로필">
    <div className="my-profile-identity">
      <button type="button" className="my-profile-avatar" aria-label="아바타 변경" onClick={onEditAvatar}>
        <ProfileAvatar emoji={emoji} size={64} />
        <span><ProfileEditIcon size={16} /></span>
      </button>
      <div className="my-profile-details">
        <button type="button" onClick={onEditNickname} className="my-profile-name-button" aria-label="닉네임 변경">
          <h3 className="my-profile-name">{nickname}</h3><ProfileEditIcon size={16} />
        </button>
        <ProfileGrowth xp={xp} />
      </div>
    </div>
  </section>
);
