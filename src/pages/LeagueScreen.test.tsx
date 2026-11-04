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

describe('리그로 옮긴 이번 주 내 순위', () => {
  it('내 순위와 참여 인원, 이번 주 XP를 보여준다', async () => {
    const container = await mount();
    const card = container.querySelector('[aria-labelledby="league-my-rank"]');
    expect(card).toHaveTextContent('3위');
    expect(card).toHaveTextContent('13명 중 · 120XP');
    expect(card).toHaveTextContent(/리그 종료까지 \d+(일|시간) 남았어요/);
  });

  it('아직 XP가 없으면 순위 대신 참여 방법을 알려준다', async () => {
    state.mine.mockResolvedValue({ data: { rank: null, total: 13, points: 0 }, error: null });
    const container = await mount();
    expect(container.querySelector('[aria-labelledby="league-my-rank"]')).toHaveTextContent('XP를 모으면 순위에 올라요');
  });

  it('게스트는 인증 헤더가 있는 클라이언트로 조회하고 실패하면 다시 불러온다', async () => {
    state.guestToken = 'test-guest';
    state.mine.mockResolvedValueOnce({ data: null, error: { message: 'offline' } });
    const container = await mount();
    expect(state.guestClient).toHaveBeenCalledWith('test-guest');
    const retry = [...container.querySelectorAll('button')].find(button => button.textContent === '순위 다시 불러오기')!;
    await act(async () => { retry.click(); });
    expect(container.querySelector('[aria-labelledby="league-my-rank"]')).toHaveTextContent('3위');
    expect(container).not.toHaveTextContent('순위 다시 불러오기');
  });
});
