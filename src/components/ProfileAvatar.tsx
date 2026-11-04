// 사용자 아바타는 마스코트(수달)와 분리한다: 회색 원 안에 닉네임 첫 글자. 상태 표시가 아니라 메인 컬러를 쓰지 않는다.
// 서버의 profiles.emoji는 그대로 두고 화면에서만 쓰지 않는다(docs/CHARACTER_BIBLE.md 8절).

export const ProfileAvatar = ({ name, size }: { name: string; size: number }) => (
  <span aria-hidden="true" data-avatar-initial className="profile-avatar shrink-0"
    style={{ width: size, height: size, background: 'var(--color-neutral-soft)', fontSize: size >= 56 ? 'var(--font-size-title-2)' : size >= 40 ? 'var(--font-size-headline)' : 'var(--font-size-label)' }}>
    {Array.from(name.trim())[0] ?? '?'}
  </span>
);
