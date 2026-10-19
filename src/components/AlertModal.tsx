/* eslint-disable react-refresh/only-export-components */
import { useId, useLayoutEffect, useRef, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import { Check, AlertCircle } from './ui/OtterIcons';

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
const close = () => { queue = queue.slice(1); emit(); };

// 큐가 비워질 때만 언마운트하여 다음 메시지에서도 초점과 배경 잠금을 유지한다.
const ActiveAlert = ({ cur }: { cur: Msg }) => {
  const overlayRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const confirmRef = useRef<HTMLButtonElement>(null);
  const descriptionId = useId();

  useLayoutEffect(() => {
    const overlay = overlayRef.current!;
    const dialog = dialogRef.current!;
    const previousFocus = document.activeElement;
    const background = new Map<Element, { inert: string | null; hidden: string | null }>();
    let disposed = false;
    let recoveryQueued = false;
    let recoveryFrame: number | null = null;
    const focus = () => (confirmRef.current?.disabled ? dialog : confirmRef.current ?? dialog).focus({ preventScroll: true });

    const ensureFocus = () => {
      if (!disposed && !dialog.contains(document.activeElement)) focus();
    };
    const recoverFocus = () => {
      if (!recoveryQueued) {
        recoveryQueued = true;
        queueMicrotask(() => { recoveryQueued = false; ensureFocus(); });
      }
      if (recoveryFrame === null) {
        recoveryFrame = window.requestAnimationFrame(() => { recoveryFrame = null; ensureFocus(); });
      }
    };

    // TDS는 focusin뿐 아니라 focusout에서도 시트 안으로 동기적으로 되돌린다.
    // 첫 이동 전에 둘 다 보호하고, 이동 도중에는 재진입하지 않고 완료 후 확인한다.
    const containFocusOut = (event: FocusEvent) => {
      event.stopImmediatePropagation();
      recoverFocus();
    };
    // 바텀시트의 문서 초점/키보드 처리보다 먼저 가로채 중첩된 트랩끼리 충돌하지 않게 한다.
    const containFocus = (event: FocusEvent) => {
      event.stopImmediatePropagation();
      if (!(event.target instanceof Node) || !dialog.contains(event.target)) {
        focus();
        recoverFocus();
      }
    };
    const containKeyboard = (event: KeyboardEvent) => {
      if (event.key === 'Tab' || event.key === 'Escape') {
        event.preventDefault();
        event.stopImmediatePropagation();
        if (event.key === 'Escape') {
          if (event.type === 'keydown' && !event.repeat) close();
        } else {
          // 현재 대화상자의 유일한 순차 초점 대상은 확인 버튼이다. 역방향도 같은 곳으로 순환한다.
          focus();
        }
      } else if (!(event.target instanceof Node) || !dialog.contains(event.target)) {
        event.preventDefault();
        event.stopImmediatePropagation();
        focus();
      } else {
        // 확인 버튼의 기본 Enter/Space 동작은 두고 배경의 전역 단축키는 막는다.
        event.stopPropagation();
      }
    };
    window.addEventListener('focusin', containFocus, true);
    window.addEventListener('focusout', containFocusOut, true);
    window.addEventListener('keydown', containKeyboard, true);
    window.addEventListener('keyup', containKeyboard, true);
    window.addEventListener('keypress', containKeyboard, true);

    const lockBackground = () => {
      for (const element of document.body.children) {
        // 포털 자신과 그 조상은 절대 숨기지 않는다.
        if (element === overlay || element.contains(overlay)) continue;
        if (!background.has(element)) {
          background.set(element, { inert: element.getAttribute('inert'), hidden: element.getAttribute('aria-hidden') });
        }
        element.setAttribute('inert', '');
        element.setAttribute('aria-hidden', 'true');
      }
    };
    lockBackground();
    // inert 적용으로 인한 이전 초점 해제부터 끝낸 후 이동하고, 지연된 시트 처리 뒤에도 확인한다.
    focus();
    recoverFocus();
    // 열린 뒤 추가되는 바텀시트 포털도 배경으로 처리한다.
    const observer = new MutationObserver(lockBackground);
    observer.observe(document.body, { childList: true });

    return () => {
      disposed = true;
      if (recoveryFrame !== null) window.cancelAnimationFrame(recoveryFrame);
      observer.disconnect();
      window.removeEventListener('focusin', containFocus, true);
      window.removeEventListener('focusout', containFocusOut, true);
      window.removeEventListener('keydown', containKeyboard, true);
      window.removeEventListener('keyup', containKeyboard, true);
      window.removeEventListener('keypress', containKeyboard, true);
      for (const [element, saved] of background) {
        if (saved.inert === null) element.removeAttribute('inert');
        else element.setAttribute('inert', saved.inert);
        if (saved.hidden === null) element.removeAttribute('aria-hidden');
        else element.setAttribute('aria-hidden', saved.hidden);
      }
      // 배경 속성을 먼저 복구해야 원래 바텀시트 안의 버튼에도 초점을 돌려줄 수 있다.
      if (previousFocus instanceof HTMLElement && previousFocus.isConnected) previousFocus.focus({ preventScroll: true });
    };
  }, []);

  const error = cur.tone === 'error';
  return createPortal(
    // 본문 직속 포털이므로 바텀시트/앱 루트의 inert 영향을 받지 않는다.
    // TDS 바텀시트(10000)와 알림 레이어(30000)보다 위에서 배경과 확인 버튼을 함께 표시한다.
    <div ref={overlayRef} className="original-modal fixed inset-0 z-[40000] flex items-center justify-center px-6" style={{ background: 'var(--color-overlay)', pointerEvents: 'auto' }} onClick={e => { e.stopPropagation(); close(); }}>
      <div
        ref={dialogRef}
        role="alertdialog"
        aria-modal="true"
        aria-label={error ? '오류 알림' : '알림'}
        aria-describedby={descriptionId}
        tabIndex={-1}
        onClick={e => e.stopPropagation()}
        className="app-card w-full max-w-xs rounded-card bg-[var(--color-card)] overflow-hidden flex flex-col items-center anim-pop-in"
      >
        <div className={`w-full py-6 flex justify-center ${error ? 'bg-danger-500' : 'bg-brand-500'}`}>
          <div className="w-14 h-14 flex items-center justify-center bg-white" style={{ borderRadius: 9999 }}>
            {error
              ? <AlertCircle size={28} className="text-danger-500" />
              : <Check size={28} strokeWidth={3} className="text-[var(--color-brand-deep)]" />}
          </div>
        </div>
        <div className="w-full px-6 pt-5 pb-5 flex flex-col items-center gap-4">
          <p id={descriptionId} className="text-base font-bold text-[var(--color-ink)] text-center break-keep">{cur.text}</p>
          <button
            ref={confirmRef}
            type="button"
            onClick={close}
            className="w-full py-4 rounded-button text-sm font-bold text-white active:opacity-90 bg-brand-500"
          >
            확인
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
};

export const AlertModal = () => {
  const cur = useSyncExternalStore(subscribe, () => queue[0]);
  return cur ? <ActiveAlert cur={cur} /> : null;
};
