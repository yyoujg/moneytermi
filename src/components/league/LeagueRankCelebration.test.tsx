import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { weekStart } from '../../lib/league';
import { LeagueRankCelebration } from './LeagueRankCelebration';
import { leagueRankSeenKey } from './leagueRankStorage';

const state = vi.hoisted(() => ({
  ctx: {} as Record<string, unknown>,
  auth: {} as Record<string, unknown>,
  storage: new Map<string, string>(),
  getItem: vi.fn(),
  setItem: vi.fn(),
  rpc: vi.fn(),
  feedbackCelebrate: vi.fn(),
  logClick: vi.fn(),
}));

vi.mock('../../context/AppContext', () => ({ useAppContext: () => state.ctx }));
vi.mock('../../hooks/useAuth', () => ({ useAuth: () => state.auth }));
vi.mock('../../lib/storage', () => ({
  Storage: {
    getItem: (key: string) => state.getItem(key),
    setItem: (key: string, value: string) => state.setItem(key, value),
  },
}));
vi.mock('../../lib/supabase', () => ({
  supabase: { rpc: (...args: unknown[]) => state.rpc(...args) },
  getGuestClient: () => ({ rpc: (...args: unknown[]) => state.rpc(...args) }),
}));
vi.mock('../../lib/feedback', () => ({ feedbackCelebrate: () => state.feedbackCelebrate() }));
vi.mock('../../lib/analytics', () => ({ logClick: (...args: unknown[]) => state.logClick(...args) }));

Object.defineProperty(globalThis, 'IS_REACT_ACT_ENVIRONMENT', { value: true, configurable: true });

let cleanup = () => {};
afterEach(() => cleanup());

const key = () => leagueRankSeenKey('profile-1', weekStart());

const baseContext = (xp = 0) => {
  state.ctx = { hydrated: true, xp, myEmoji: '🍊' };
  state.auth = { user: { id: 'profile-1', nickname: '나' }, guestToken: 'guest-token' };
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
      root.render(<LeagueRankCelebration />);
    });
    await flush();
  };
  await render();
  cleanup = () => { act(() => root.unmount()); container.remove(); };
  return { container, root, render };
};

beforeEach(() => {
  state.storage.clear();
  state.getItem.mockImplementation(async (storageKey: string) => state.storage.get(storageKey) ?? null);
  state.setItem.mockImplementation(async (storageKey: string, value: string) => {
    state.storage.set(storageKey, value);
  });
  state.rpc.mockResolvedValue({ data: { rank: 5, total: 10, points: 40 }, error: null });
  state.feedbackCelebrate = vi.fn();
  state.logClick = vi.fn();
  baseContext();
});

describe('LeagueRankCelebration', () => {
  it('처음 확인한 순위는 기록만 하고 모달을 띄우지 않는다', async () => {
    const { container } = await mount();

    expect(container.querySelector('[role="dialog"]')).not.toBeInTheDocument();
    expect(state.storage.get(key())).toBe('5');
    expect(state.feedbackCelebrate).not.toHaveBeenCalled();
  });

  it('저장된 순위보다 올라가면 순위 상승 모달을 띄운다', async () => {
    state.storage.set(key(), '5');
    state.rpc.mockResolvedValue({ data: { rank: 3, total: 10, points: 70 }, error: null });
    const { container } = await mount();

    expect(container.querySelector('[role="dialog"]')?.textContent).toContain('순위가 올랐어요');
    expect(container.querySelector('[role="dialog"]')?.textContent).toContain('5위');
    expect(container.querySelector('[role="dialog"]')?.textContent).toContain('3위');
    expect(container.querySelector('[role="dialog"]')?.textContent).toContain('70XP');
    expect(state.feedbackCelebrate).toHaveBeenCalledTimes(1);
    expect(state.logClick).toHaveBeenCalledWith('league_rank_up_modal_view', { from: 5, to: 3, total: 10, weekly_xp: 70 });
  });

  it('순위가 내려간 경우에는 새 순위만 저장하고 모달을 띄우지 않는다', async () => {
    state.storage.set(key(), '3');
    state.rpc.mockResolvedValue({ data: { rank: 5, total: 10, points: 70 }, error: null });
    const { container } = await mount();

    expect(container.querySelector('[role="dialog"]')).not.toBeInTheDocument();
    expect(state.storage.get(key())).toBe('5');
    expect(state.feedbackCelebrate).not.toHaveBeenCalled();
  });
});
