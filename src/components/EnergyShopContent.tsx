import { Tv } from './ui/OtterIcons';
import { ChevronRight } from './ui/ControlIcons';
import { ENERGY_AD_REWARD, ENERGY_REFILL_COST, XP_BONUS_POINTS, XP_BONUS_STEP } from '../constants';
import { EnergyIcon, PointIcon, XpIcon } from './StatIcons';

export type EnergyRefillNotice = {
  tone: 'points' | 'network' | 'info';
  text: string;
} | null;

type Props = {
  points: number;
  energy: number;
  energyMax: number;
  energyLeft: number;
  boostLeft: number;
  refillPending: boolean;
  refillNotice: EnergyRefillNotice;
  rewardedAdAvailable: boolean;
  rewardedAdReady: boolean;
  rewardedAdPreparing: boolean;
  rewardedAdPending: boolean;
  onEnergyAd: () => void;
  onEnergyRefill: () => void;
  onBoost: () => void;
};

const formatEnergyLeft = (ms: number) => {
  const total = Math.max(1, Math.ceil(ms / 60000));
  const h = Math.floor(total / 60);
  const m = total % 60;
  return h > 0 ? `${h}시간 ${m}분` : `${m}분`;
};

const getEnergyRefillState = (points: number, energy: number, energyMax: number, refillPending = false) => {
  const full = energy >= energyMax;
  const shortfall = Math.max(0, ENERGY_REFILL_COST - points);
  return {
    full,
    shortfall,
    canRefill: !full && shortfall === 0 && !refillPending,
    buttonHint: full ? '가득 찼어요' : refillPending ? '충전 중' : shortfall > 0 ? `조개 ${shortfall.toLocaleString()}개 부족` : `조개 ${ENERGY_REFILL_COST.toLocaleString()}개`,
  };
};

export const EnergyShopContent = ({
  points,
  energy,
  energyMax,
  energyLeft,
  boostLeft,
  refillPending,
  refillNotice,
  rewardedAdAvailable,
  rewardedAdReady,
  rewardedAdPreparing,
  rewardedAdPending,
  onEnergyAd,
  onEnergyRefill,
  onBoost,
}: Props) => {
  const refill = getEnergyRefillState(points, energy, energyMax, refillPending);
  const energyPercent = energyMax > 0 ? Math.min(100, Math.max(0, (energy / energyMax) * 100)) : 0;
  const adDisabled = rewardedAdAvailable && (!rewardedAdReady || rewardedAdPending);
  const adHint = rewardedAdPending ? '여는 중' : rewardedAdPreparing ? '준비 중' : rewardedAdReady ? `시청 후 +${ENERGY_AD_REWARD}` : '잠시 후';
  const boostDisabled = points < 300 || boostLeft > 0;

  return (
    <div className="energy-shop-content">
      <section className="energy-shop-summary" aria-label="현재 에너지">
        <div className="energy-shop-summary-heading">
          <EnergyIcon size={48} />
          <div className="energy-shop-balance"><h2>학습 에너지</h2><p><strong>{energy}</strong><span>/ {energyMax}</span></p></div>
          <span className="energy-shop-state" data-full={refill.full}>{refill.full ? '충전 완료' : '충전 중'}</span>
        </div>
        <div role="progressbar" aria-label="에너지 충전 진행률" aria-valuemin={0} aria-valuemax={energyMax} aria-valuenow={energy} className="energy-shop-progress" data-full={refill.full}>
          <span style={{ width: `${energyPercent}%` }} />
        </div>
        <p className="energy-shop-timer">{refill.full ? '가득 차면 자동 충전은 잠시 멈춰요' : `다음 충전: ${formatEnergyLeft(energyLeft)} 후`}</p>
      </section>

      <div className="energy-shop-wallet" role="status" aria-live="polite"><PointIcon size={24} /><span>보유 조개</span><strong>{points.toLocaleString()}<span>개</span></strong></div>

      <section className="energy-shop-section" aria-label="에너지 충전 방법">
        <h2>충전 방법</h2>
        <button type="button" onClick={onEnergyAd} disabled={refill.full || adDisabled} className="energy-shop-option" data-energy-option="ad">
          <Tv size={32} />
          <span className="energy-shop-option-body"><strong>광고 보고 에너지 받기</strong><span>시청 보상 에너지 +{ENERGY_AD_REWARD}</span></span>
          <span className="energy-shop-option-state">{refill.full ? '가득 찼어요' : adHint}{!(refill.full || adDisabled) && <ChevronRight size={14} />}</span>
        </button>
        {rewardedAdAvailable && !rewardedAdReady && <p role="status" className="energy-shop-caption">광고를 미리 준비하고 있어요. 버튼이 활성화되면 시청 후 에너지를 받을 수 있어요.</p>}

        <button type="button" onClick={onEnergyRefill} disabled={!refill.canRefill} aria-describedby="energy-refill-status" className="energy-shop-option" data-energy-option="refill">
          <EnergyIcon size={32} />
          <span className="energy-shop-option-body"><strong>에너지 모두 충전</strong><span>조개 {ENERGY_REFILL_COST.toLocaleString()}개</span></span>
          <span className="energy-shop-option-state">{refill.buttonHint}{refill.canRefill && <ChevronRight size={14} />}</span>
        </button>
        <p id="energy-refill-status" role="status" aria-live="polite" className="energy-shop-caption">{refill.full
          ? '에너지가 가득해서 지금은 충전할 필요가 없어요.'
          : refill.shortfall > 0
            ? `조개 ${refill.shortfall.toLocaleString()}개 부족해요. 조개를 더 모으면 구매 버튼이 열려요.`
            : `조개 ${ENERGY_REFILL_COST.toLocaleString()}개로 지금 바로 완충할 수 있어요.`}</p>
      </section>

      {refillNotice && <div role={refillNotice.tone === 'network' ? 'alert' : 'status'} className="energy-shop-notice" data-tone={refillNotice.tone}>{refillNotice.text}</div>}

      <section className="energy-shop-section" aria-label="학습 부스트">
        <h2>학습 부스트</h2>
        <button type="button" onClick={onBoost} disabled={boostDisabled} className="energy-shop-option" data-energy-option="boost">
          <XpIcon size={32} />
          <span className="energy-shop-option-body"><strong>{boostLeft > 0 ? '부스트 사용 중' : 'XP 2배 부스트'}</strong><span>조개 300개 · 30분</span></span>
          <span className="energy-shop-option-state">{boostLeft > 0
            ? `${Math.floor(boostLeft / 60000)}:${String(Math.floor((boostLeft % 60000) / 1000)).padStart(2, '0')} 남음`
            : points < 300 ? `조개 ${(300 - points).toLocaleString()}개 더 필요` : '사용하기'}{!boostDisabled && <ChevronRight size={14} />}</span>
        </button>
      </section>

      <section className="energy-shop-info" aria-label="에너지와 조개 이용 안내">
        <h2>이용 안내</h2>
        <p>번개 아이콘은 학습에 쓰는 에너지를 뜻해요.</p>
        <p>새 학습과 코스 퀴즈를 처음 시작할 때 에너지 1을 써요. 이어하기, 다시 보기, 복습은 무료예요. 조개는 선택한 에너지 충전과 부스트에만 써요.</p>
        <h3>학습으로 조개 모으기</h3>
        <p>퀴즈 정답 조개 +10~20개 · 미션 보상 +10~50개 · XP {XP_BONUS_STEP}마다 조개 +{XP_BONUS_POINTS}개</p>
      </section>
    </div>
  );
};
