import { BottomSheet } from '@toss/tds-mobile';

const EMOJI_OPTIONS = ['😊','🥰','😎','🤓','🧠','🦁','🐼','🐻','🦊','🐯','🌟','🎯','🎮','🚀','💎','🔥','🍀','🎸','🏆','⚡'];

export const EmojiPickerSheet = ({ open, current, onSelect, onClose }: { open: boolean; current: string; onSelect: (e: string) => void; onClose: () => void }) => (
  <BottomSheet open={open} onDimmerClick={onClose} header={<span style={{ paddingLeft: '20px', fontWeight: 700, color: 'var(--color-ink)' }}>프로필 이모지 선택</span>}>
    <div className="px-5 pb-6">
      <div className="grid grid-cols-5 gap-3">
        {EMOJI_OPTIONS.map(emoji => (
          <button
            key={emoji}
            onClick={() => { onSelect(emoji); onClose(); }}
            className={`w-full aspect-square rounded-2xl flex items-center justify-center text-3xl transition-all
              ${current === emoji ? 'bg-brand-500/15 ring-2 ring-brand-500' : 'bg-[var(--color-surface)] active:bg-[var(--color-line)]'}`}
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>
  </BottomSheet>
);
