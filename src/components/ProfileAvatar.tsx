// 사용자 아바타는 마스코트(수달)와 분리한다: 원 안에 닉네임 첫 글자, 색은 닉네임으로 고정한 기존 토큰 하나.
// 서버의 profiles.emoji는 그대로 두고 화면에서만 쓰지 않는다(docs/CHARACTER_BIBLE.md 8절).
const AVATAR_TONES = ['var(--color-accent-soft)', 'var(--color-surface)', 'var(--color-action-soft)'];

const toneOf = (name: string) => AVATAR_TONES[Array.from(name).reduce((sum, ch) => sum + ch.codePointAt(0)!, 0) % AVATAR_TONES.length];

export const ProfileAvatar = ({ name, size }: { name: string; size: number }) => (
  <span aria-hidden="true" data-avatar-initial className="profile-avatar shrink-0"
    style={{ width: size, height: size, background: toneOf(name), fontSize: size >= 56 ? 'var(--font-size-title-2)' : size >= 40 ? 'var(--font-size-headline)' : 'var(--font-size-label)' }}>
    {Array.from(name.trim())[0] ?? '?'}
  </span>
);
