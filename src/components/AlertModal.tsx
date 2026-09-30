import { useSyncExternalStore } from 'react';
import { Check, AlertCircle } from 'lucide-react';

// 토스트 대신 쓰는 전역 알림 모달. 어디서든 showModal()로 띄우고, 여러 개면 확인할 때마다 다음 것이 뜬다.
type Msg = { text: string; tone: 'success' | 'error' };

let queue: Msg[] = [];
const subs = new Set<() => void>();
const emit = () => subs.forEach(f => f());

export const showModal = (text: string, tone: Msg['tone'] = 'success') => {
  queue = [...queue, { text, tone }];
  emit();
};

const subscribe = (cb: () => void) => { subs.add(cb); return () => { subs.delete(cb); }; };

export const AlertModal = () => {
  const cur = useSyncExternalStore(subscribe, () => queue[0]);
  if (!cur) return null;
  const close = () => { queue = queue.slice(1); emit(); };
  const error = cur.tone === 'error';

  return (
    // TDS 바텀시트 위에서도 보이도록 z를 높게 둔다 (포인트 부족 안내는 상점 시트가 열린 채로 뜬다)
    <div className="fixed inset-0 z-[1000] flex items-center justify-center px-6" style={{ background: 'rgba(0,0,0,0.55)' }} onClick={close}>
      <div
        role="alertdialog"
        aria-label={cur.text}
        onClick={e => e.stopPropagation()}
        className="w-full max-w-xs rounded-card bg-[var(--color-card)] overflow-hidden flex flex-col items-center shadow-lg anim-pop-in"
      >
        <div className={`w-full py-6 flex justify-center ${error ? 'bg-danger-500' : 'bg-brand-500'}`}>
          <div className="w-14 h-14 flex items-center justify-center bg-white" style={{ borderRadius: 9999, boxShadow: '0 0 0 6px rgba(255,255,255,0.25)' }}>
            {error
              ? <AlertCircle size={28} className="text-danger-500" />
              : <Check size={28} strokeWidth={3} className="text-brand-ink" />}
          </div>
        </div>
        <div className="w-full px-6 pt-5 pb-5 flex flex-col items-center gap-4">
          <p className="text-base font-bold text-[var(--color-ink)] text-center break-keep">{cur.text}</p>
          <button
            onClick={close}
            className={`w-full py-4 rounded-button text-sm font-bold text-white active:opacity-90 ${error ? 'bg-danger-500' : 'bg-brand-500'}`}
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
};
