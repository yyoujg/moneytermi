import { useRef, useState } from 'react';
import { BottomSheet } from '@toss/tds-mobile';
import { AVATAR_OPTIONS } from '../../constants';
import { ProfileAvatar } from '../ProfileAvatar';
import { getOtterAvatarPose, OTTER_POSE_LABELS } from '../../lib/otter';

type Props = { open: boolean; current: string; onSelect: (emoji: string) => Promise<boolean>; onClose: () => void };

export const EmojiPickerSheet = ({ open, current, onSelect, onClose }: Props) => {
  const saving = useRef(false);
  const [pendingEmoji, setPendingEmoji] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const select = async (emoji: string) => {
    if (saving.current) return;
    saving.current = true;
    setPendingEmoji(emoji);
    setError(null);
    try {
      if (await onSelect(emoji)) onClose();
      else setError('저장 결과를 확인하지 못했어요. 잠시 후 다시 선택해 주세요.');
    } catch {
      setError('저장 결과를 확인하지 못했어요. 잠시 후 다시 선택해 주세요.');
    } finally {
      saving.current = false;
      setPendingEmoji(null);
    }
  };
  return (
    <BottomSheet open={open} onDimmerClick={pendingEmoji ? () => {} : onClose} header={<span style={{ paddingLeft: '20px', fontWeight: 700, color: 'var(--color-ink)' }}>프로필 캐릭터 선택</span>}>
      <div className="px-5 pb-6">
        <div className="grid grid-cols-4 gap-3" aria-busy={pendingEmoji !== null}>
          {AVATAR_OPTIONS.map((emoji, i) => (
            <button
              key={emoji}
              type="button"
              onClick={() => { void select(emoji); }}
              disabled={pendingEmoji !== null}
              aria-label={OTTER_POSE_LABELS[getOtterAvatarPose(emoji)]}
              aria-pressed={getOtterAvatarPose(current) === getOtterAvatarPose(emoji)}
              style={{ '--i': i } as React.CSSProperties}
              className={`anim-pop-in w-full aspect-square rounded-card flex items-center justify-center transition-all disabled:opacity-60
                ${getOtterAvatarPose(current) === getOtterAvatarPose(emoji) ? 'bg-brand-500/15 border-2 border-brand-500' : 'bg-[var(--color-surface)] active:bg-[var(--color-line)]'}`}
            >
              <ProfileAvatar emoji={emoji} size={48} />
            </button>
          ))}
        </div>
        {pendingEmoji && <p role="status" className="mt-3! text-sm text-[var(--color-ink-2)]">캐릭터를 저장하고 있어요.</p>}
        {error && <p role="alert" className="mt-3! text-sm text-[var(--color-ink-2)] break-keep">{error}</p>}
      </div>
    </BottomSheet>
  );
};
