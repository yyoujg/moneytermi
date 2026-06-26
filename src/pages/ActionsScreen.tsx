import { useState } from 'react';
import { Check, Plus, X } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import type { UserAction } from '../types';

const Row = ({ title, concept, isDone, onToggle, onRemove }: {
  title: string;
  concept?: string;
  isDone: boolean;
  onToggle: () => void;
  onRemove: () => void;
}) => (
  <div className="bg-[var(--color-card)] rounded-card px-4 py-3.5 flex items-center gap-3">
    <button
      onClick={onToggle}
      aria-label={isDone ? '완료 취소' : '완료'}
      className="shrink-0 w-10 h-10 flex items-center justify-center"
    >
      <span className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors
        ${isDone ? 'bg-brand-500 text-white' : 'bg-[var(--color-surface)] text-[var(--color-ink-4)]'}`}>
        <Check size={14} strokeWidth={2.5} />
      </span>
    </button>
    <div className="flex-1 min-w-0">
      <p className={`text-sm font-semibold break-keep ${isDone ? 'text-[var(--color-ink-4)] line-through' : 'text-[var(--color-ink)]'}`}>
        {title}
      </p>
      {concept && (
        <span className="inline-block text-3xs font-medium px-2 py-0.5 rounded mt-1 text-[var(--color-ink-4)]" style={{ backgroundColor: 'var(--color-surface)' }}>
          {concept}
        </span>
      )}
    </div>
    <button onClick={onRemove} aria-label="삭제" className="shrink-0 w-9 h-9 flex items-center justify-center text-[var(--color-ink-4)] active:opacity-60">
      <X size={15} />
    </button>
  </div>
);

const ActionsScreen = () => {
  const { myActions, allActions, allWords, toggleAction, removeAction, addCustomAction } = useAppContext();
  const [input, setInput] = useState('');

  const actionMap = new Map(allActions.map(a => [a.id, a]));
  const wordMap = new Map(allWords.map(w => [w.id, w.word]));

  const titleOf = (a: UserAction) =>
    a.customTitle ?? (a.actionId ? actionMap.get(a.actionId)?.title : undefined) ?? '실천 항목';
  const conceptOf = (a: UserAction) => {
    const wordId = a.actionId ? actionMap.get(a.actionId)?.wordId : undefined;
    return wordId !== undefined ? wordMap.get(wordId) : undefined;
  };

  const todo = myActions.filter(a => a.status !== 'done');
  const done = myActions.filter(a => a.status === 'done');

  const handleAdd = () => {
    const t = input.trim();
    if (!t) return;
    void addCustomAction(t);
    setInput('');
  };

  const renderRow = (a: UserAction) => (
    <Row
      key={a.id}
      title={titleOf(a)}
      concept={conceptOf(a)}
      isDone={a.status === 'done'}
      onToggle={() => toggleAction(a.id)}
      onRemove={() => removeAction(a.id)}
    />
  );

  return (
    <div className="flex flex-col h-full pb-32 overflow-y-auto [&::-webkit-scrollbar]:hidden" style={{ backgroundColor: 'var(--color-canvas)' }}>
      <div className="pt-4 px-5 pb-2">
        <h1 className="text-xl font-bold text-[var(--color-ink)] mb-4">실천</h1>

        {/* 직접 추가 */}
        <div className="flex gap-2 mb-4">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleAdd(); }}
            placeholder="실천할 일을 직접 추가"
            className="flex-1 px-4 py-3 rounded-button text-sm font-medium outline-none border bg-[var(--color-card)] border-[var(--color-line)] text-[var(--color-ink)] focus:border-brand-500/50"
            style={{ caretColor: 'var(--color-brand-500)' }}
          />
          <button
            onClick={handleAdd}
            disabled={!input.trim()}
            className="shrink-0 w-12 rounded-button bg-brand-500 text-white flex items-center justify-center active:opacity-90 disabled:opacity-30"
          >
            <Plus size={18} />
          </button>
        </div>

        {myActions.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 bg-brand-500/10 rounded-full flex items-center justify-center text-3xl mb-3">🎯</div>
            <p className="text-sm font-bold text-[var(--color-ink)] mb-1">아직 실천 항목이 없어요</p>
            <p className="text-xs text-[var(--color-ink-4)]">단어 카드에서 "실천하기"로 담거나 직접 추가해보세요</p>
          </div>
        )}

        {todo.length > 0 && (
          <div className="mb-4 flex flex-col gap-3">
            <p className="text-xs font-bold text-[var(--color-ink-4)] px-1">미완료 {todo.length}</p>
            <div className="flex flex-col gap-2">{todo.map(renderRow)}</div>
          </div>
        )}

        {done.length > 0 && (
          <div className="flex flex-col gap-3">
            <p className="text-xs font-bold text-[var(--color-ink-4)] px-1">완료 {done.length}</p>
            <div className="flex flex-col gap-2">{done.map(renderRow)}</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActionsScreen;
