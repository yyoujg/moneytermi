// 프로필은 닉네임 첫 글자로 표시한다. 캐릭터 그림은 쓰지 않는다.
export const ProfileAvatar = ({ name, size }: { name: string; size: number }) => (
  <span aria-hidden="true" className="profile-avatar" style={{ width: size, height: size, fontSize: Math.round(size * 0.4) }}>
    {[...name.trim()][0] ?? '?'}
  </span>
);
