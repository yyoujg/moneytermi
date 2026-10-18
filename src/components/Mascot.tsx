import { OTTER_IMAGES } from '../lib/otter';

// 수달은 안내·빈 화면·완료·보상·오류에서만 함께한다. 학습 본문과 문제 풀이에는 추가하지 않는다.
// empty는 공부하는 수달로 연결한다. 기존 역할 이름과 이미지 매핑은 유지한다.
const SRC = {
  hello: OTTER_IMAGES.hello,
  empty: OTTER_IMAGES.study,
  error: OTTER_IMAGES.think,
  great: OTTER_IMAGES.joy,
  mission: OTTER_IMAGES.joy,
  reward: OTTER_IMAGES.joy,
  crown: OTTER_IMAGES.joy,
} as const;

export const Mascot = ({ name, size = 120 }: { name: keyof typeof SRC; size?: number }) => (
  <img src={SRC[name]} alt="" aria-hidden="true" width={size} height={size}
    className="shrink-0 object-contain" style={{ width: size, height: size }} />
);
