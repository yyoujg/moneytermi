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

const baseContext = (leagueStage: number | null = 1, xp = 0) => {
  state.ctx = { hydrated: true, leagueStage, xp };
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
    baseContext(2);
    const { container } = await mount();

    expect(container.querySelector('[role="dialog"]')).not.toBeInTheDocument();
    expect(state.storage.get('league_promotion_seen_stage_v1')).toBe('2');
    expect(state.feedbackTierUp).not.toHaveBeenCalled();
  });

  it('서버 등급을 읽기 전에는 아무것도 기록하지 않는다', async () => {
    baseContext(null);
    const { container } = await mount();

    expect(container.querySelector('[role="dialog"]')).not.toBeInTheDocument();
    expect(state.storage.has('league_promotion_seen_stage_v1')).toBe(false);
  });

  it('저장된 리그보다 높은 단계가 되면 승급 모달을 띄운다', async () => {
    state.storage.set('league_promotion_seen_stage_v1', '1');
    baseContext(2, 340);
    const { container } = await mount();

    expect(container.querySelector('[role="dialog"]')?.textContent).toContain('기록가 리그에 올라갔어요');
    expect(container.querySelector('[role="dialog"]')?.textContent).toContain('3위 안');
    expect(state.feedbackTierUp).toHaveBeenCalledTimes(1);
    expect(state.logClick).toHaveBeenCalledWith('league_promotion_modal_view', { from: 1, to: 2, xp: 340 });
  });

  it('강등되면 모달 없이 낮아진 단계만 기록한다', async () => {
    state.storage.set('league_promotion_seen_stage_v1', '3');
    baseContext(2);
    const { container } = await mount();

    expect(container.querySelector('[role="dialog"]')).not.toBeInTheDocument();
    expect(state.storage.get('league_promotion_seen_stage_v1')).toBe('2');
    expect(state.feedbackTierUp).not.toHaveBeenCalled();
  });

  it('서버 등급이 늦게 도착해도 기본값을 승급으로 착각하지 않는다', async () => {
    state.storage.set('league_promotion_seen_stage_v1', '3');
    baseContext(null);
    const { container, render } = await mount();

    baseContext(3);
    await render();

    expect(container.querySelector('[role="dialog"]')).not.toBeInTheDocument();
    expect(state.feedbackTierUp).not.toHaveBeenCalled();
  });
});
