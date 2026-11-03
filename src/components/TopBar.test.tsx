import { act } from 'react';
import type { ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { TopBar } from './TopBar';

const state = vi.hoisted(() => ({
  ctx: {} as Record<string, unknown>,
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
vi.mock('../lib/feedback', () => ({ feedbackClaim: vi.fn() }));

Object.defineProperty(globalThis, 'IS_REACT_ACT_ENVIRONMENT', { value: true, configurable: true });

let cleanup = () => {};
afterEach(() => cleanup());

const baseContext = (overrides: Record<string, unknown> = {}) => {
  state.closeShop = vi.fn();
  state.showModal = vi.fn();
  state.ads = {
    enabled: false,
    preload: vi.fn(() => Promise.resolve(false)),
    show: vi.fn(),
    finish: undefined,
  };
  state.ctx = {
    xp: 0,
    energy: 24,
    energyMax: 25,
    nextEnergyAt: Date.now() + 40 * 60 * 1000,
    knownWords: [],
    attendanceDates: [],
    claimEnergyAd: vi.fn(),
    shopOpen: true,
    shopReason: 'energy',
    openShop: vi.fn(),
    closeShop: state.closeShop,
    ...overrides,
  };
};

const Location = () => <output data-location>{useLocation().pathname}</output>;
const mount = async (pathname = '/course') => {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);
  await act(async () => {
    root.render(
      <MemoryRouter initialEntries={[pathname]}>
        <TopBar />
        <Location />
      </MemoryRouter>,
    );
  });
  cleanup = () => { act(() => root.unmount()); container.remove(); };
  return { container };
};

beforeEach(() => {
  baseContext();
});

describe('자체 뒤로가기 없음', () => {
  // 토스 내비게이션 바와 중복되면 검수에서 반려된다.
  it.each(['/word-card', '/quiz', '/lesson-check', '/review', '/course', '/home', '/my', '/league'])('%s에서 홈 이동 링크를 표시하지 않는다', async pathname => {
    const { container } = await mount(pathname);
    expect(container.querySelector('[aria-label="홈으로 돌아가기"]')).toBeNull();
  });
});

describe('TopBar energy shop', () => {
  it.each(['/course', '/course/topics'])('hides the inline status bar on %s while keeping the shop mounted', async pathname => {
    const { container } = await mount(pathname);

    expect(container.querySelector('[data-topbar]')).toBeNull();
    expect(container.querySelector('[role="dialog"]')).toBeInTheDocument();
  });

  it('에너지 시트에는 광고 충전만 있고 코인 완충·부스트는 보이지 않는다', async () => {
    const { container } = await mount();

    expect(container.querySelector('[role="dialog"]')).toHaveTextContent('광고 보고 에너지 받기');
    expect(container.textContent).not.toMatch(/코인|부스트|에너지 모두 충전/);
  });

  it('상단바에 코인 버튼을 두지 않는다', async () => {
    const { container } = await mount('/settings');

    expect(container.querySelector('[data-topbar]')).toBeInTheDocument();
    expect(container.querySelector('[aria-label="코인 상점"]')).toBeNull();
    expect(container.querySelector('[aria-label="에너지"]')).toBeInTheDocument();
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
