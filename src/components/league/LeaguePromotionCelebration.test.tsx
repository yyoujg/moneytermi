import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { LeaguePromotionCelebration } from './LeaguePromotionCelebration';

const state = vi.hoisted(() => ({
  ctx: {} as Record<string, unknown>,
  storage: new Map<string, string>(),
  getItem: vi.fn(),
  setItem: vi.fn(),
  feedbackTierUp: vi.fn(),
  logClick: vi.fn(),
}));

vi.mock('../../context/AppContext', () => ({ useAppContext: () => state.ctx }));
vi.mock('../../lib/storage', () => ({
  Storage: {
    getItem: (key: string) => state.getItem(key),
    setItem: (key: string, value: string) => state.setItem(key, value),
  },
}));
vi.mock('../../lib/feedback', () => ({ feedbackTierUp: () => state.feedbackTierUp() }));
vi.mock('../../lib/analytics', () => ({ logClick: (...args: unknown[]) => state.logClick(...args) }));

Object.defineProperty(globalThis, 'IS_REACT_ACT_ENVIRONMENT', { value: true, configurable: true });

let cleanup = () => {};
afterEach(() => cleanup());

const baseContext = (xp = 0) => {
  state.ctx = { hydrated: true, xp };
};

const flush = async () => {
  await act(async () => {
    await Promise.resolve();
    await new Promise(resolve => setTimeout(resolve, 0));
  });
};

const mount = async () => {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);
  const render = async () => {
    await act(async () => {
      root.render(<LeaguePromotionCelebration />);
    });
    await flush();
  };
  await render();
  cleanup = () => { act(() => root.unmount()); container.remove(); };
  return { container, root, render };
};

beforeEach(() => {
  state.storage.clear();
  state.getItem.mockImplementation(async (key: string) => state.storage.get(key) ?? null);
  state.setItem.mockImplementation(async (key: string, value: string) => {
    state.storage.set(key, value);
  });
  state.feedbackTierUp = vi.fn();
  state.logClick = vi.fn();
  baseContext();
});

describe('LeaguePromotionCelebration', () => {
  it('처음 로드한 현재 리그는 기록만 하고 모달을 띄우지 않는다', async () => {
    baseContext(20);
    const { container } = await mount();

    expect(container.querySelector('[role="dialog"]')).not.toBeInTheDocument();
    expect(state.storage.get('league_promotion_seen_stage_v1')).toBe('2');
    expect(state.feedbackTierUp).not.toHaveBeenCalled();
  });

  it('저장된 리그보다 높은 단계가 되면 승급 모달을 띄운다', async () => {
    state.storage.set('league_promotion_seen_stage_v1', '1');
    baseContext(20);
    const { container } = await mount();

    expect(container.querySelector('[role="dialog"]')?.textContent).toContain('꼬마수달 리그에 올라갔어요');
    expect(container.querySelector('[role="dialog"]')?.textContent).toContain('20XP');
    expect(state.feedbackTierUp).toHaveBeenCalledTimes(1);
    expect(state.logClick).toHaveBeenCalledWith('league_promotion_modal_view', { from: 1, to: 2, xp: 20 });
  });

  it('이름이 바뀌어도 저장된 단계가 같으면 승급을 다시 알리지 않는다', async () => {
    state.storage.set('league_promotion_seen_stage_v1', '3');
    baseContext(120);
    const { container } = await mount();

    expect(container.querySelector('[role="dialog"]')).not.toBeInTheDocument();
    expect(state.storage.get('league_promotion_seen_stage_v1')).toBe('3');
    expect(state.feedbackTierUp).not.toHaveBeenCalled();
  });

  it('같은 화면 안에서 XP가 승급 기준을 넘으면 모달을 띄운다', async () => {
    baseContext(19);
    const { container, render } = await mount();

    expect(container.querySelector('[role="dialog"]')).not.toBeInTheDocument();

    baseContext(20);
    await render();

    expect(container.querySelector('[role="dialog"]')?.textContent).toContain('꼬마수달 리그에 올라갔어요');
    expect(state.feedbackTierUp).toHaveBeenCalledTimes(1);
  });
});
