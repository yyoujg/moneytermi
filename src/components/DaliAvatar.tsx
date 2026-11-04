// 홈 말풍선의 화자: 원 배경 없이 72px 전신 v5 수달 달리. 40px보다 커서 기본본을 쓴다.
// 사용자 프로필 아바타가 아니다(캐릭터 바이블: 사용자는 마스코트로 표시하지 않는다).
export type DaliMood = 'default' | 'happy' | 'celebrate' | 'sad';

const POSE: Record<DaliMood, string> = { default: 'idle', happy: 'explain', celebrate: 'cheer', sad: 'defeat' };

export const DaliAvatar = ({ mood = 'default' }: { mood?: DaliMood }) => (
  <span className="dali-avatar">
    <img src={`/otter/v5/otter-${POSE[mood]}.svg`} alt="달리" width={72} height={72} />
  </span>
);
