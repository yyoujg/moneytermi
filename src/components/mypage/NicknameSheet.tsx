import { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { BottomSheet } from '@toss/tds-mobile';

export const NicknameSheet = ({
  open,
  currentNickname,
  onClose,
  onSave,
}: {
  open: boolean;
  currentNickname: string;
  onClose: () => void;
  onSave: (nickname: string) => Promise<{ error: string | null }>;
}) => {
  const [value, setValue] = useState(currentNickname);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 100);
  }, []);

  const handleSave = async () => {
    setLoading(true);
    setError(null);
    const result = await onSave(value);
    setLoading(false);
    if (result.error) {
      setError(result.error);
    } else {
      onClose();
    }
  };

  return (
    <BottomSheet open={open} onDimmerClick={onClose} header={<span style={{ paddingLeft: '20px', fontWeight: 700 }}>닉네임 변경</span>} hasTextField>
      <div className="px-5 pb-6 flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <div className={`flex items-center gap-3 bg-[var(--color-surface)] rounded-2xl px-4 py-3.5 transition-colors ${error ? 'ring-2 ring-danger-400/50' : ''}`}>
            <input
              ref={inputRef}
              value={value}
              onChange={e => { setValue(e.target.value); setError(null); }}
              onKeyDown={e => { if (e.key === 'Enter') handleSave(); }}
              maxLength={10}
              placeholder="닉네임 입력"
              className="flex-1 bg-transparent text-sm font-semibold text-[var(--color-ink)] placeholder:text-[var(--color-ink-4)] outline-none"
            />
            <span className="text-xs text-[var(--color-ink-4)] shrink-0">{value.length}/10</span>
            {value.length > 0 && (
              <button onClick={() => { setValue(''); setError(null); }} className="w-5 h-5 flex items-center justify-center rounded-full bg-[var(--color-line)]">
                <X size={10} className="text-white" />
              </button>
            )}
          </div>
          {error && <p className="text-xs text-danger-400 font-medium px-1">{error}</p>}
        </div>

        <button
          onClick={handleSave}
          disabled={loading || value.trim().length === 0}
          className="w-full py-4 rounded-2xl bg-brand-500 text-white text-sm font-bold active:bg-brand-600 disabled:opacity-40 transition-colors"
        >
          {loading ? '확인 중...' : '저장하기'}
        </button>
      </div>
    </BottomSheet>
  );
};
