import { grantPromotionReward } from '@apps-in-toss/web-framework';

// 콘솔 "혜택 탭" 프로모션 등록 후 발급되는 코드. 검토 전엔 TEST_{promotionCode}로
// 검증한 뒤, 실제 코드로 교체한다. 발급 전에는 undefined로 두면 기능이 숨겨진다.
const PROMOTION_CODE = import.meta.env.VITE_PROMOTION_CODE as string | undefined;
const PROMOTION_AMOUNT = 30;

export const isPromotionEnabled = () => Boolean(PROMOTION_CODE);

// 첫 학습 카드 완료 시 1회 호출. 성공하면 지급된 amount를, 아니면 null을 반환한다.
// 실제 points 적립은 별도로 claim_promotion_reward RPC(서버 상한 적용)가 담당한다.
export const claimPromotion = async (): Promise<number | null> => {
  if (!PROMOTION_CODE) return null;
  try {
    const result = await grantPromotionReward({
      params: { promotionCode: PROMOTION_CODE, amount: PROMOTION_AMOUNT },
    });
    if (result && typeof result === 'object' && 'key' in result) return PROMOTION_AMOUNT;
    return null;
  } catch {
    return null;
  }
};
