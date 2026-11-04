import { BottomSheet } from '@toss/tds-mobile';
import { ProfileAvatar } from '../ProfileAvatar';
import { avatarBg, avatarId, avatarValue, PROFILE_AVATARS, PROFILE_BGS } from '../../lib/profileAvatars';

// 프로필 고르기: 수달 5종 + 배경색. 누를 때마다 바로 저장하고, 시트는 바깥을 눌러 닫는다
export const ProfileAvatarSheet = ({ open, nickname, current, onClose, onSelect }: {
  open: boolean;
  nickname: string;
  current: string;
  onClose: () => void;
  onSelect: (value: string) => void;
}) => {
  const currentId = avatarId(current) ?? PROFILE_AVATARS[0].id;
  const currentBg = avatarBg(current).id;
  return (
    <BottomSheet open={open} onDimmerClick={onClose} header={<span className="sheet-title">프로필 그림</span>}>
      <div className="px-5 pb-6">
        <ul className="profile-avatar-options" aria-label="프로필 그림 선택">
          {PROFILE_AVATARS.map(a => (
            <li key={a.id}>
              <button type="button" className="profile-avatar-option" aria-pressed={avatarId(current) === a.id} onClick={() => onSelect(avatarValue(a.id, currentBg))}>
                <ProfileAvatar name={nickname} size={64} avatar={avatarValue(a.id, currentBg)} />
                <span>{a.label}</span>
              </button>
            </li>
          ))}
        </ul>
        <p className="profile-bg-title">배경색</p>
        <ul className="profile-bg-options" aria-label="배경색 선택">
          {PROFILE_BGS.map(b => (
            <li key={b.id}>
              <button type="button" className="profile-bg-option" aria-pressed={currentBg === b.id} aria-label={b.label}
                style={{ background: b.color }} onClick={() => onSelect(avatarValue(currentId, b.id))} />
            </li>
          ))}
        </ul>
      </div>
    </BottomSheet>
  );
};
