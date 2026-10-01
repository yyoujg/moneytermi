export const ProfileAvatar = ({ emoji, size }: { emoji: string; size: number }) => (
  <span
    className="relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-[var(--color-brand-soft)]"
    style={{ width: size, height: size, fontSize: size * 0.48 }}
    aria-hidden="true"
  >
    {emoji === '🍊'
      ? <img src="/logo.png" alt="" className="absolute max-w-none" style={{ width: size * 2.2, left: -size * 0.6, top: -size * 1.06 }} />
      : emoji}
  </span>
);
