// 앱 캐릭터의 공통 원본. 서버에 저장된 프로필 이모지 값은 바꾸지 않는다.
export const OTTER_IMAGES = {
  hello: '/otter/v3/characters/hello.png',
  study: '/otter/v3/characters/study.png',
  joy: '/otter/v3/characters/joy.png',
  think: '/otter/v3/characters/think.png',
} as const;

export type OtterPose = keyof typeof OTTER_IMAGES;

export const OTTER_AVATAR_IMAGES: Record<OtterPose, string> = {
  hello: '/otter/v3/avatar/hello.png',
  study: '/otter/v3/avatar/study.png',
  joy: '/otter/v3/avatar/joy.png',
  think: '/otter/v3/avatar/think.png',
};

export const OTTER_FACE = OTTER_AVATAR_IMAGES.hello;

export const OTTER_POSE_LABELS: Record<OtterPose, string> = {
  hello: '인사하는 수달',
  study: '공부하는 수달',
  joy: '기뻐하는 수달',
  think: '생각하는 수달',
};

// 이전에 선택한 값도 새 캐릭터로 표시하되 저장값을 자동으로 덮어쓰지 않는다.
const AVATAR_POSES: Record<string, OtterPose> = {
  '🍊': 'hello',
  '🥰': 'joy',
  '🐼': 'study',
  '🐻': 'hello',
  '🦉': 'think',
  '🌟': 'joy',
  '🎯': 'study',
  '🎮': 'joy',
  '🚀': 'joy',
  '🍀': 'think',
};

export const getOtterAvatarPose = (emoji: string): OtterPose =>
  Object.hasOwn(AVATAR_POSES, emoji) ? AVATAR_POSES[emoji] : 'hello';

// 채점 이후 피드백 전용. 프로필과 기존 네 포즈에는 연결하지 않는다.
export const OTTER_FEEDBACK_IMAGES = {
  correct: '/otter/v3/feedback/correct.png',
  wrong: '/otter/v3/feedback/wrong.png',
} as const;

// 재화는 원형 파스텔 조개·번개 그림으로 표시한다. fish 키·파일명은 기존 연결 호환용이며 현재 그림은 에너지 번개다. 저장 단위와 잔액은 바꾸지 않는다.
export const OTTER_ITEM_IMAGES = {
  shell: '/otter/v3/items/shell.png',
  fish: '/otter/v3/items/fish.png',
} as const;
