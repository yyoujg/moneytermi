import { act, type ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { EmojiPickerSheet } from './EmojiPickerSheet';

vi.mock('@toss/tds-mobile', () => ({
  BottomSheet: ({ open, children }: { open: boolean; children: ReactNode }) => open ? <div>{children}</div> : null,
}));
Object.defineProperty(globalThis, 'IS_REACT_ACT_ENVIRONMENT', { value: true, configurable: true });
let cleanup = () => {};
afterEach(() => cleanup());
const mount = (current: string) => {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);
  const onSelect = vi.fn();
  const onClose = vi.fn();
  act(() => root.render(<EmojiPickerSheet open current={current} onSelect={onSelect} onClose={onClose} />));
  cleanup = () => { act(() => root.unmount()); container.remove(); };
  return { container, onSelect, onClose };
};

describe('새 수달 포즈 선택', () => {
  it('예전 선택값도 대응 포즈를 표시하고 저장값은 자동 변경하지 않는다', () => {
    const { container, onSelect } = mount('🚀');
    expect(container.querySelectorAll('button')).toHaveLength(4);
    expect(container.querySelector('[aria-label="기뻐하는 수달"]')).toHaveAttribute('aria-pressed', 'true');
    expect(container.querySelectorAll('[aria-pressed="true"]')).toHaveLength(1);
    expect(onSelect).not.toHaveBeenCalled();
  });
  it('사용자가 선택할 때만 호환되는 기존 값으로 저장하고 선택창을 닫는다', () => {
    const { container, onSelect, onClose } = mount('🍊');
    act(() => container.querySelector<HTMLButtonElement>('[aria-label="공부하는 수달"]')!.click());
    expect(onSelect).toHaveBeenCalledWith('🐼');
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
