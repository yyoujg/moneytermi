import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import LeagueScreen from './LeagueScreen';

const state = vi.hoisted(() => ({
  guestToken: null as string | null,
  top: vi.fn(),
  mine: vi.fn(),
  guestClient: vi.fn(),
}));
const { rpc } = vi.hoisted(() => ({ rpc: (name: string) => name === 'leaderboard_top' ? state.top() : state.mine() }));
vi.mock('../context/AppContext', () => ({ useAppContext: () => ({ xp: 120, myEmoji: '' }) }));
vi.mock('../hooks/useAuth', () => ({ useAuth: () => ({ user: { nickname: '나' }, guestToken: state.guestToken }) }));
vi.mock('../lib/supabase', () => ({ supabase: { rpc }, getGuestClient: (token: string) => state.guestClient(token) }));
vi.mock('../lib/analytics', () => ({ logClick: vi.fn() }));
vi.mock('../lib/share', () => ({ shareTossLink: vi.fn() }));
vi.mock('@toss/tds-mobile', () => ({
  BottomSheet: () => null,
  Spacing: () => null,
  TextButton: ({ children, ...props }: { children: React.ReactNode }) => <button type="button" {...props}>{children}</button>,
}));
Object.defineProperty(globalThis, 'IS_REACT_ACT_ENVIRONMENT', { value: true, configurable: true });

let cleanup = () => {};
afterEach(() => cleanup());
beforeEach(() => {
  state.guestToken = null;
  state.top.mockReset().mockResolvedValue({ data: [], error: null });
  state.mine.mockReset().mockResolvedValue({ data: { rank: 3, total: 13, points: 120 }, error: null });
  state.guestClient.mockReset().mockReturnValue({ rpc });
});

const mount = async () => {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);
  await act(async () => { root.render(<LeagueScreen />); });
  cleanup = () => { act(() => root.unmount()); container.remove(); };
  return container;
};

describe('리그 화면 순위', () => {
  it('남은 기간은 순위 머리에 두고, 내 순위 카드와 승급 문구는 두지 않는다', async () => {
    const container = await mount();
    expect(container.querySelector('.league-time-left')).toHaveTextContent(/^(D-\d+|\d+시간 남음)$/);
    expect(container.querySelector('[aria-labelledby="league-my-rank"]')).toBeNull();
    expect(container).not.toHaveTextContent('리그로 올라가요');
  });

  it('10위 밖이면 내 순위를 목록 맨 아래에 붙인다', async () => {
    state.top.mockResolvedValue({ data: [{ rank: 1, nickname: '다른사람', emoji: '', points: 300, is_me: false }], error: null });
    state.mine.mockResolvedValue({ data: { rank: 13, total: 13, points: 120 }, error: null });
    const container = await mount();
    const mineRow = container.querySelector('.is-own-separate');
    expect(mineRow).toHaveTextContent('13');
    expect(mineRow).toHaveTextContent('120');
  });

  it('게스트는 인증 헤더가 있는 클라이언트로 조회하고 실패하면 다시 불러온다', async () => {
    state.guestToken = 'test-guest';
    state.mine.mockResolvedValueOnce({ data: null, error: { message: 'offline' } });
    const container = await mount();
    expect(state.guestClient).toHaveBeenCalledWith('test-guest');
    expect(container).toHaveTextContent('순위를 불러오지 못했어요');
    const retry = [...container.querySelectorAll('button')].find(button => button.textContent === '다시 시도')!;
    await act(async () => { retry.click(); });
    expect(container).not.toHaveTextContent('순위를 불러오지 못했어요');
  });
});
