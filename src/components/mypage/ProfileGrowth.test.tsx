import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, describe, expect, it } from 'vitest';
import { ProfileGrowth } from './ProfileGrowth';

Object.defineProperty(globalThis, 'IS_REACT_ACT_ENVIRONMENT', { value: true, configurable: true });
let cleanup = () => {};
afterEach(() => cleanup());
const mount = (stageId: number) => {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);
  act(() => root.render(<ProfileGrowth stageId={stageId} />));
  cleanup = () => { act(() => root.unmount()); container.remove(); };
  return container;
};

describe('프로필 등급 정보', () => {
  it.each([
    [1, '텅장', '주간 3위 안에 들면 다음 주 가계부'],
    [5, '갓생', '주간 3위 안에 들면 다음 주 정보통'],
    [9, '자산가', '주간 3위 안에 들면 다음 주 돈방석'],
  ])('%i단계는 현재 등급과 다음 등급 조건을 보여준다', (stageId, name, detail) => {
    const group = mount(stageId as number).querySelector('[aria-label="등급 성장"]');
    expect(group?.querySelector('p')).toHaveTextContent(name as string);
    expect(group).toHaveTextContent(detail as string);
  });

  it('최고 단계에서는 다음 등급을 표시하지 않는다', () => {
    const group = mount(10).querySelector('[aria-label="등급 성장"]');
    expect(group).toHaveTextContent('돈방석');
    expect(group).toHaveTextContent('최고 단계에 도달했어요');
  });

  it('누적 XP 진행 막대 없이 두 줄 정보로 정리한다', () => {
    const group = mount(2).querySelector('[aria-label="등급 성장"]');
    expect(group).toHaveAttribute('role', 'group');
    expect(group?.querySelectorAll('p')).toHaveLength(2);
    expect(group?.querySelector('[role="progressbar"]')).toBeNull();
    expect(group).not.toHaveTextContent('XP');
  });
});
