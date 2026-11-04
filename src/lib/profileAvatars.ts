// 사용자 프로필 수달 5종 + 배경색. 선택값은 서버 profiles.emoji에 'otter:<그림>' 또는 'otter:<그림>:<배경>'으로 저장한다
export const PROFILE_AVATARS = [
  { id: 'basic', label: '기본' },
  { id: 'happy', label: '방긋' },
  { id: 'confident', label: '자신만만' },
  { id: 'surprised', label: '깜짝' },
  { id: 'sleepy', label: '졸림' },
] as const;

// 배경색은 기존 토큰만 쓴다(첫 번째가 기본)
export const PROFILE_BGS = [
  { id: 'sage', label: '세이지', color: 'var(--color-accent-soft)' },
  { id: 'sky', label: '하늘', color: 'var(--league-bg-2)' },
  { id: 'mint', label: '민트', color: 'var(--league-bg-3)' },
  { id: 'pink', label: '분홍', color: 'var(--league-bg-4)' },
  { id: 'lavender', label: '라벤더', color: 'var(--league-bg-5)' },
  { id: 'cream', label: '크림', color: 'var(--league-bg-8)' },
] as const;

// 예전 '프로필 캐릭터 선택'(2026-11-03 삭제)의 값. n번째로 고른 캐릭터를 n번째 수달 프로필로 보여 준다(🍊는 기본값이라 고르지 않은 사용자도 1번)
const LEGACY_AVATARS = ['🍊', '🐼', '🥰', '🦉'];

export const avatarValue = (id: string, bg?: string | null) => (bg && bg !== PROFILE_BGS[0].id ? `otter:${id}:${bg}` : `otter:${id}`);
export const avatarId = (value?: string | null) => {
  const legacy = value ? LEGACY_AVATARS.indexOf(value) : -1;
  if (legacy >= 0) return PROFILE_AVATARS[legacy].id;
  const id = value?.startsWith('otter:') ? value.split(':')[1] : null;
  return PROFILE_AVATARS.some(a => a.id === id) ? id : null;
};
export const avatarBg = (value?: string | null) => {
  const bg = value?.startsWith('otter:') ? value.split(':')[2] : undefined;
  return PROFILE_BGS.find(b => b.id === bg) ?? PROFILE_BGS[0];
};
