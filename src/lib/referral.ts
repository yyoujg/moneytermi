import { contactsViral } from '@apps-in-toss/web-framework';

// 콘솔 "미니앱 > 공유 리워드" 메뉴에서 모듈 생성 후 발급되는 moduleId.
// 발급 전에는 undefined로 두면 기능 자체가 숨겨진다.
const MODULE_ID = import.meta.env.VITE_SHARE_REWARD_MODULE_ID as string | undefined;

export const isReferralEnabled = () => Boolean(MODULE_ID);

export const startReferralInvite = (
  onReward: (amount: number, unit: string) => void,
): (() => void) | undefined => {
  if (!MODULE_ID) return undefined;
  try {
    return contactsViral({
      options: { moduleId: MODULE_ID },
      onEvent: (event) => {
        if (event.type === 'sendViral') {
          onReward(event.data.rewardAmount, event.data.rewardUnit);
        }
      },
      onError: () => { /* 미지원/실패 무시 */ },
    });
  } catch {
    return undefined;
  }
};
