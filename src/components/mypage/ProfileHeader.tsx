import { ProfileEditIcon } from './ProfileEditIcon';
import { ProfileGrowth } from './ProfileGrowth';

export const ProfileHeader = ({ nickname, xp, onEditNickname }: {
  nickname: string;
  xp: number;
  onEditNickname: () => void;
}) => (
  <section className="my-profile-card" aria-label="내 프로필">
    <div className="my-profile-identity">
      <div className="my-profile-details">
        <h3 className="my-profile-name">{nickname}</h3>
        <ProfileGrowth xp={xp} />
      </div>
    </div>
    <div className="my-profile-actions">
      <button type="button" onClick={onEditNickname} className="my-profile-action">
        <ProfileEditIcon size={16} />닉네임 변경
      </button>
    </div>
  </section>
);
