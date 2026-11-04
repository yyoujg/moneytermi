// 홈 말풍선의 화자 아바타: 40px 원 안에 수달 달리 흉상(public/otter/avatar, docs/character/avatar/make_avatars.py로
// v5 수달을 턱선 위가 잘리지 않게 다시 프레이밍). 40px 이하라 선을 굵게 한 단순화본을 쓴다.
// 사용자 프로필 아바타가 아니다(캐릭터 바이블: 사용자는 마스코트로 표시하지 않는다).
export type DaliMood = 'default' | 'happy' | 'celebrate' | 'sad';

const POSE: Record<DaliMood, string> = { default: 'idle', happy: 'explain', celebrate: 'cheer', sad: 'defeat' };

export const DaliAvatar = ({ mood = 'default' }: { mood?: DaliMood }) => (
  <span className="dali-avatar">
    <img src={`/otter/avatar/avatar-${POSE[mood]}-small.svg`} alt="달리" width={40} height={40} />
  </span>
);
