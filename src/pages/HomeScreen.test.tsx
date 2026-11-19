import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { LazyMotion, domMax } from 'motion/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import HomeScreen from './HomeScreen';
import type { Missions } from '../types';

const mocks = vi.hoisted(() => ({
  navigate: vi.fn(),
  claim: vi.fn(),
  ctx: { missions: {} as Missions, claimingMissionIds: new Set<string>(), attendanceDates: [] as string[], periodClaimed: new Set<string>() as Set<string> | null },
}));
vi.mock('../context/AppContext', () => ({ useAppContext: () => ({ ...mocks.ctx, claimReward: mocks.claim }) }));
vi.mock('../hooks/useAuth', () => ({ useAuth: () => ({ guestToken: null }) }));
vi.mock('react-router-dom', () => ({ useNavigate: () => mocks.navigate }));
vi.mock('../lib/supabase', () => ({ supabase: { rpc: async () => ({ data: { points: 75 } }) } }));
vi.mock('../lib/feedback', () => ({ feedbackClaim: vi.fn(), feedbackError: vi.fn() }));
vi.mock('../lib/analytics', () => ({ logClick: vi.fn() }));
vi.mock('../components/AlertModal', () => ({ showModal: vi.fn() }));

Object.defineProperty(globalThis, 'IS_REACT_ACT_ENVIRONMENT', { value: true, configurable: true });
let cleanup = () => {};
afterEach(() => { cleanup(); vi.clearAllMocks(); });
beforeEach(() => {
  mocks.ctx.missions = {
    ready: { id: 'ready', title: '단어 3개 배우기', target: 3, current: 3, isRewarded: false, reward: 5, sortOrder: 1 },
    active: { id: 'active', title: '퀴즈 정답 3회 맞히기', target: 3, current: 1, isRewarded: false, reward: 5, sortOrder: 2 },
    claimed: { id: 'claimed', title: '단어 1개 배우기', target: 1, current: 1, isRewarded: true, reward: 5, sortOrder: 0 },
  };
  mocks.ctx.periodClaimed = new Set();
  mocks.ctx.claimingMissionIds = new Set();
});
const mount = async () => {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);
  await act(async () => root.render(<LazyMotion features={domMax}><HomeScreen /></LazyMotion>));
  cleanup = () => { act(() => root.unmount()); container.remove(); };
  return container;
};

describe('퀘스트 미션과 큰 보상', () => {
  it('탭 전환 시 해당 목록을 보여주고 키보드 초점도 함께 이동한다', async () => {
    const container = await mount();
    const now = container.querySelector<HTMLButtonElement>('#quest-tab-now')!;
    const rewards = container.querySelector<HTMLButtonElement>('#quest-tab-rewards')!;
    const screen = container.querySelector<HTMLElement>('.quest-screen')!;
    screen.scrollTop = 200;
    expect(container.querySelector('#quest-panel-rewards')).not.toBeVisible();
    act(() => now.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true })));
    expect(rewards).toHaveAttribute('aria-selected', 'true');
    expect(rewards).toHaveFocus();
    expect(screen.scrollTop).toBe(0);
    expect(container.querySelector('#quest-panel-now')).not.toBeVisible();
    expect(container.querySelector('#quest-panel-rewards')).toBeVisible();
    expect(container.querySelector('[data-mission="w-xp"] [role="progressbar"]')).toHaveAttribute('aria-valuenow', '75');
    expect(container.querySelector('[data-mission="w-attend"] .quest-reward-amount')).toHaveTextContent('+20XP');
    expect(container.querySelector('[data-mission="w-xp"] .quest-reward-multiplier')).toHaveTextContent('4배');
    expect(container.querySelector('[data-period="month"] .quest-reward-amount')).toHaveTextContent('+50XP');
    expect(container.querySelector('[data-period="month"] .quest-reward-multiplier')).toHaveTextContent('10배');
    expect(container.querySelector('.quest-reward-unavailable')).toBeNull();
    act(() => now.click());
    expect(container.querySelector('#quest-panel-now')).toBeVisible();
  });

  it('도전은 학습 화면으로 이동하고 받기는 서버가 돌려준 XP로 축하한다', async () => {
    mocks.claim.mockResolvedValue({ xpGained: 7 });
    const container = await mount();
    act(() => container.querySelector<HTMLButtonElement>('[aria-label="퀴즈 정답 3회 맞히기 도전"]')!.click());
    expect(mocks.navigate).toHaveBeenCalledWith('/course');
    expect(mocks.claim).not.toHaveBeenCalled();
    await act(async () => container.querySelector<HTMLButtonElement>('[data-state="ready"]')!.click());
    expect(mocks.claim).toHaveBeenCalledWith('ready');
    expect(container.querySelector('[role="dialog"]')).toHaveTextContent('+7 XP');
    act(() => container.querySelector<HTMLButtonElement>('.celebration-confirm')!.click());
    expect(container.querySelector('[role="dialog"]')).toBeNull();
  });

  it('적립 중·완료 상태에서는 수령을 다시 요청하지 않는다', async () => {
    mocks.ctx.claimingMissionIds.add('ready');
    const container = await mount();
    const pending = container.querySelector<HTMLButtonElement>('[data-state="pending"]')!;
    expect(pending).toBeDisabled();
    act(() => pending.click());
    expect(mocks.claim).not.toHaveBeenCalled();
    expect(container.querySelector('.quest-mission-row:last-child')).toHaveTextContent('완료');
    expect(container.querySelector('.quest-mission-row:last-child button')).toBeNull();
  });

  it('보상 조회가 안 되면 기준액과 확인 불가 안내를 보여주고 자동 적립을 약속하지 않는다', async () => {
    mocks.ctx.missions = {};
    mocks.ctx.periodClaimed = null;
    const container = await mount();
    expect(container).toHaveTextContent('새 미션 준비 중! 먼저 공부해 볼까?');
    act(() => container.querySelector<HTMLButtonElement>('#quest-tab-rewards')!.click());
    expect(container.querySelectorAll('.quest-reward-card')).toHaveLength(3);
    expect(container.querySelector('.quest-reward-amount')).toHaveAttribute('aria-label', '보상 기준 20 XP');
    expect(container.querySelector('.quest-reward-unavailable')).toHaveTextContent('현재 지급 상태는 확인할 수 없어요');
    expect(container).not.toHaveTextContent('달성하면 자동 적립');
  });
});
