import { BottomSheet } from '@toss/tds-mobile';
import { AVATAR_OPTIONS } from '../../constants';
import { ProfileAvatar } from '../ProfileAvatar';

// 🔥 💎 🏆 ⚡ 는 앱 안에서 연속·티어·리그·포인트를 뜻하는 아이콘이라 아바타 값으로 쓰지 않는다.
export const EmojiPickerSheet = ({ open, current, onSelect, onClose }: { open: boolean; current: string; onSelect: (e: string) => void; onClose: () => void }) => (
  <BottomSheet open={open} onDimmerClick={onClose} header={<span style={{ paddingLeft: '20px', fontWeight: 700, color: 'var(--color-ink)' }}>프로필 캐릭터 선택</span>}>
    <div className="px-5 pb-6">
      <div className="grid grid-cols-5 gap-3">
        {AVATAR_OPTIONS.map((emoji, i) => (
          <button
            key={emoji}
            onClick={() => { onSelect(emoji); onClose(); }}
            aria-label={`수달 캐릭터 ${i + 1}`}
            aria-pressed={current === emoji}
            style={{ '--i': i } as React.CSSProperties}
            className={`anim-pop-in w-full aspect-square rounded-card flex items-center justify-center transition-all
              ${current === emoji ? 'bg-brand-500/15 border-2 border-brand-500' : 'bg-[var(--color-surface)] active:bg-[var(--color-line)]'}`}
          >
            <ProfileAvatar emoji={emoji} size={48} />
          </button>
        ))}
      </div>
    </div>
  </BottomSheet>
);
