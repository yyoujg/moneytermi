import { BottomSheet } from '@toss/tds-mobile';

// 🍊는 서버 기본 아바타라 목록에 있어야 다시 고를 수 있다.
// 🔥 💎 🏆 ⚡ 는 앱 안에서 연속·티어·리그·포인트를 뜻하는 아이콘이라 아바타로 쓰면 순위표 등에서 헷갈려 뺐다.
const EMOJI_OPTIONS = ['🍊','😊','🥰','😎','🤓','🧠','🦁','🐼','🐻','🦊','🐯','🐶','🐱','🐰','🦉','🌟','🎯','🎮','🚀','🍀'];

export const EmojiPickerSheet = ({ open, current, onSelect, onClose }: { open: boolean; current: string; onSelect: (e: string) => void; onClose: () => void }) => (
  <BottomSheet open={open} onDimmerClick={onClose} header={<span style={{ paddingLeft: '20px', fontWeight: 700, color: 'var(--color-ink)' }}>프로필 이모지 선택</span>}>
    <div className="px-5 pb-6">
      <div className="grid grid-cols-5 gap-3">
        {EMOJI_OPTIONS.map((emoji, i) => (
          <button
            key={emoji}
            onClick={() => { onSelect(emoji); onClose(); }}
            aria-label={`아바타 ${emoji}`}
            aria-pressed={current === emoji}
            style={{ '--i': i } as React.CSSProperties}
            className={`anim-pop-in w-full aspect-square rounded-card flex items-center justify-center text-3xl transition-all
              ${current === emoji ? 'bg-brand-500/15 ring-2 ring-brand-500' : 'bg-[var(--color-surface)] active:bg-[var(--color-line)]'}`}
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>
  </BottomSheet>
);
