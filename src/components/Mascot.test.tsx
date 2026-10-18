import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, describe, expect, it } from 'vitest';
import { Mascot } from './Mascot';

Object.defineProperty(globalThis, 'IS_REACT_ACT_ENVIRONMENT', { value: true, configurable: true });
let cleanup = () => {};
afterEach(() => cleanup());

describe('새 수달의 화면별 포즈', () => {
  it('기존 역할을 유지하면서 각 상황에 맞는 새 이미지를 사용한다', () => {
    const entries = [
      ['hello', 'hello'], ['empty', 'study'], ['error', 'think'],
      ['great', 'joy'], ['mission', 'joy'], ['reward', 'joy'], ['crown', 'joy'],
    ] as const;
    const container = document.createElement('div');
    document.body.appendChild(container);
    const root = createRoot(container);
    act(() => root.render(<>{entries.map(([name]) => <Mascot key={name} name={name} size={130} />)}</>));
    cleanup = () => { act(() => root.unmount()); container.remove(); };
    const images = [...container.querySelectorAll('img')];
    expect(images.map(image => image.getAttribute('src')))
      .toEqual(entries.map(([, pose]) => `/otter/v3/characters/${pose}.png`));
    for (const image of images) {
      expect(image).toHaveAttribute('width', '130');
      expect(image).toHaveAttribute('height', '130');
      expect(image).toHaveAttribute('aria-hidden', 'true');
      expect(image).not.toHaveClass('bg-white');
    }
  });
});
