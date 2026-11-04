// 홈 말풍선의 화자 아바타: 40px 원 안에 수달 달리 얼굴(단순화본 SVG를 viewBox로 얼굴만 자른 파일).
// 표정은 아직 기본 하나뿐이라 다른 mood도 기본 얼굴로 대체한다. 새 표정이 생기면 FACES에 경로만 추가한다.
export type DaliMood = 'default' | 'happy' | 'celebrate' | 'sad';

const FACES: Partial<Record<DaliMood, string>> = {
  default: '/otter/v5/otter-face-default.svg',
};

export const DaliAvatar = ({ mood = 'default' }: { mood?: DaliMood }) => (
  <span className="dali-avatar">
    <img src={FACES[mood] ?? FACES.default} alt="달리" width={40} height={40} />
  </span>
);
