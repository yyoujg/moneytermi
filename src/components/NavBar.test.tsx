import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import NavBar from './NavBar';

const state = vi.hoisted(() => ({
  ctx: {} as Record<string, unknown>,
  storage: new Map<string, string>(),
  getItem: vi.fn(),
  setItem: vi.fn(),
}));

vi.mock('../context/AppContext', () => ({ useAppContext: () => state.ctx }));
vi.mock('../hooks/useSafeAreaInsets', () => ({ useSafeAreaInsets: () => ({ bottom: 0 }) }));
vi.mock('../lib/storage', () => ({
  Storage: {
    getItem: (key: string) => state.getItem(key),
    setItem: (key: string, value: string) => state.setItem(key, value),
  },
}));

Object.defineProperty(globalThis, 'IS_REACT_ACT_ENVIRONMENT', { value: true, configurable: true });

const SEEN_LEAGUE_WEEK_KEY = 'moneytermi_nav_seen_league_week_v1';
const SEEN_BADGE_COUNT_KEY = 'moneytermi_nav_seen_badge_count_v1';

let cleanup = () => {};
afterEach(() => cleanup());

const baseContext = (overrides: Record<string, unknown> = {}) => {
  state.ctx = {
    hydrated: true,
    missions: {},
    xp: 0,
    knownWords: [],
    attendanceDates: [],
    ...overrides,
  };
};

const flush = async () => {
  await act(async () => {
    await Promise.resolve();
    await new Promise(resolve => setTimeout(resolve, 0));
  });
};

const mount = async (entry = '/course') => {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);
  await act(async () => {
    root.render(
      <MemoryRouter initialEntries={[entry]}>
        <NavBar />
      </MemoryRouter>,
    );
  });
  await flush();
  cleanup = () => { act(() => root.unmount()); container.remove(); };
  return container;
};

const navButton = (container: HTMLElement, label: string) =>
  [...container.querySelectorAll('button')].find(el => el.textContent?.includes(label)) as HTMLButtonElement | undefined;

beforeEach(() => {
  state.storage.clear();
  state.getItem.mockImplementation(async (key: string) => state.storage.get(key) ?? null);
  state.setItem.mockImplementation(async (key: string, value: string) => {
    state.storage.set(key, value);
  });
  baseContext();
});

describe('NavBar new badges', () => {
  it('받을 수 있는 퀘스트 보상이 있으면 퀘스트 탭에 NEW를 표시한다', async () => {
    baseContext({
      missions: {
        m1: { id: 'm1', title: '퀴즈 풀기', reward: 10, current: 1, target: 1, isRewarded: false, sortOrder: 10 },
      },
    });

    const container = await mount();

    expect(container.querySelector('button[aria-label="퀘스트, 새 내용 있음"]')).toBeInTheDocument();
    expect(navButton(container, '퀘스트')?.textContent).toContain('NEW');
  });

  it('이번 주 리그를 아직 확인하지 않았으면 NEW를 표시하고 방문하면 저장한다', async () => {
    state.storage.set(SEEN_LEAGUE_WEEK_KEY, 'old-week');
    baseContext({ xp: 100 });
    const container = await mount();

    const leagueButton = container.querySelector('button[aria-label="리그, 새 내용 있음"]') as HTMLButtonElement | null;
    expect(leagueButton).toBeInTheDocument();

    await act(async () => {
      leagueButton!.click();
    });
    await flush();

    expect(state.setItem).toHaveBeenCalledWith(SEEN_LEAGUE_WEEK_KEY, expect.any(String));
    expect(container.querySelector('button[aria-label="리그, 새 내용 있음"]')).not.toBeInTheDocument();
  });

  it('새로 얻은 배지가 있으면 마이 탭에 NEW를 표시하고 방문하면 저장한다', async () => {
    state.storage.set(SEEN_BADGE_COUNT_KEY, '0');
    baseContext({
      knownWords: [{ id: 1, word: '복리' }],
    });
    const container = await mount();

    const myButton = container.querySelector('button[aria-label="마이, 새 내용 있음"]') as HTMLButtonElement | null;
    expect(myButton).toBeInTheDocument();

    await act(async () => {
      myButton!.click();
    });
    await flush();

    expect(state.setItem).toHaveBeenCalledWith(SEEN_BADGE_COUNT_KEY, '1');
    expect(container.querySelector('button[aria-label="마이, 새 내용 있음"]')).not.toBeInTheDocument();
  });
});
