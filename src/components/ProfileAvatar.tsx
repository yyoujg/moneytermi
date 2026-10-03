// 서버에는 이모지가 그대로 저장되고, 화면에서는 이모지마다 다른 수달 캐릭터로 보여준다.
export const OTTER_FACE = '/otter/face.jpg';

// 원형으로 잘라도 머리·소품이 안 잘리는 그림만 남겼다. 빠진 예전 이모지는 기본 수달로 보인다.
const AVATAR_FILE: Record<string, number> = { '🥰': 2, '🐼': 7, '🐻': 8, '🦉': 14, '🌟': 15, '🎯': 16, '🎮': 17, '🚀': 18, '🍀': 19 };
const avatarSrc = (emoji: string) => (AVATAR_FILE[emoji] ? `/otter/avatar/${AVATAR_FILE[emoji]}.jpg` : OTTER_FACE);

export const ProfileAvatar = ({ emoji, size }: { emoji: string; size: number }) => (
  <img src={avatarSrc(emoji)} alt="" aria-hidden="true" className="shrink-0 rounded-full bg-white object-cover" style={{ width: size, height: size }} />
);
