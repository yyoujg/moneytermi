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
  const onSelect = vi.fn<(_emoji: string) => Promise<boolean>>().mockResolvedValue(true);
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
  it('사용자가 선택할 때만 호환되는 기존 값으로 저장하고 선택창을 닫는다', async () => {
    const { container, onSelect, onClose } = mount('🍊');
    await act(async () => { container.querySelector<HTMLButtonElement>('[aria-label="공부하는 수달"]')!.click(); });
    expect(onSelect).toHaveBeenCalledWith('🐼');
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});

describe('캐릭터 저장 결과 확인', () => {
  it('저장 중 연속 선택을 막고 성공을 확인한 뒤에만 닫는다', async () => {
    const { container, onSelect, onClose } = mount('🍊');
    let resolve!: (ok: boolean) => void;
    onSelect.mockImplementation(() => new Promise<boolean>(done => { resolve = done; }));
    const button = container.querySelector<HTMLButtonElement>('[aria-label="공부하는 수달"]')!;
    act(() => { button.click(); button.click(); });
    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onClose).not.toHaveBeenCalled();
    expect([...container.querySelectorAll('button')].every(button => button.disabled)).toBe(true);
    expect(container.querySelector('[role="status"]')).toHaveTextContent('저장하고 있어요');
    await act(async () => { resolve(true); });
    expect(onClose).toHaveBeenCalledOnce();
  });
  it('실패하면 기존 선택을 표시한 채 다시 선택할 수 있다', async () => {
    const { container, onSelect, onClose } = mount('🍊');
    onSelect.mockResolvedValueOnce(false);
    const button = container.querySelector<HTMLButtonElement>('[aria-label="공부하는 수달"]')!;
    await act(async () => { button.click(); });
    expect(onClose).not.toHaveBeenCalled();
    expect(container.querySelector('[role="alert"]')).toHaveTextContent('저장 결과를 확인하지 못했어요');
    expect(container.querySelector('[aria-label="인사하는 수달"]')).toHaveAttribute('aria-pressed', 'true');
    expect(button.disabled).toBe(false);
    await act(async () => { button.click(); });
    expect(onSelect).toHaveBeenCalledTimes(2);
    expect(onClose).toHaveBeenCalledOnce();
  });
  it('요청 예외도 성공으로 닫지 않고 복구 안내를 표시한다', async () => {
    const { container, onSelect, onClose } = mount('🚀');
    onSelect.mockRejectedValueOnce(new Error('통신 실패'));
    await act(async () => { container.querySelector<HTMLButtonElement>('[aria-label="공부하는 수달"]')!.click(); });
    expect(onClose).not.toHaveBeenCalled();
    expect(container.querySelector('[role="alert"]')).toBeInTheDocument();
    expect(container.querySelector('[aria-label="기뻐하는 수달"]')).toHaveAttribute('aria-pressed', 'true');
  });
});
