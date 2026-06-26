import { BottomSheet } from '@toss/tds-mobile';
import { Check } from 'lucide-react';
import type { ActionTemplate, UserAction } from '../types';

export const ActionPickerSheet = ({
  open,
  onClose,
  actions,
  myActions,
  onAdd,
}: {
  open: boolean;
  onClose: () => void;
  actions: ActionTemplate[];
  myActions: UserAction[];
  onAdd: (actionId: string) => void;
}) => {
  const addedIds = new Set(myActions.map(a => a.actionId));
  return (
    <BottomSheet open={open} onDimmerClick={onClose} header={<span style={{ paddingLeft: '20px', fontWeight: 700, color: 'var(--color-ink)' }}>실천하기</span>}>
      <div className="px-5 pb-6 flex flex-col gap-2.5">
        {actions.length === 0 && (
          <p className="text-center text-xs text-[var(--color-ink-4)] py-8">담을 실천 항목이 없어요</p>
        )}
        {actions.map((a) => {
          const added = addedIds.has(a.id);
          return (
            <div key={a.id} className="bg-[var(--color-canvas)] rounded-2xl px-4 py-4 flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-[var(--color-ink)] break-keep">{a.title}</p>
                {a.description && (
                  <p className="text-xs text-[var(--color-ink-3)] leading-relaxed mt-1 break-keep">{a.description}</p>
                )}
              </div>
              <button
                onClick={() => onAdd(a.id)}
                disabled={added}
                className={`shrink-0 px-3 py-2 rounded-xl text-xs font-bold active:opacity-80 disabled:opacity-100 flex items-center gap-1
                  ${added ? 'bg-[var(--color-surface)] text-[var(--color-ink-4)]' : 'bg-brand-500 text-white'}`}
              >
                {added ? <><Check size={13} /> 담김</> : '담기'}
              </button>
            </div>
          );
        })}
      </div>
    </BottomSheet>
  );
};
