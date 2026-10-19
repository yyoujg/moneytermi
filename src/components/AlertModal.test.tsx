import { act, StrictMode } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AlertModal, showModal } from './AlertModal';

Object.defineProperty(globalThis, 'IS_REACT_ACT_ENVIRONMENT', { value: true, configurable: true });
let root: Root;
let container: HTMLDivElement;
let opener: HTMLButtonElement;
const dialog = () => document.querySelector<HTMLDivElement>('[role="alertdialog"]');
const confirm = () => dialog()!.querySelector<HTMLButtonElement>('button')!;
const open = (text = '저장했어요', tone: 'success' | 'error' = 'success') => act(() => showModal(text, tone));
const key = (target: EventTarget, value: string, options: KeyboardEventInit = {}) => {
  const event = new KeyboardEvent('keydown', { key: value, bubbles: true, cancelable: true, ...options });
  act(() => { target.dispatchEvent(event); });
  return event;
};
const clickConfirm = () => act(() => confirm().click());

beforeEach(() => {
  container = document.createElement('div');
  opener = document.createElement('button');
  opener.textContent = '상점 열기';
  container.appendChild(opener);
  const mountPoint = document.createElement('div');
  container.appendChild(mountPoint);
  document.body.appendChild(container);
  opener.focus();
  root = createRoot(mountPoint);
  act(() => root.render(<AlertModal />));
});

afterEach(() => {
  // 언마운트 검사에서도 전역 큐를 비운다. 운영용 초기화 API는 추가하지 않는다.
  act(() => root.render(<AlertModal />));
  while (dialog()) clickConfirm();
  act(() => root.unmount());
  document.body.replaceChildren();
  vi.restoreAllMocks();
});

describe('전역 알림의 키보드와 접근성', () => {
  it('닫혀 있을 때는 초점이나 배경을 변경하지 않는다', () => {
    expect(dialog()).toBeNull();
    expect(document.activeElement).toBe(opener);
    expect(container).not.toHaveAttribute('inert');
    expect(container).not.toHaveAttribute('aria-hidden');
  });

  it('열리면 확인 버튼으로 이동하고 유효한 이름·설명을 제공한다', () => {
    open();
    expect(document.activeElement).toBe(confirm());
    expect(dialog()).toHaveAttribute('aria-modal', 'true');
    expect(dialog()).toHaveAccessibleName('알림');
    expect(dialog()).toHaveAccessibleDescription('저장했어요');
    expect(confirm()).toHaveAttribute('type', 'button');
    expect(container).toHaveAttribute('inert');
    expect(container).toHaveAttribute('aria-hidden', 'true');
  });

  it('오류 알림도 이름과 설명을 구분하고 기존 오류 디자인을 유지한다', () => {
    open('조개가 부족해요', 'error');
    expect(dialog()).toHaveAccessibleName('오류 알림');
    expect(dialog()).toHaveAccessibleDescription('조개가 부족해요');
    expect(dialog()!.querySelector('.bg-danger-500')).not.toBeNull();
    expect(dialog()!.parentElement).toHaveClass('original-modal', 'z-[40000]');
  });

  it('Tab과 Shift+Tab을 확인 버튼으로 순환시킨다', () => {
    open();
    expect(key(confirm(), 'Tab').defaultPrevented).toBe(true);
    expect(document.activeElement).toBe(confirm());
    expect(key(confirm(), 'Tab', { shiftKey: true }).defaultPrevented).toBe(true);
    expect(document.activeElement).toBe(confirm());
    act(() => dialog()!.focus());
    key(dialog()!, 'Tab', { shiftKey: true });
    expect(document.activeElement).toBe(confirm());
  });

  it('확인 버튼이 비활성일 때는 대화상자로 초점을 대체한다', () => {
    open();
    confirm().disabled = true;
    key(dialog()!, 'Tab');
    expect(document.activeElement).toBe(dialog());
    confirm().disabled = false;
  });

  it('프로그램에 의한 바깥 초점도 차단하고 바텀시트 초점 트랩에 전파하지 않는다', () => {
    const sheetTrap = vi.fn();
    document.addEventListener('focusin', sheetTrap);
    try {
      open();
      act(() => opener.focus());
      expect(document.activeElement).toBe(confirm());
      expect(sheetTrap).not.toHaveBeenCalled();
    } finally {
      document.removeEventListener('focusin', sheetTrap);
    }
  });

  it('배경 잠금이 끝난 후에만 알림의 초기 초점을 요청한다', () => {
    const nativeFocus = HTMLElement.prototype.focus;
    const locked: boolean[] = [];
    vi.spyOn(HTMLElement.prototype, 'focus').mockImplementation(function (this: HTMLElement, options) {
      if (this.closest('[role="alertdialog"]')) locked.push(container.hasAttribute('inert'));
      nativeFocus.call(this, options);
    });
    open();
    expect(locked.length).toBeGreaterThan(0);
    expect(locked.every(Boolean)).toBe(true);
    expect(document.activeElement).toBe(confirm());
  });

  it('TDS처럼 이전 시트로 되돌리는 focusout 처리를 첫 이동부터 차단한다', () => {
    const sheetFocusOut = vi.fn((event: FocusEvent) => {
      if (event.relatedTarget instanceof Node && !container.contains(event.relatedTarget)) opener.focus();
    });
    document.addEventListener('focusout', sheetFocusOut);
    opener.addEventListener('focusout', sheetFocusOut);
    try {
      open();
      expect(sheetFocusOut).not.toHaveBeenCalled();
      expect(document.activeElement).toBe(confirm());
    } finally {
      document.removeEventListener('focusout', sheetFocusOut);
      opener.removeEventListener('focusout', sheetFocusOut);
    }
  });

  it('첫 focus 요청이 무시되어도 마이크로태스크에서 초점을 확보한다', async () => {
    const nativeFocus = HTMLElement.prototype.focus;
    let ignored = false;
    vi.spyOn(HTMLElement.prototype, 'focus').mockImplementation(function (this: HTMLElement, options) {
      if (!ignored && this.closest('[role="alertdialog"]')) { ignored = true; return; }
      nativeFocus.call(this, options);
    });
    open();
    expect(document.activeElement).toBe(opener);
    await act(async () => { await Promise.resolve(); });
    expect(document.activeElement).toBe(confirm());
  });

  it('focusout 뒤 BODY만 남고 focusin이 없어도 이동 완료 후 복구한다', async () => {
    open();
    act(() => confirm().blur());
    expect(document.activeElement).toBe(document.body);
    await act(async () => { await Promise.resolve(); });
    expect(document.activeElement).toBe(confirm());
  });

  it('초기 이동과 마이크로태스크 이동이 지연되면 다음 화면 프레임에서도 재확인한다', async () => {
    const frames: FrameRequestCallback[] = [];
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation(callback => { frames.push(callback); return frames.length; });
    const nativeFocus = HTMLElement.prototype.focus;
    let attempts = 0;
    vi.spyOn(HTMLElement.prototype, 'focus').mockImplementation(function (this: HTMLElement, options) {
      if (this.closest('[role="alertdialog"]') && ++attempts <= 2) return;
      nativeFocus.call(this, options);
    });
    open();
    await act(async () => { await Promise.resolve(); });
    expect(document.activeElement).toBe(opener);
    expect(frames).toHaveLength(1);
    act(() => frames[0](0));
    expect(document.activeElement).toBe(confirm());
  });

  it('닫히거나 언마운트되면 예약 복구를 취소하여 원래 초점을 다시 빼앗지 않는다', async () => {
    const frames: FrameRequestCallback[] = [];
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation(callback => { frames.push(callback); return frames.length; });
    const cancel = vi.spyOn(window, 'cancelAnimationFrame');
    for (const unmount of [false, true]) {
      open();
      const buttonFocus = vi.spyOn(confirm(), 'focus');
      if (unmount) act(() => root.render(null));
      else clickConfirm();
      expect(cancel).toHaveBeenCalledWith(frames.length);
      await act(async () => { await Promise.resolve(); frames[frames.length - 1](0); });
      expect(document.activeElement).toBe(opener);
      expect(buttonFocus).not.toHaveBeenCalled();
      expect(container).not.toHaveAttribute('inert');
    }
  });

  it('배경 키보드 동작과 전역 단축키를 차단하되 확인의 기본 키 동작은 막지 않는다', () => {
    open();
    const backgroundKey = vi.fn();
    document.addEventListener('keydown', backgroundKey);
    try {
      expect(key(opener, 'Enter').defaultPrevented).toBe(true);
      expect(document.activeElement).toBe(confirm());
      expect(key(confirm(), 'Enter').defaultPrevented).toBe(false);
      expect(key(confirm(), ' ').defaultPrevented).toBe(false);
      expect(backgroundKey).not.toHaveBeenCalled();
    } finally {
      document.removeEventListener('keydown', backgroundKey);
    }
  });

  it('키를 놓거나 누르는 후속 이벤트도 배경으로 전파하거나 다음 큐를 닫지 않는다', () => {
    open('첫 안내');
    open('둘째 안내');
    const backgroundKey = vi.fn();
    document.addEventListener('keyup', backgroundKey);
    document.addEventListener('keypress', backgroundKey);
    try {
      key(confirm(), 'Escape');
      for (const type of ['keyup', 'keypress']) {
        const event = new KeyboardEvent(type, { key: 'Escape', bubbles: true, cancelable: true });
        act(() => { confirm().dispatchEvent(event); });
        expect(event.defaultPrevented).toBe(true);
        expect(dialog()).toHaveAccessibleDescription('둘째 안내');
      }
      expect(backgroundKey).not.toHaveBeenCalled();
    } finally {
      document.removeEventListener('keyup', backgroundKey);
      document.removeEventListener('keypress', backgroundKey);
    }
  });

  it('큐의 다음 메시지로 넘어갈 때 버튼 초점과 배경 잠금을 계속 유지한다', () => {
    open('첫 안내');
    const button = confirm();
    const restore = vi.spyOn(opener, 'focus');
    open('다음 안내', 'error');
    clickConfirm();
    expect(dialog()).toHaveAccessibleDescription('다음 안내');
    expect(dialog()).toHaveAccessibleName('오류 알림');
    expect(confirm()).toBe(button);
    expect(document.activeElement).toBe(button);
    expect(container).toHaveAttribute('inert');
    expect(restore).not.toHaveBeenCalled();
    clickConfirm();
    expect(dialog()).toBeNull();
    expect(document.activeElement).toBe(opener);
    expect(restore).toHaveBeenCalledOnce();
    expect(container).not.toHaveAttribute('inert');
  });

  it('본문 클릭은 유지하고 바깥 클릭과 Escape는 각각 큐 한 건만 닫는다', () => {
    open('첫 안내');
    open('둘째 안내');
    open('셋째 안내');
    act(() => dialog()!.querySelector('p')!.click());
    expect(dialog()).toHaveAccessibleDescription('첫 안내');
    act(() => dialog()!.parentElement!.click());
    expect(dialog()).toHaveAccessibleDescription('둘째 안내');
    expect(key(confirm(), 'Escape').defaultPrevented).toBe(true);
    expect(dialog()).toHaveAccessibleDescription('셋째 안내');
    key(confirm(), 'Escape', { repeat: true });
    expect(dialog()).toHaveAccessibleDescription('셋째 안내');
    key(confirm(), 'Escape');
    expect(dialog()).toBeNull();
    expect(document.activeElement).toBe(opener);
  });

  it('원래 inert와 aria-hidden의 값 및 속성 부재를 정확히 복구한다', () => {
    container.setAttribute('aria-hidden', 'false');
    const existing = document.createElement('aside');
    existing.setAttribute('inert', '기존값');
    existing.setAttribute('aria-hidden', 'true');
    document.body.appendChild(existing);
    open();
    clickConfirm();
    expect(container).not.toHaveAttribute('inert');
    expect(container).toHaveAttribute('aria-hidden', 'false');
    expect(existing).toHaveAttribute('inert', '기존값');
    expect(existing).toHaveAttribute('aria-hidden', 'true');
  });

  it('시트 안에 렌더해도 본문 직속 포털로 자신과 조상을 inert 처리하지 않는다', () => {
    act(() => root.render(<section role="dialog" aria-label="상점 시트"><AlertModal /></section>));
    open();
    expect(dialog()!.parentElement!.parentElement).toBe(document.body);
    for (let element: HTMLElement | null = dialog(); element; element = element.parentElement) {
      expect(element).not.toHaveAttribute('inert');
      expect(element).not.toHaveAttribute('aria-hidden', 'true');
    }
    expect(container).toHaveAttribute('inert');
    clickConfirm();
    expect(document.activeElement).toBe(opener);
  });

  it('열린 뒤 추가되는 시트 포털도 잠그고 제거된 배경의 속성까지 복구한다', async () => {
    open();
    const sheet = document.createElement('div');
    sheet.setAttribute('aria-hidden', 'false');
    await act(async () => { document.body.appendChild(sheet); });
    expect(sheet).toHaveAttribute('inert');
    expect(sheet).toHaveAttribute('aria-hidden', 'true');
    sheet.remove();
    clickConfirm();
    expect(sheet).not.toHaveAttribute('inert');
    expect(sheet).toHaveAttribute('aria-hidden', 'false');
  });

  it('열린 상태에서 언마운트해도 복구하고 전역 큐 자체는 유지한다', () => {
    open('유지할 안내');
    act(() => root.render(null));
    expect(dialog()).toBeNull();
    expect(document.activeElement).toBe(opener);
    expect(container).not.toHaveAttribute('inert');
    expect(container).not.toHaveAttribute('aria-hidden');
    act(() => root.render(<AlertModal />));
    expect(dialog()).toHaveAccessibleDescription('유지할 안내');
    expect(document.activeElement).toBe(confirm());
  });

  it('엄격 모드의 효과 재실행 뒤에도 초점과 배경을 올바르게 복구한다', () => {
    act(() => root.render(<StrictMode><AlertModal /></StrictMode>));
    open();
    expect(document.activeElement).toBe(confirm());
    expect(container).toHaveAttribute('inert');
    clickConfirm();
    expect(document.activeElement).toBe(opener);
    expect(container).not.toHaveAttribute('inert');
    expect(container).not.toHaveAttribute('aria-hidden');
  });

  it('마지막 닫기 뒤에는 초점과 키보드 이벤트를 가로채지 않는다', () => {
    open();
    clickConfirm();
    const target = document.createElement('button');
    document.body.appendChild(target);
    act(() => target.focus());
    expect(document.activeElement).toBe(target);
    expect(key(target, 'Tab').defaultPrevented).toBe(false);
    expect(key(target, 'Escape').defaultPrevented).toBe(false);
  });

  it('원래 초점 요소가 제거되었어도 닫기를 안전하게 처리한다', () => {
    open();
    opener.remove();
    expect(clickConfirm).not.toThrow();
    expect(dialog()).toBeNull();
    expect(container).not.toHaveAttribute('inert');
  });

  it('시트의 본문 포인터 잠금을 유지하면서 알림에는 포인터 입력을 허용한다', () => {
    const original = document.body.style.pointerEvents;
    document.body.style.pointerEvents = 'none';
    try {
      open();
      expect(dialog()!.parentElement).toHaveStyle({ pointerEvents: 'auto' });
      expect(document.body.style.pointerEvents).toBe('none');
      clickConfirm();
      expect(document.body.style.pointerEvents).toBe('none');
    } finally {
      document.body.style.pointerEvents = original;
    }
  });

  it('저장값을 수정하지 않는다', () => {
    const set = vi.spyOn(Storage.prototype, 'setItem');
    const remove = vi.spyOn(Storage.prototype, 'removeItem');
    const clear = vi.spyOn(Storage.prototype, 'clear');
    open();
    clickConfirm();
    expect(set).not.toHaveBeenCalled();
    expect(remove).not.toHaveBeenCalled();
    expect(clear).not.toHaveBeenCalled();
  });
});
