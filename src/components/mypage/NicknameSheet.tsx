import { useState, useEffect, useRef, useId } from 'react';
import { X } from 'lucide-react';
import { BottomSheet } from '@toss/tds-mobile';
import { ActionButton } from '../ui/ActionButton';
import { UserRound } from '../ui/OtterIcons';

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
  const hintId = useId();
  const errorId = useId();
  const fieldId = useId();
  const helpId = useId();
  const introId = useId();
  const saveDisabled = loading || value.trim().length === 0 || (!required && value.trim() === currentNickname);
  const help = value.trim().length === 0
    ? '닉네임을 입력해주세요.'
    : !required && value.trim() === currentNickname
      ? '새 닉네임을 입력하면 저장할 수 있어요.'
      : '최대 10자까지 입력할 수 있어요.';

  // 시트는 항상 마운트돼 있고 open만 바뀐다. 열릴 때마다 값을 현재 닉네임으로 되돌리고 포커스를 준다.
  useEffect(() => {
    if (!open) return;
    setValue(required ? '' : currentNickname);
    setError(null);
    const t = setTimeout(() => inputRef.current?.focus(), 150);
    return () => clearTimeout(t);
  }, [open, required, currentNickname]);

  const handleSave = async () => {
    if (saveDisabled) return;
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
      className="original-modal"
      onDimmerClick={required ? () => {} : onClose}
      header={<div className="nickname-sheet-heading"><UserRound size={30} /><span>{required ? '닉네임을 정해주세요' : '닉네임 변경'}</span></div>}
      hasTextField
    >
      <div className="nickname-sheet-body">
        <p id={introId} className="nickname-sheet-intro">{required
          ? '학습 기록과 랭킹에 쓰일 이름이에요. 나중에 마이페이지에서 바꿀 수 있어요.'
          : '학습 기록과 리그에 표시할 이름이에요.'}</p>
        <div className="nickname-editor">
          <div className="nickname-label-row">
            <label htmlFor={fieldId}>닉네임</label>
            <span className={`nickname-counter${value.length === 10 ? ' is-full' : ''}`} aria-hidden="true">{value.length}<span> / 10</span></span>
          </div>
          <div className={`nickname-field${error ? ' has-error' : ''}`}>
            <input
              ref={inputRef}
              id={fieldId}
              value={value}
              onChange={e => { setValue(e.target.value); setError(null); }}
              onKeyDown={e => { if (e.key === 'Enter' && !e.nativeEvent.isComposing) { e.preventDefault(); void handleSave(); } }}
              maxLength={10}
              autoComplete="off"
              enterKeyHint="done"
              placeholder="닉네임 입력"
              aria-label="닉네임"
              aria-invalid={Boolean(error)}
              aria-describedby={`${introId} ${hintId} ${error ? errorId : helpId}`}
              className="nickname-input"
            />
            <span id={hintId} className="sr-only">최대 10자, 현재 {value.length}자 입력</span>
            {value.length > 0 && (
              <button type="button" onClick={() => { setValue(''); setError(null); inputRef.current?.focus(); }} aria-label="지우기" className="nickname-clear">
                <span><X size={14} strokeWidth={2.25} absoluteStrokeWidth aria-hidden="true" focusable="false" /></span>
              </button>
            )}
          </div>
          {error
            ? <p id={errorId} role="alert" className="nickname-help is-error">{error}</p>
            : <p id={helpId} className="nickname-help">{help}</p>}
        </div>

        <ActionButton
          onClick={handleSave}
          disabled={saveDisabled}
          aria-busy={loading}
          fullWidth
          size="lg"
          className="nickname-save"
        >
          {loading ? '확인 중...' : required ? '시작하기' : '저장하기'}
        </ActionButton>
      </div>
    </BottomSheet>
  );
};
