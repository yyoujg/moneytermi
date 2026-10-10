import { beforeEach, describe, expect, it, vi } from 'vitest';

type AdEvent = { type: string; data?: { unitAmount: number; unitType: string } };
type LoadParams = { onEvent: (event: AdEvent) => void; onError: (error: unknown) => void };
type ShowParams = { onEvent: (event: AdEvent) => void; onError: (error: unknown) => void };
type SupportedMock = ReturnType<typeof vi.fn> & { isSupported?: ReturnType<typeof vi.fn> };

const sdk = vi.hoisted(() => {
  const loadFullScreenAd = vi.fn();
  const showFullScreenAd = vi.fn();
  return {
    loadFullScreenAd,
    showFullScreenAd,
    loadParams: [] as LoadParams[],
    showParams: [] as ShowParams[],
    loadCleanup: vi.fn(),
    showCleanup: vi.fn(),
  };
});

vi.mock('@apps-in-toss/web-framework', () => ({
  loadFullScreenAd: sdk.loadFullScreenAd,
  showFullScreenAd: sdk.showFullScreenAd,
}));

const importAds = async () => {
  vi.resetModules();
  vi.stubEnv('VITE_REWARDED_AD_GROUP_ID', 'ait.test.rewarded');
  const mod = await import('./ads');
  mod.__resetRewardedAdForTest();
  return mod;
};

beforeEach(() => {
  sdk.loadParams = [];
  sdk.showParams = [];
  sdk.loadCleanup = vi.fn();
  sdk.showCleanup = vi.fn();
  sdk.loadFullScreenAd.mockReset();
  sdk.showFullScreenAd.mockReset();
  (sdk.loadFullScreenAd as SupportedMock).isSupported = vi.fn(() => true);
  (sdk.showFullScreenAd as SupportedMock).isSupported = vi.fn(() => true);
  sdk.loadFullScreenAd.mockImplementation((params: LoadParams) => {
    sdk.loadParams.push(params);
    return sdk.loadCleanup;
  });
  sdk.showFullScreenAd.mockImplementation((params: ShowParams) => {
    sdk.showParams.push(params);
    return sdk.showCleanup;
  });
});

describe('rewarded ads', () => {
  it('광고가 로드되기 전에는 표시하지 않고 로드 완료 후에만 표시한다', async () => {
    const { preloadRewardedAd, showRewardedAd } = await importAds();
    const reward = vi.fn();

    const loading = preloadRewardedAd();

    expect(showRewardedAd(reward)).toBe(false);
    expect(sdk.showFullScreenAd).not.toHaveBeenCalled();

    sdk.loadParams[0].onEvent({ type: 'loaded' });
    await expect(loading).resolves.toBe(true);

    expect(showRewardedAd(reward)).toBe(true);
    expect(sdk.showFullScreenAd).toHaveBeenCalledTimes(1);
  });

  it('userEarnedReward가 중복으로 와도 리워드는 한 번만 지급한다', async () => {
    const { preloadRewardedAd, showRewardedAd } = await importAds();
    const reward = vi.fn();
    const finish = vi.fn();

    const loading = preloadRewardedAd();
    sdk.loadParams[0].onEvent({ type: 'loaded' });
    await loading;

    expect(showRewardedAd(reward, { onFinish: finish })).toBe(true);
    sdk.showParams[0].onEvent({ type: 'userEarnedReward', data: { unitAmount: 30, unitType: 'point' } });
    sdk.showParams[0].onEvent({ type: 'userEarnedReward', data: { unitAmount: 30, unitType: 'point' } });
    sdk.showParams[0].onEvent({ type: 'dismissed' });

    expect(reward).toHaveBeenCalledTimes(1);
    expect(reward).toHaveBeenCalledWith(30, 'point');
    expect(finish).toHaveBeenCalledWith('dismissed');
    expect(sdk.showCleanup).toHaveBeenCalledTimes(1);
  });

  it('취소(dismissed)만 발생하면 리워드를 지급하지 않고 다음 광고를 다시 준비한다', async () => {
    const { preloadRewardedAd, showRewardedAd } = await importAds();
    const reward = vi.fn();

    const loading = preloadRewardedAd();
    sdk.loadParams[0].onEvent({ type: 'loaded' });
    await loading;

    expect(showRewardedAd(reward)).toBe(true);
    sdk.showParams[0].onEvent({ type: 'dismissed' });

    expect(reward).not.toHaveBeenCalled();
    expect(sdk.loadFullScreenAd).toHaveBeenCalledTimes(2);
  });

  it('표시 실패(failedToShow)는 리워드를 지급하지 않고 실패로 종료한다', async () => {
    const { preloadRewardedAd, showRewardedAd } = await importAds();
    const reward = vi.fn();
    const finish = vi.fn();

    const loading = preloadRewardedAd();
    sdk.loadParams[0].onEvent({ type: 'loaded' });
    await loading;

    expect(showRewardedAd(reward, { onFinish: finish })).toBe(true);
    sdk.showParams[0].onEvent({ type: 'failedToShow' });

    expect(reward).not.toHaveBeenCalled();
    expect(finish).toHaveBeenCalledWith('failed');
  });

  it('반복 클릭으로 표시 중인 광고를 다시 열지 않는다', async () => {
    const { preloadRewardedAd, showRewardedAd } = await importAds();

    const loading = preloadRewardedAd();
    sdk.loadParams[0].onEvent({ type: 'loaded' });
    await loading;

    expect(showRewardedAd(vi.fn())).toBe(true);
    expect(showRewardedAd(vi.fn())).toBe(false);
    expect(sdk.showFullScreenAd).toHaveBeenCalledTimes(1);
  });

  it('백그라운드 복귀 뒤 dismissed가 와도 정리 후 다음 광고를 준비한다', async () => {
    const { preloadRewardedAd, showRewardedAd } = await importAds();

    const loading = preloadRewardedAd();
    sdk.loadParams[0].onEvent({ type: 'loaded' });
    await loading;

    expect(showRewardedAd(vi.fn())).toBe(true);
    sdk.showParams[0].onEvent({ type: 'dismissed' });

    expect(sdk.showCleanup).toHaveBeenCalledTimes(1);
    expect(sdk.loadFullScreenAd).toHaveBeenCalledTimes(2);
  });
});
