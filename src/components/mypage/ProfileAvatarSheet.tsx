import { BottomSheet } from '@toss/tds-mobile';
import { ProfileAvatar } from '../ProfileAvatar';
import { avatarValue, PROFILE_AVATARS } from '../../lib/profileAvatars';

// 프로필 그림 고르기: 수달 5종. 누르면 바로 저장하고 닫는다(아직 안 고른 사용자는 첫 글자로 보인다)
export const ProfileAvatarSheet = ({ open, nickname, current, onClose, onSelect }: {
  open: boolean;
  nickname: string;
  current: string;
  onClose: () => void;
  onSelect: (value: string) => void;
}) => {
  const options = PROFILE_AVATARS.map(a => ({ value: avatarValue(a.id), label: a.label }));
  return (
    <BottomSheet open={open} onDimmerClick={onClose} header={<span className="sheet-title">프로필 그림</span>}>
      <ul className="profile-avatar-options px-5 pb-6" aria-label="프로필 그림 선택">
        {options.map(o => (
          <li key={o.label}>
            <button type="button" className="profile-avatar-option" aria-pressed={current === o.value} onClick={() => onSelect(o.value)}>
              <ProfileAvatar name={nickname} size={64} avatar={o.value} />
              <span>{o.label}</span>
            </button>
          </li>
        ))}
      </ul>
    </BottomSheet>
  );
};
