import { loadFullScreenAd, showFullScreenAd } from '@apps-in-toss/web-framework';

// 콘솔 "인앱 광고" 메뉴에서 등록한 리워드 광고 그룹의 adGroupId.
// 발급 전에는 undefined로 두면 기능 자체가 숨겨진다.
const AD_GROUP_ID = import.meta.env.VITE_REWARDED_AD_GROUP_ID as string | undefined;

export const isRewardedAdEnabled = () => Boolean(AD_GROUP_ID);

type RewardedAdEvent = {
  type: string;
  data?: { unitAmount: number; unitType: string };
};
type RewardedAdFinish = 'dismissed' | 'failed' | 'error';
type RewardedAdCallbacks = {
  onShow?: () => void;
  onFinish?: (result: RewardedAdFinish) => void;
};

let loaded = false;
let loading: Promise<boolean> | null = null;
let showing = false;
let cleanupLoad: (() => void) | null = null;

const canLoadRewardedAd = () => {
  try {
    return !loadFullScreenAd.isSupported || loadFullScreenAd.isSupported();
  } catch {
    return false;
  }
};

const canShowRewardedAd = () => {
  try {
    return !showFullScreenAd.isSupported || showFullScreenAd.isSupported();
  } catch {
    return false;
  }
};

export const preloadRewardedAd = (): Promise<boolean> => {
  if (!AD_GROUP_ID || !canLoadRewardedAd()) return Promise.resolve(false);
  if (loaded) return Promise.resolve(true);
  if (loading) return loading;

  loading = new Promise(resolve => {
    let settled = false;
    const settle = (ready: boolean) => {
      if (settled) return;
      settled = true;
      if (!ready) {
        cleanupLoad?.();
        cleanupLoad = null;
      }
      loaded = ready;
      loading = null;
      resolve(ready);
    };

    try {
      cleanupLoad = loadFullScreenAd({
        options: { adGroupId: AD_GROUP_ID },
        onEvent: (event: RewardedAdEvent) => {
          if (event.type === 'loaded') settle(true);
          else if (event.type === 'failedToLoad') settle(false);
        },
        onError: () => settle(false),
      });
    } catch {
      settle(false);
    }
  });
  return loading;
};

export const showRewardedAd = (
  onReward: (amount: number, unit: string) => void,
  callbacks: RewardedAdCallbacks = {},
): boolean => {
  if (!AD_GROUP_ID || !loaded || showing || !canShowRewardedAd()) {
    void preloadRewardedAd();
    return false;
  }

  try {
    cleanupLoad?.();
    cleanupLoad = null;
    loaded = false;
    showing = true;
    let rewarded = false;
    let finished = false;
    const cleanupShowRef: { current?: () => void } = {};

    const finish = (result: RewardedAdFinish) => {
      if (finished) return;
      finished = true;
      cleanupShowRef.current?.();
      showing = false;
      callbacks.onFinish?.(result);
      void preloadRewardedAd();
    };

    const cleanupShow = showFullScreenAd({
      options: { adGroupId: AD_GROUP_ID },
      onEvent: (event: RewardedAdEvent) => {
        if (event.type === 'show') callbacks.onShow?.();
        if (event.type === 'userEarnedReward' && !rewarded && event.data) {
          rewarded = true;
          onReward(event.data.unitAmount, event.data.unitType);
        } else if (event.type === 'dismissed') {
          finish('dismissed');
        } else if (event.type === 'failedToShow') {
          finish('failed');
        }
      },
      onError: () => finish('error'),
    });
    cleanupShowRef.current = cleanupShow;
    if (finished) cleanupShow();
    return true;
  } catch {
    showing = false;
    callbacks.onFinish?.('error');
    void preloadRewardedAd();
    return false;
  }
};

export const __resetRewardedAdForTest = () => {
  cleanupLoad?.();
  loaded = false;
  loading = null;
  showing = false;
  cleanupLoad = null;
};
