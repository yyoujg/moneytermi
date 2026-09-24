import { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { BottomSheet } from '@toss/tds-mobile';
import { Card } from '../ui/Card';

export const NicknameSheet = ({
  open,
  currentNickname,
  onClose,
  onSave,
  required = false,
}: {
  open: boolean;
  currentNickname: string;
  onClose: () => void;
  onSave: (nickname: string) => Promise<{ error: string | null }>;
  required?: boolean;
}) => {
  // 필수 모드에서는 기본 닉네임을 미리 채우지 않는다 — 그대로 저장하면 게이트가 무의미해진다.
  const [value, setValue] = useState(required ? '' : currentNickname);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // 시트는 항상 마운트돼 있고 open만 바뀐다. 열릴 때마다 값을 현재 닉네임으로 되돌리고 포커스를 준다.
  useEffect(() => {
    if (!open) return;
    setValue(required ? '' : currentNickname);
    setError(null);
    const t = setTimeout(() => inputRef.current?.focus(), 150);
    return () => clearTimeout(t);
  }, [open, required, currentNickname]);

  const handleSave = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await onSave(value);
      if (result.error) setError(result.error);
      else onClose();
    } catch {
      setError('닉네임 변경에 실패했어요');
    } finally {
      setLoading(false);
    }
  };

  return (
    <BottomSheet
      open={open}
      onDimmerClick={required ? () => {} : onClose}
      header={<span style={{ paddingLeft: '20px', fontWeight: 700, color: 'var(--color-ink)' }}>{required ? '닉네임을 정해주세요' : '닉네임 변경'}</span>}
      hasTextField
    >
      <div className="px-5 pb-6 flex flex-col gap-5">
        {required && (
          <p className="text-xs text-[var(--color-ink-3)] leading-relaxed">
            학습 기록과 랭킹에 쓰일 이름이에요. 나중에 마이페이지에서 바꿀 수 있어요.
          </p>
        )}
        <div className="flex flex-col gap-2">
          <Card tone="surface" pad="none" className={`flex items-center gap-3 px-4 py-3.5 transition-colors ${error ? 'ring-2 ring-danger-400/50' : ''}`}>
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
              <button onClick={() => { setValue(''); setError(null); }} aria-label="지우기" style={{ borderRadius: 9999 }} className="w-5 h-5 flex items-center justify-center bg-[var(--color-line)]">
                <X size={10} className="text-white" />
              </button>
            )}
          </Card>
          {error && <p className="text-xs text-danger-400 font-medium px-1">{error}</p>}
        </div>

        <button
          onClick={handleSave}
          disabled={loading || value.trim().length === 0 || (!required && value.trim() === currentNickname)}
          className="w-full py-4 rounded-button bg-brand-500 text-white text-sm font-bold active:bg-brand-600 disabled:opacity-40 transition-colors"
        >
          {loading ? '확인 중...' : required ? '시작하기' : '저장하기'}
        </button>
      </div>
    </BottomSheet>
  );
};
