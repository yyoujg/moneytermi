import { ChevronRight } from './ui/ControlIcons';
import { ENERGY_AD_REWARD } from '../constants';

type Props = {
  energy: number;
  energyMax: number;
  energyLeft: number;
  rewardedAdAvailable: boolean;
  rewardedAdReady: boolean;
  rewardedAdPreparing: boolean;
  rewardedAdPending: boolean;
  onEnergyAd: () => void;
};

const formatEnergyLeft = (ms: number) => {
  const total = Math.max(1, Math.ceil(ms / 60000));
  const h = Math.floor(total / 60);
  const m = total % 60;
  return h > 0 ? `${h}시간 ${m}분` : `${m}분`;
};

export const EnergyShopContent = ({
  energy,
  energyMax,
  energyLeft,
  rewardedAdAvailable,
  rewardedAdReady,
  rewardedAdPreparing,
  rewardedAdPending,
  onEnergyAd,
}: Props) => {
  const full = energy >= energyMax;
  const energyPercent = energyMax > 0 ? Math.min(100, Math.max(0, (energy / energyMax) * 100)) : 0;
  const adDisabled = rewardedAdAvailable && (!rewardedAdReady || rewardedAdPending);
  const adHint = rewardedAdPending ? '여는 중' : rewardedAdPreparing ? '준비 중' : rewardedAdReady ? '보기' : '잠시 후';

  return (
    <div className="energy-shop-content">
      <section className="energy-shop-summary" aria-label="현재 에너지">
        <div className="energy-shop-summary-heading">
          <img src="/icons/stat/icon-energy.svg" alt="" width={24} height={24} data-stat-icon="energy" />
          <div className="energy-shop-balance"><p><strong>{energy}</strong><span>/ {energyMax}</span></p></div>
          {!full && <span className="energy-shop-state">{formatEnergyLeft(energyLeft)} 후 가득</span>}
        </div>
        <div role="progressbar" aria-label="에너지 충전 진행률" aria-valuemin={0} aria-valuemax={energyMax} aria-valuenow={energy} className="energy-shop-progress" data-full={full}>
          <span style={{ width: `${energyPercent}%` }} />
        </div>
      </section>

      <section className="energy-shop-section" aria-label="에너지 충전 방법">
        <button type="button" onClick={onEnergyAd} disabled={full || adDisabled} className="energy-shop-option" data-energy-option="ad">
          <img src="/icons/stat/icon-energy-ad.svg" alt="" width={24} height={24} data-stat-icon="energy-ad" />
          <span className="energy-shop-option-body"><strong>광고 보고 +{ENERGY_AD_REWARD}</strong></span>
          <span className="energy-shop-option-state">{full ? '충전 완료!' : adHint}{!(full || adDisabled) && <ChevronRight size={16} />}</span>
        </button>
      </section>

      <p className="energy-shop-info">문제를 틀리거나 학습 결과를 넘길 때 1씩 써. 매일 자정에 가득 충전돼.</p>
    </div>
  );
};
