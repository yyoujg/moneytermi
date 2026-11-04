// 사용자 프로필 수달 5종. 선택값은 서버 profiles.emoji에 'otter:<id>'로 저장한다(예전 이모지 값은 첫 글자로 보여 준다)
export const PROFILE_AVATARS = [
  { id: 'basic', label: '기본' },
  { id: 'happy', label: '방긋' },
  { id: 'confident', label: '자신만만' },
  { id: 'surprised', label: '깜짝' },
  { id: 'sleepy', label: '졸림' },
] as const;

// 예전 '프로필 캐릭터 선택'(2026-11-03 삭제)의 값. n번째로 고른 캐릭터를 n번째 수달 프로필로 보여 준다(🍊는 기본값이라 고르지 않은 사용자도 1번)
const LEGACY_AVATARS = ['🍊', '🐼', '🥰', '🦉'];

export const avatarValue = (id: string) => `otter:${id}`;
export const avatarId = (value?: string | null) => {
  const legacy = value ? LEGACY_AVATARS.indexOf(value) : -1;
  if (legacy >= 0) return PROFILE_AVATARS[legacy].id;
  const id = value?.startsWith('otter:') ? value.slice(6) : null;
  return PROFILE_AVATARS.some(a => a.id === id) ? id : null;
};
