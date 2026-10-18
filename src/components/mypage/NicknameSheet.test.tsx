import { act, type ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { NicknameSheet } from './NicknameSheet';

vi.mock('@toss/tds-mobile', () => ({
  BottomSheet: ({ open, children }: { open: boolean; children: ReactNode }) => open ? <div>{children}</div> : null,
}));
Object.defineProperty(globalThis, 'IS_REACT_ACT_ENVIRONMENT', { value: true, configurable: true });
let cleanup = () => {};
afterEach(() => { cleanup(); vi.useRealTimers(); });
const mount = (required = false) => {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);
  const onSave = vi.fn<(nickname: string) => Promise<{ error: string | null }>>().mockResolvedValue({ error: null });
  const onClose = vi.fn();
  act(() => root.render(<NicknameSheet open currentNickname="예시 학습자" onClose={onClose} onSave={onSave} required={required} />));
  cleanup = () => { act(() => root.unmount()); container.remove(); };
  const input = container.querySelector('input')!;
  const save = () => [...container.querySelectorAll('button')].find(e => /저장하기|시작하기|확인 중/.test(e.textContent ?? ''))!;
  const change = (value: string) => act(() => {
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!.call(input, value);
    input.dispatchEvent(new Event('input', { bubbles: true }));
  });
  return { container, input, save, change, onSave, onClose };
};

describe('둥근 영역에 초점을 표시하는 닉네임 입력', () => {
  it('현재 값·10자 제한·글자 수와 변경 전 저장 불가 조건을 유지한다', () => {
    const { container, input, save } = mount();
    expect(input).toHaveAttribute('aria-label', '닉네임');
    expect(input).toHaveAttribute('maxlength', '10');
    expect(input).toHaveValue('예시 학습자');
    expect(container.querySelector('.nickname-counter')).toHaveTextContent('6 / 10');
    expect(save()).toBeDisabled();
    expect(container.querySelector('.nickname-clear svg')).toHaveAttribute('stroke', 'currentColor');
  });
  it('지우면 글자 수와 오류를 초기화하고 입력칸으로 초점을 돌린다', () => {
    const { container, input, save, onSave } = mount();
    act(() => container.querySelector<HTMLButtonElement>('[aria-label="지우기"]')!.click());
    expect(input).toHaveValue('');
    expect(document.activeElement).toBe(input);
    expect(container.querySelector('.nickname-counter')).toHaveTextContent('0 / 10');
    expect(container.querySelector('[aria-label="지우기"]')).toBeNull();
    expect(save()).toBeDisabled();
    expect(onSave).not.toHaveBeenCalled();
  });
  it('새 닉네임을 기존 저장 함수로 그대로 전달하고 성공하면 닫는다', async () => {
    const { change, save, onSave, onClose } = mount();
    change('새 닉네임');
    expect(save()).not.toBeDisabled();
    await act(async () => save().click());
    expect(onSave).toHaveBeenCalledWith('새 닉네임');
    expect(onClose).toHaveBeenCalledOnce();
  });
  it('저장 오류는 입력과 연결하고 편집을 시작하면 초기화한다', async () => {
    const { container, input, change, save, onSave, onClose } = mount();
    onSave.mockResolvedValueOnce({ error: '이미 사용 중인 닉네임이에요' });
    change('다른 닉네임');
    await act(async () => save().click());
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(container.querySelector('.nickname-field')).toHaveClass('has-error');
    const error = [...container.querySelectorAll('p')].find(e => e.textContent === '이미 사용 중인 닉네임이에요')!;
    expect(input.getAttribute('aria-describedby')).toContain(error.id);
    expect(error).toHaveAttribute('role', 'alert');
    expect(onClose).not.toHaveBeenCalled();
    change('다른 이름');
    expect(input).toHaveAttribute('aria-invalid', 'false');
    expect(container.querySelector('.has-error')).toBeNull();
  });
  it('필수 모드는 빈 값으로 시작하고 150밀리초 뒤 입력 초점을 준다', () => {
    vi.useFakeTimers();
    const { input, save } = mount(true);
    expect(input).toHaveValue('');
    expect(save()).toHaveTextContent('시작하기');
    expect(save()).toBeDisabled();
    act(() => vi.advanceTimersByTime(150));
    expect(document.activeElement).toBe(input);
  });
  it('입력 라벨과 글자 수를 바깥에 두어 닉네임 입력 공간을 확보한다', () => {
    const { container, input } = mount();
    expect(container.querySelector('label')).toHaveAttribute('for', input.id);
    expect(container.querySelector('.nickname-field .nickname-counter')).toBeNull();
    expect(container.querySelector('.nickname-label-row .nickname-counter')).toHaveTextContent('6 / 10');
  });
  it('변경 전·수정 중·빈 값 안내를 구분하고 최대 길이를 표시한다', () => {
    const { container, change } = mount();
    expect(container.querySelector('.nickname-help')).toHaveTextContent('새 닉네임을 입력하면 저장할 수 있어요.');
    change('가나다라마바사아자차');
    expect(container.querySelector('.nickname-counter')).toHaveClass('is-full');
    expect(container.querySelector('.nickname-help')).toHaveTextContent('최대 10자까지 입력할 수 있어요.');
    change('');
    expect(container.querySelector('.nickname-help')).toHaveTextContent('닉네임을 입력해주세요.');
    expect(container.querySelector('.nickname-counter')).not.toHaveClass('is-full');
  });
  it('유효한 닉네임의 엔터 저장도 유지한다', async () => {
    const { input, change, onSave } = mount();
    change('수달 친구');
    await act(async () => input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true })));
    expect(onSave).toHaveBeenCalledWith('수달 친구');
  });
});

describe('닉네임 입력과 저장 상태의 일치', () => {
  it('빈 값과 변경하지 않은 값은 엔터를 눌러도 저장하지 않는다', async () => {
    const { input, change, onSave } = mount();
    await act(async () => input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true })));
    change('   ');
    await act(async () => input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true })));
    expect(onSave).not.toHaveBeenCalled();
  });
  it('한글 조합을 마치는 엔터는 저장으로 처리하지 않는다', async () => {
    const { input, change, onSave } = mount();
    change('수달 친구');
    await act(async () => input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', isComposing: true, bubbles: true })));
    expect(onSave).not.toHaveBeenCalled();
  });
  it('입력 안내를 연결하고 공통 저장 버튼과 단일 입력 영역을 사용한다', () => {
    const { container, input, save } = mount();
    expect(input).toHaveAttribute('enterkeyhint', 'done');
    expect(input.getAttribute('aria-describedby')).toContain(container.querySelector('.nickname-sheet-intro')?.id);
    expect(save()).toHaveClass('action-button');
    expect(save()).toHaveAttribute('aria-busy', 'false');
    expect(container.querySelector('.nickname-field')).not.toHaveClass('app-card');
  });
});
