import { useAppContext } from '../../context/AppContext';
import { logClick } from '../../lib/analytics';
import { isRewardedAdEnabled } from '../../lib/ads';
import { ENERGY_AD_REWARD } from '../../constants';
import { ActionButton } from '../ui/ActionButton';

// 학습을 마친 직후, 에너지가 덜 찼을 때만 광고 충전 시트로 안내한다. 광고 로드·표시·보상은 TopBar의 에너지 시트가 맡는다.
export const EnergyAdPrompt = ({ from }: { from: string }) => {
  const { energy, energyMax, openShop } = useAppContext();
  if (!isRewardedAdEnabled() || energy >= energyMax) return null;
  return (
    <ActionButton tone="soft" fullWidth onClick={() => { logClick('energy_ad_prompt_click', { from, energy }); openShop('energy'); }}>
      광고 보고 에너지 +{ENERGY_AD_REWARD}
    </ActionButton>
  );
};
