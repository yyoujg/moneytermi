import { getOtterAvatarPose, OTTER_AVATAR_IMAGES } from '../lib/otter';

const avatarSrc = (emoji: string) => OTTER_AVATAR_IMAGES[getOtterAvatarPose(emoji)];

export const ProfileAvatar = ({ emoji, size }: { emoji: string; size: number }) => (
  <img src={avatarSrc(emoji)} alt="" aria-hidden="true" width={size} height={size}
    className="shrink-0 rounded-full object-contain" style={{ width: size, height: size }} />
);
