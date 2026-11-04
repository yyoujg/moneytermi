import { ProfileEditIcon } from './ProfileEditIcon';
import { ProfileGrowth } from './ProfileGrowth';
import { ProfileAvatar } from '../ProfileAvatar';

export const ProfileHeader = ({ nickname, stageId, onEditNickname }: {
  nickname: string;
  stageId: number;
  onEditNickname: () => void;
}) => (
  <section className="my-profile-card" aria-label="내 프로필">
    <div className="my-profile-identity">
      <span className="my-profile-avatar"><ProfileAvatar name={nickname} size={64} /></span>
      <div className="my-profile-details">
        <button type="button" onClick={onEditNickname} className="my-profile-name-button" aria-label="닉네임 변경">
          <h3 className="my-profile-name">{nickname}</h3><ProfileEditIcon size={16} />
        </button>
        <ProfileGrowth stageId={stageId} />
      </div>
    </div>
  </section>
);
