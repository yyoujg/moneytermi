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
  ads: {
    enabled: false,
    preload: vi.fn(),
    show: vi.fn(),
    finish: undefined as undefined | ((result: 'dismissed' | 'failed' | 'error') => void),
  },
}));

vi.mock('@toss/tds-mobile', () => ({
  BottomSheet: ({ open, header, children, onDimmerClick }: { open: boolean; header: ReactNode; children: ReactNode; onDimmerClick: () => void }) => (
    open ? <div role="dialog">{header}{children}<button type="button" onClick={onDimmerClick}>닫기</button></div> : null
  ),
}));
vi.mock('../context/AppContext', () => ({ useAppContext: () => state.ctx }));
vi.mock('../components/AlertModal', () => ({ showModal: (...args: unknown[]) => state.showModal(...args) }));
vi.mock('../lib/analytics', () => ({ logClick: vi.fn() }));
vi.mock('../lib/ads', () => ({
  isRewardedAdEnabled: vi.fn(() => state.ads.enabled),
  preloadRewardedAd: vi.fn(() => state.ads.preload()),
  showRewardedAd: vi.fn((...args: unknown[]) => state.ads.show(...args)),
}));
vi.mock('../lib/feedback', () => ({ feedbackClaim: vi.fn(), feedbackBoost: vi.fn() }));

Object.defineProperty(globalThis, 'IS_REACT_ACT_ENVIRONMENT', { value: true, configurable: true });

let cleanup = () => {};
afterEach(() => cleanup());

const baseContext = (overrides: Record<string, unknown> = {}) => {
  state.buyEnergyRefill = vi.fn(() => Promise.resolve('ok'));
  state.buyBoost = vi.fn(() => Promise.resolve('fail'));
  state.closeShop = vi.fn();
  state.showModal = vi.fn();
  state.ads = {
    enabled: false,
    preload: vi.fn(() => Promise.resolve(false)),
    show: vi.fn(),
    finish: undefined,
  };
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
  it('hides the inline status bar on course while keeping the shop mounted', async () => {
    const { container } = await mount();

    expect(container.querySelector('[data-topbar]')).toBeNull();
    expect(container.querySelector('[role="dialog"]')).toBeInTheDocument();
  });

  it('포인트가 부족하면 상점 내부 안내를 보여주고 충전 RPC를 호출하지 않는다', async () => {
    const { container, refillButton } = await mount();
    const button = refillButton();

    expect(container.textContent).toContain('조개 490개 부족');
    expect(button.disabled).toBe(true);

    await act(async () => { button.click(); });

    expect(state.buyEnergyRefill).not.toHaveBeenCalled();
    expect(state.showModal).not.toHaveBeenCalledWith('조개가 부족해요', 'error');
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

  it('광고가 준비되기 전에는 에너지 광고 버튼을 비활성화하고 표시 요청을 보내지 않는다', async () => {
    state.ads.enabled = true;
    state.ads.preload = vi.fn(() => new Promise(() => {}));
    const { container } = await mount();
    const adButton = [...container.querySelectorAll('button')].find(el => el.textContent?.includes('광고 보고 에너지 받기')) as HTMLButtonElement | undefined;

    expect(adButton).toBeDefined();
    expect(adButton!.disabled).toBe(true);
    expect(container.textContent).toContain('광고를 미리 준비하고 있어요');

    await act(async () => { adButton!.click(); });

    expect(state.ads.show).not.toHaveBeenCalled();
  });

  it('에너지 광고 버튼 연속 클릭은 한 번만 광고를 열고 보상은 dismiss 뒤에도 한 번만 반영한다', async () => {
    const claimEnergyAd = vi.fn(() => Promise.resolve(3));
    baseContext({ claimEnergyAd, energy: 20 });
    state.ads.enabled = true;
    state.ads.preload = vi.fn(() => Promise.resolve(true));
    state.ads.show = vi.fn((_onReward: unknown, callbacks: { onShow?: () => void; onFinish?: (result: 'dismissed' | 'failed' | 'error') => void }) => {
      state.ads.finish = callbacks.onFinish;
      callbacks.onShow?.();
      return true;
    });
    const { container } = await mount();
    await act(async () => { await Promise.resolve(); });
    const adButton = [...container.querySelectorAll('button')].find(el => el.textContent?.includes('광고 보고 에너지 받기')) as HTMLButtonElement;

    act(() => {
      adButton.click();
      adButton.click();
    });

    expect(state.ads.show).toHaveBeenCalledTimes(1);

    await act(async () => {
      const onReward = state.ads.show.mock.calls[0][0] as () => void;
      onReward();
      onReward();
      state.ads.finish?.('dismissed');
    });

    expect(claimEnergyAd).toHaveBeenCalledTimes(1);
  });

  it('광고 표시 실패 시 상점을 닫지 않고 실패 안내를 보여준다', async () => {
    baseContext({ energy: 20 });
    state.ads.enabled = true;
    state.ads.preload = vi.fn(() => Promise.resolve(true));
    state.ads.show = vi.fn((_onReward: unknown, callbacks: { onFinish?: (result: 'dismissed' | 'failed' | 'error') => void }) => {
      callbacks.onFinish?.('failed');
      return true;
    });
    const { container } = await mount();
    await act(async () => { await Promise.resolve(); });
    const adButton = [...container.querySelectorAll('button')].find(el => el.textContent?.includes('광고 보고 에너지 받기')) as HTMLButtonElement;

    await act(async () => { adButton.click(); });

    expect(state.closeShop).not.toHaveBeenCalled();
    expect(state.showModal).toHaveBeenCalledWith('광고를 열지 못했어요. 잠시 후 다시 시도해 주세요', 'error');
  });
});

describe('부스트 구매 결과 구분', () => {
  const button = (container: HTMLElement) => [...container.querySelectorAll('button')].find(el => el.textContent?.includes('XP 2배 부스트'))!;
  it('잔액이 충분한 통신 실패는 잔액 부족이나 미차감으로 단정하지 않는다', async () => {
    baseContext({ points: 1000, shopReason: null });
    const { container } = await mount();
    await act(async () => { button(container).click(); });
    expect(state.showModal).toHaveBeenCalledWith(expect.stringContaining('구매 결과를 확인하지 못했어요'), 'error');
    expect(state.showModal.mock.calls.flat().join(' ')).not.toMatch(/부족|차감되지/);
    expect(state.closeShop).not.toHaveBeenCalled();
  });
  it('서버가 명시한 잔액 부족은 별도로 안내한다', async () => {
    baseContext({ points: 1000, shopReason: null, buyBoost: vi.fn().mockResolvedValue('points') });
    const { container } = await mount();
    await act(async () => { button(container).click(); });
    expect(state.showModal).toHaveBeenCalledWith(expect.stringContaining('잔액이 바뀌어 조개가 부족해요'), 'error');
  });
  it('연속 클릭은 한 번만 요청하고 구매 확인 중임을 표시한다', async () => {
    let resolve!: (value: string) => void;
    const purchase = vi.fn(() => new Promise<string>(done => { resolve = done; }));
    baseContext({ points: 1000, shopReason: null, buyBoost: purchase });
    const { container } = await mount();
    act(() => { button(container).click(); button(container).click(); });
    expect(purchase).toHaveBeenCalledOnce();
    expect(button(container)).toBeDisabled();
    expect(button(container)).toHaveTextContent('구매 확인 중');
    await act(async () => { resolve('ok'); });
    expect(state.closeShop).toHaveBeenCalledOnce();
    expect(state.showModal).toHaveBeenCalledWith('30분간 XP 2배!');
  });
  it('이미 진행 중인 요청을 실패로 안내하지 않는다', async () => {
    baseContext({ points: 1000, shopReason: null, buyBoost: vi.fn().mockResolvedValue('pending') });
    const { container } = await mount();
    await act(async () => { button(container).click(); });
    expect(state.showModal).not.toHaveBeenCalled();
  });
  it('요청 예외가 나도 대기 상태를 해제하고 결과 미확인으로 안내한다', async () => {
    baseContext({ points: 1000, shopReason: null, buyBoost: vi.fn().mockRejectedValue(new Error('통신 오류')) });
    const { container } = await mount();
    await act(async () => { button(container).click(); });
    expect(state.showModal).toHaveBeenCalledWith(expect.stringContaining('구매 결과를 확인하지 못했어요'), 'error');
    expect(button(container)).not.toBeDisabled();
  });
});
