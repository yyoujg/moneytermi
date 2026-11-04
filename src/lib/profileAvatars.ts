// 사용자 프로필 수달 5종. 선택값은 서버 profiles.emoji에 'otter:<id>'로 저장한다(예전 이모지 값은 첫 글자로 보여 준다)
export const PROFILE_AVATARS = [
  { id: 'basic', label: '기본' },
  { id: 'happy', label: '방긋' },
  { id: 'confident', label: '자신만만' },
  { id: 'surprised', label: '깜짝' },
  { id: 'sleepy', label: '졸림' },
] as const;

export const avatarValue = (id: string) => `otter:${id}`;
export const avatarId = (value?: string | null) => {
  const id = value?.startsWith('otter:') ? value.slice(6) : null;
  return PROFILE_AVATARS.some(a => a.id === id) ? id : null;
};
