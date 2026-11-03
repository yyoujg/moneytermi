import { Tv } from './ui/OtterIcons';
import { ChevronRight } from './ui/ControlIcons';
import { ENERGY_AD_REWARD } from '../constants';
import { EnergyIcon } from './StatIcons';

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
  const adHint = rewardedAdPending ? '여는 중' : rewardedAdPreparing ? '준비 중' : rewardedAdReady ? `시청 후 +${ENERGY_AD_REWARD}` : '잠시 후';

  return (
    <div className="energy-shop-content">
      <section className="energy-shop-summary" aria-label="현재 에너지">
        <div className="energy-shop-summary-heading">
          <EnergyIcon size={24} />
          <div className="energy-shop-balance"><h2>학습 에너지</h2><p><strong>{energy}</strong><span>/ {energyMax}</span></p></div>
          <span className="energy-shop-state" data-full={full}>{full ? '충전 완료' : '충전 중'}</span>
        </div>
        <div role="progressbar" aria-label="에너지 충전 진행률" aria-valuemin={0} aria-valuemax={energyMax} aria-valuenow={energy} className="energy-shop-progress" data-full={full}>
          <span style={{ width: `${energyPercent}%` }} />
        </div>
        <p className="energy-shop-timer">{full ? '가득 차면 자동 충전은 잠시 멈춰요' : `다음 충전: ${formatEnergyLeft(energyLeft)} 후`}</p>
      </section>

      <section className="energy-shop-section" aria-label="에너지 충전 방법">
        <h2>충전 방법</h2>
        <button type="button" onClick={onEnergyAd} disabled={full || adDisabled} className="energy-shop-option" data-energy-option="ad">
          <Tv size={24} />
          <span className="energy-shop-option-body"><strong>광고 보고 에너지 받기</strong><span>시청 보상 에너지 +{ENERGY_AD_REWARD}</span></span>
          <span className="energy-shop-option-state">{full ? '가득 찼어요' : adHint}{!(full || adDisabled) && <ChevronRight size={16} />}</span>
        </button>
        {rewardedAdAvailable && !rewardedAdReady && <p role="status" className="energy-shop-caption">광고를 미리 준비하고 있어요. 버튼이 활성화되면 시청 후 에너지를 받을 수 있어요.</p>}
      </section>

      <section className="energy-shop-info" aria-label="에너지 이용 안내">
        <h2>이용 안내</h2>
        <p>번개 아이콘은 학습에 쓰는 에너지를 뜻해요.</p>
        <p>새 학습과 코스 퀴즈를 처음 시작할 때 에너지 1을 써요. 이어하기, 다시 보기, 복습은 무료예요.</p>
      </section>
    </div>
  );
};
