import { loadFullScreenAd, showFullScreenAd } from '@apps-in-toss/web-framework';

// 콘솔 "인앱 광고" 메뉴에서 등록한 리워드 광고 그룹의 adGroupId.
// 발급 전에는 undefined로 두면 기능 자체가 숨겨진다.
const AD_GROUP_ID = import.meta.env.VITE_REWARDED_AD_GROUP_ID as string | undefined;

export const isRewardedAdEnabled = () => Boolean(AD_GROUP_ID);

export const showRewardedAd = (
  onReward: (amount: number, unit: string) => void,
): void => {
  if (!AD_GROUP_ID) return;

  try {
    if (typeof loadFullScreenAd.isSupported === 'function' && !loadFullScreenAd.isSupported()) return;

    const cleanupLoad = loadFullScreenAd({
      options: { adGroupId: AD_GROUP_ID },
      onEvent: (event) => {
        if (event.type !== 'loaded') return;
        cleanupLoad();
        try {
          if (typeof showFullScreenAd.isSupported === 'function' && !showFullScreenAd.isSupported()) return;
          const cleanupShow = showFullScreenAd({
            options: { adGroupId: AD_GROUP_ID },
            onEvent: (showEvent) => {
              if (showEvent.type === 'userEarnedReward') {
                onReward(showEvent.data.unitAmount, showEvent.data.unitType);
              } else if (showEvent.type === 'dismissed' || showEvent.type === 'failedToShow') {
                cleanupShow();
              }
            },
            onError: () => cleanupShow(),
          });
        } catch { /* 미지원/실패 무시 */ }
      },
      onError: () => cleanupLoad(),
    });
  } catch { /* 미지원/실패 무시 */ }
};
