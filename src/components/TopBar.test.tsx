import { act } from 'react';
import type { ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { TopBar } from './TopBar';

const state = vi.hoisted(() => ({
  ctx: {} as Record<string, unknown>,
  buyEnergyRefill: vi.fn(),
  buyBoost: vi.fn(),
  closeShop: vi.fn(),
  showModal: vi.fn(),
}));

vi.mock('@toss/tds-mobile', () => ({
  BottomSheet: ({ open, header, children, onDimmerClick }: { open: boolean; header: ReactNode; children: ReactNode; onDimmerClick: () => void }) => (
    open ? <div role="dialog">{header}{children}<button type="button" onClick={onDimmerClick}>닫기</button></div> : null
  ),
}));
vi.mock('../context/AppContext', () => ({ useAppContext: () => state.ctx }));
vi.mock('../components/AlertModal', () => ({ showModal: (...args: unknown[]) => state.showModal(...args) }));
vi.mock('../lib/analytics', () => ({ logClick: vi.fn() }));
vi.mock('../lib/ads', () => ({ isRewardedAdEnabled: vi.fn(() => false), showRewardedAd: vi.fn() }));
vi.mock('../lib/feedback', () => ({ feedbackClaim: vi.fn(), feedbackBoost: vi.fn() }));

Object.defineProperty(globalThis, 'IS_REACT_ACT_ENVIRONMENT', { value: true, configurable: true });

let cleanup = () => {};
afterEach(() => cleanup());

const baseContext = (overrides: Record<string, unknown> = {}) => {
  state.buyEnergyRefill = vi.fn(() => Promise.resolve('ok'));
  state.buyBoost = vi.fn(() => Promise.resolve('fail'));
  state.closeShop = vi.fn();
  state.showModal = vi.fn();
  state.ctx = {
    points: 110,
    xp: 0,
    boostUntil: null,
    energy: 24,
    energyMax: 25,
    nextEnergyAt: Date.now() + 40 * 60 * 1000,
    knownWords: [],
    attendanceDates: [],
    claimAdReward: vi.fn(),
    claimEnergyAd: vi.fn(),
    buyEnergyRefill: state.buyEnergyRefill,
    buyBoost: state.buyBoost,
    shopOpen: true,
    shopReason: 'energy',
    openShop: vi.fn(),
    closeShop: state.closeShop,
    ...overrides,
  };
};

const mount = async () => {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);
  await act(async () => {
    root.render(
      <MemoryRouter initialEntries={['/course']}>
        <TopBar />
      </MemoryRouter>,
    );
  });
  cleanup = () => { act(() => root.unmount()); container.remove(); };
  const refillButton = () => {
    const button = [...container.querySelectorAll('button')].find(el => el.textContent?.includes('에너지 모두 충전')) as HTMLButtonElement | undefined;
    expect(button, '에너지 모두 충전 버튼').toBeDefined();
    return button!;
  };
  return { container, refillButton };
};

beforeEach(() => {
  baseContext();
});

describe('TopBar energy shop', () => {
  it('포인트가 부족하면 상점 내부 안내를 보여주고 충전 RPC를 호출하지 않는다', async () => {
    const { container, refillButton } = await mount();
    const button = refillButton();

    expect(container.textContent).toContain('490P 부족');
    expect(button.disabled).toBe(true);

    await act(async () => { button.click(); });

    expect(state.buyEnergyRefill).not.toHaveBeenCalled();
    expect(state.showModal).not.toHaveBeenCalledWith('포인트가 부족해요', 'error');
  });

  it('연속 클릭해도 에너지 충전 요청은 한 번만 보낸다', async () => {
    let resolveRefill!: (value: string) => void;
    baseContext({
      points: 1000,
      buyEnergyRefill: vi.fn(() => new Promise(resolve => { resolveRefill = resolve; })),
    });
    const { refillButton } = await mount();
    const button = refillButton();

    expect(button.disabled).toBe(false);
    act(() => {
      button.click();
      button.click();
    });

    expect(state.ctx.buyEnergyRefill).toHaveBeenCalledTimes(1);
    await act(async () => { resolveRefill('ok'); });
  });

  it('네트워크 실패와 잔액 부족을 다른 안내로 구분한다', async () => {
    baseContext({
      points: 1000,
      buyEnergyRefill: vi.fn(() => Promise.resolve('fail')),
    });
    const { container, refillButton } = await mount();

    await act(async () => { refillButton().click(); });

    expect(container.textContent).toContain('네트워크가 불안정해 충전하지 못했어요');
    expect(container.textContent).not.toContain('잔액이 바뀌어 충전할 수 없어요');
  });
});
