import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { describe, expect, it } from 'vitest';
import { useModalTurn } from './modalTurn';

Object.defineProperty(globalThis, 'IS_REACT_ACT_ENVIRONMENT', { value: true, configurable: true });

const Modal = ({ name }: { name: string }) => (useModalTurn(true) ? <p>{name}</p> : null);

describe('useModalTurn', () => {
  it('동시에 뜨려는 모달은 하나씩 차례로 보여준다', () => {
    const container = document.createElement('div');
    const root = createRoot(container);
    act(() => root.render(<><Modal key="a" name="승급" /><Modal key="b" name="순위" /></>));
    expect(container.textContent).toBe('승급');
    act(() => root.render(<><Modal key="b" name="순위" /></>));
    expect(container.textContent).toBe('순위');
    act(() => root.unmount());
  });
});
