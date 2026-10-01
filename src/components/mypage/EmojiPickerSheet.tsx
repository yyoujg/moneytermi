import { BottomSheet } from '@toss/tds-mobile';
import { ProfileAvatar } from '../ProfileAvatar';

// 🍊는 서버 기본 아바타라 목록에 있어야 다시 고를 수 있다.
const EMOJI_OPTIONS = ['🍊','😊','🥰','😎','🤓','🧠','🦁','🐼','🐻','🦊','🐯','🐶','🐱','🐰','🦉','🌟','🎯','🎮','🚀','🍀'];

export const EmojiPickerSheet = ({ open, current, onSelect, onClose }: { open: boolean; current: string; onSelect: (e: string) => void; onClose: () => void }) => (
  <BottomSheet open={open} className="original-modal" onDimmerClick={onClose} header={<span style={{ paddingLeft: '20px', fontWeight: 700, color: 'var(--color-ink)' }}>프로필 이모지 선택</span>}>
    <div className="px-5 pb-6">
      <div className="grid grid-cols-5 gap-3">
        {EMOJI_OPTIONS.map((emoji, i) => (
          <button
            key={emoji}
            onClick={() => { onSelect(emoji); onClose(); }}
            aria-label={emoji === '🍊' ? '머니터미 캐릭터' : `아바타 ${emoji}`}
            aria-pressed={current === emoji}
            style={{ '--i': i } as React.CSSProperties}
            className={`anim-pop-in w-full aspect-square rounded-card flex items-center justify-center text-3xl transition-all
              ${current === emoji ? 'bg-brand-500/15 ring-2 ring-brand-500' : 'bg-[var(--color-surface)] active:bg-[var(--color-line)]'}`}
          >
            {emoji === '🍊' ? <ProfileAvatar emoji={emoji} size={44} /> : emoji}
          </button>
        ))}
      </div>
    </div>
  </BottomSheet>
);
