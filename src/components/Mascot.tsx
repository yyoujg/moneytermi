// 수달 캐릭터. 말을 거는 순간(시작·빈 화면·완료·보상·오류)에만 쓰고, 문제를 풀거나 읽는 화면에는 넣지 않는다.
// 이미지 배경이 흰색이라 흰 둥근 타일로 보여준다(흰 화면 위에서는 경계가 보이지 않는다).
const SRC = {
  hello: '/otter/hello.jpg',     // 안녕! 함께 배워요
  empty: '/otter/empty.jpg',     // 아직 배울 내용이 없어요
  error: '/otter/error.jpg',     // 문제가 생겼어요
  great: '/otter/great.jpg',     // 잘하고 있어요
  mission: '/otter/mission.jpg', // 미션 완료
  reward: '/otter/reward.jpg',   // 보상을 받았어요
  crown: '/otter/crown.jpg',     // 꾸준히 하면 더 높이
} as const;

export const Mascot = ({ name, size = 120 }: { name: keyof typeof SRC; size?: number }) => (
  <img src={SRC[name]} alt="" aria-hidden="true" className="shrink-0 rounded-3xl bg-white object-contain" style={{ height: size }} />
);
