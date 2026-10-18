import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, describe, expect, it } from 'vitest';
import { ProfileGrowth } from './ProfileGrowth';

Object.defineProperty(globalThis, 'IS_REACT_ACT_ENVIRONMENT', { value: true, configurable: true });
let cleanup = () => {};
afterEach(() => cleanup());
const mount = (xp: number) => {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);
  act(() => root.render(<ProfileGrowth xp={xp} />));
  cleanup = () => { act(() => root.unmount()); container.remove(); };
  return container;
};

describe('프로필 수달 성장 정보', () => {
  it.each([
    [0, '아기수달', '꼬마수달까지 20 XP'],
    [19, '아기수달', '꼬마수달까지 1 XP'],
    [20, '꼬마수달', '탐험수달까지 80 XP'],
    [120, '탐험수달', '척척수달까지 180 XP'],
    [299, '탐험수달', '척척수달까지 1 XP'],
    [300, '척척수달', '박사수달까지 500 XP'],
    [799, '척척수달', '박사수달까지 1 XP'],
  ])('%i 경험치에 맞는 현재 등급과 실제 남은 경험치를 보여준다', (xp, name, detail) => {
    const container = mount(xp as number);
    const group = container.querySelector('[aria-label="수달 성장"]');
    expect(group?.querySelector('p')).toHaveTextContent(name as string);
    expect(group).toHaveTextContent(detail as string);
  });

  it.each([800, 9000])('최고 단계 %i에서는 존재하지 않는 다음 등급을 표시하지 않는다', xp => {
    const group = mount(xp).querySelector('[aria-label="수달 성장"]');
    expect(group).toHaveTextContent('박사수달');
    expect(group).toHaveTextContent('최고 단계에 도달했어요');
    expect(group).not.toHaveTextContent('까지');
  });

  it('불필요한 테두리 배지와 추상적인 안내 대신 두 줄 정보로 정리한다', () => {
    const group = mount(120).querySelector('[aria-label="수달 성장"]');
    expect(group).toHaveAttribute('role', 'group');
    expect(group).not.toHaveClass('border', 'rounded-full');
    expect(group?.querySelectorAll('p')).toHaveLength(2);
    expect(group?.querySelector('button')).toBeNull();
    expect(group).not.toHaveTextContent('학습 기록을 쌓고 있어요');
  });
});

describe('현재 등급 구간의 실제 성장 진행률', () => {
  it.each([[0, 0, 20, '0%'], [19, 19, 20, '95%'], [20, 0, 80, '0%'], [120, 20, 200, '10%'], [299, 199, 200, '99.5%'], [300, 0, 500, '0%'], [799, 499, 500, '99.8%']])('%iXP의 현재 등급 구간을 재설정된 기준으로 표시한다', (xp, earned, span, width) => {
    const bar = mount(xp as number).querySelector('[role="progressbar"]')!;
    expect(bar).toHaveAttribute('aria-valuemin', '0');
    expect(bar).toHaveAttribute('aria-valuenow', String(earned));
    expect(bar).toHaveAttribute('aria-valuemax', String(span));
    expect(bar.querySelector('span')).toHaveStyle({ width });
  });
  it.each([800, 9000])('최고 단계 %iXP에는 다음 단계 막대를 만들지 않는다', xp => {
    expect(mount(xp).querySelector('[role="progressbar"]')).toBeNull();
  });
});
