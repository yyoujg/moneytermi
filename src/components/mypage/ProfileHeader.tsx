import { Smile } from 'lucide-react';
import { ProfileAvatar } from '../ProfileAvatar';
import { ProfileEditIcon } from './ProfileEditIcon';
import { ProfileGrowth } from './ProfileGrowth';

export const ProfileHeader = ({ nickname, emoji, xp, onEditAvatar, onEditNickname }: {
  nickname: string;
  emoji: string;
  xp: number;
  onEditAvatar: () => void;
  onEditNickname: () => void;
}) => (
  <section className="my-profile-card" aria-label="내 프로필">
    <div className="my-profile-identity">
      <div className="my-profile-avatar"><ProfileAvatar emoji={emoji} size={76} /></div>
      <div className="my-profile-details">
        <h3 className="my-profile-name">{nickname}</h3>
        <ProfileGrowth xp={xp} />
      </div>
    </div>
    <div className="my-profile-actions">
      <button type="button" onClick={onEditAvatar} className="my-profile-action">
        <Smile size={17} strokeWidth={2.25} absoluteStrokeWidth aria-hidden="true" focusable="false" />캐릭터 변경
      </button>
      <button type="button" onClick={onEditNickname} className="my-profile-action">
        <ProfileEditIcon size={16} />닉네임 변경
      </button>
    </div>
  </section>
);
