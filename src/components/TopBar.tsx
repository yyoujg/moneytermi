import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import type React from 'react';
import { BottomSheet } from '@toss/tds-mobile';
import { StreakIcon, XpIcon, WordsIcon, EnergyIcon } from './StatIcons';
import { showModal } from './AlertModal';
import { useAppContext } from '../context/AppContext';
import { logClick } from '../lib/analytics';
import { calcStreak } from '../lib/streak';
import { isRewardedAdEnabled, preloadRewardedAd, showRewardedAd } from '../lib/ads';
import { feedbackClaim } from '../lib/feedback';
import { RollingNumber } from './RollingNumber';
import { EnergyShopContent } from './EnergyShopContent';

// 모든 화면 상단 고정 바. 아이콘 + 숫자만 나열한다(티어는 마이페이지에만).
// 연속 학습·XP·배운 단어는 누르면 아래에 짧은 설명 말풍선, 에너지는 충전 시트(광고 충전)가 열린다.
type Tip = 'streak' | 'xp' | 'words';
const TIP_W = 256;

export const TopBar = () => {
  const { xp, energy, energyMax, nextEnergyAt, knownWords, attendanceDates, claimEnergyAd, shopOpen, openShop, closeShop } = useAppContext();
  const [now, setNow] = useState(() => Date.now());
  const [tip, setTip] = useState<Tip | null>(null);
  const rewardedAdLockRef = useRef(false);
  const [rewardedAdReady, setRewardedAdReady] = useState(false);
  const [rewardedAdPreparing, setRewardedAdPreparing] = useState(false);
  const [rewardedAdPending, setRewardedAdPending] = useState(false);
  // 학습 중에는 각 화면의 레슨명과 진행 단계에 집중한다. 에너지 시트는 계속 마운트한다.
  const pathname = useLocation().pathname;
  const hideBar = ['/', '/course', '/course/topics', '/home', '/league', '/league/rules', '/my', '/welcome', '/word-card', '/quiz', '/lesson-check', '/lesson-intro', '/review'].includes(pathname);
  const compactBar = pathname === '/course';
  const [tipPos, setTipPos] = useState({ left: 16, tail: 0 });   // 말풍선 위치: 아이콘 아래 가운데, 화면 밖으로 안 나가게 16px 안쪽에서 멈춘다

  const prepareRewardedAd = useCallback(() => {
    let active = true;
    const setAdLoadState = (ready: boolean, preparing: boolean) => {
      if (!active) return;
      setRewardedAdReady(ready);
      setRewardedAdPreparing(preparing);
    };
    if (!isRewardedAdEnabled()) {
      Promise.resolve().then(() => setAdLoadState(false, false));
      return () => { active = false; };
    }
    Promise.resolve().then(() => {
      if (active) setRewardedAdPreparing(true);
    });
    preloadRewardedAd()
      .then(ready => setAdLoadState(ready, false))
      .catch(() => setAdLoadState(false, false));
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!shopOpen) return;
    return prepareRewardedAd();
  }, [shopOpen, prepareRewardedAd]);

  const rewardedAdAvailable = isRewardedAdEnabled();

  // 설명 말풍선은 3초 뒤 저절로 닫힌다. 같은 아이콘을 다시 누르면 바로 닫힌다
  useEffect(() => {
    if (!tip) return;
    const t = setTimeout(() => setTip(null), 3000);
    return () => clearTimeout(t);
  }, [tip]);
  const toggleTip = (t: Tip, e: React.MouseEvent<HTMLButtonElement>) => {
    const bar = e.currentTarget.closest('[data-topbar]')!.getBoundingClientRect();
    const btn = e.currentTarget.getBoundingClientRect();
    const center = btn.left + btn.width / 2 - bar.left;
    const left = Math.min(Math.max(center - TIP_W / 2, 16), bar.width - TIP_W - 16);
    setTipPos({ left, tail: center - left });
    logClick('topbar_tip', { tip: t });
    setTip(cur => (cur === t ? null : t));
  };

  const streak = calcStreak(attendanceDates);
  const energyLeft = nextEnergyAt ? nextEnergyAt - now : 0;

  // 에너지 타이머가 보일 때만 1초 타이머. TopBar만 리렌더된다.
  useEffect(() => {
    if (!nextEnergyAt) return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [nextEnergyAt]);

  const startRewardedAd = (onReward: (amount: number, unit: string) => void) => {
    if (rewardedAdLockRef.current || rewardedAdPending) return false;
    if (!isRewardedAdEnabled()) { showModal('지금은 광고를 볼 수 없어요', 'error'); return false; }
    if (!rewardedAdReady) {
      showModal('광고를 준비 중이에요. 잠시 후 다시 시도해 주세요', 'error');
      prepareRewardedAd();
      return false;
    }

    rewardedAdLockRef.current = true;
    setRewardedAdPending(true);
    setRewardedAdReady(false);
    let rewarded = false;
    const accepted = showRewardedAd((amount, unit) => {
      if (rewarded) return;
      rewarded = true;
      onReward(amount, unit);
    }, {
      onShow: closeShop,
      onFinish: (result) => {
        if (result === 'dismissed') closeShop();
        rewardedAdLockRef.current = false;
        setRewardedAdPending(false);
        if (result !== 'dismissed') showModal('광고를 열지 못했어요. 잠시 후 다시 시도해 주세요', 'error');
        prepareRewardedAd();
      },
    });
    if (!accepted) {
      rewardedAdLockRef.current = false;
      setRewardedAdPending(false);
      setRewardedAdReady(false);
      showModal('광고를 준비 중이에요. 잠시 후 다시 시도해 주세요', 'error');
      prepareRewardedAd();
      return false;
    }
    return true;
  };

  const handleEnergyAd = () => {
    if (energy >= energyMax) { showModal('에너지가 이미 가득 찼어요'); return; }
    if (!startRewardedAd(() => {
      claimEnergyAd().then(credited => {
        if (credited) { feedbackClaim(); showModal(`에너지 +${credited}`); }
      });
    })) return;
    logClick('rewarded_ad_start', { from: 'energy_shop' });
  };

  return (
    <>
      {/* 앱 이름·홈 이동은 토스 내비게이션 바가 맡는다. 자체 로고 헤더를 두면 검수에서 '자체 헤더 중복'으로 반려된다(2026-09-29) */}
      {!hideBar && <div data-topbar className="app-soft-header relative z-40 shrink-0 h-12 flex items-center px-4 min-[390px]:px-5">

        <div className="ml-auto flex max-w-full items-center justify-end gap-2 overflow-x-auto text-xs font-bold whitespace-nowrap text-[var(--color-ink)] min-[390px]:gap-3 min-[390px]:text-sm [&::-webkit-scrollbar]:hidden">
          <button onClick={e => toggleTip('streak', e)} aria-label="연속 학습" className="flex min-h-11 min-w-11 items-center justify-center gap-1 active:opacity-60">
            <StreakIcon size={20} /><span><RollingNumber value={streak} /></span>
          </button>
          {!compactBar && <button onClick={e => toggleTip('xp', e)} aria-label="경험치" className="flex min-h-11 min-w-11 items-center justify-center gap-1 active:opacity-60">
            <XpIcon size={20} /><span><RollingNumber value={xp} /></span>
          </button>}
          <button onClick={e => toggleTip('words', e)} aria-label="익힌 용어" className="flex min-h-11 min-w-11 items-center justify-center gap-1 active:opacity-60">
            <WordsIcon size={20} /><span><RollingNumber value={knownWords.length} /></span>
          </button>
          <button onClick={() => { setTip(null); openShop('energy'); }} aria-label="에너지" className="flex min-h-11 min-w-11 items-center justify-center gap-1 active:opacity-60">
            <EnergyIcon size={24} /><span><RollingNumber value={energy} /></span>
          </button>
        </div>

        {tip && (
          <div role="status" onClick={() => setTip(null)} style={{ left: tipPos.left, width: TIP_W }} className="absolute top-full mt-2 rounded-chip bg-[var(--color-tooltip)] px-4 py-3 anim-pop-in">
            <span className="absolute -top-1 w-2.5 h-2.5 rotate-45 bg-[var(--color-tooltip)]" style={{ left: tipPos.tail - 5 }} />
            <p className="relative text-xs font-bold text-[var(--color-tooltip-ink)]">
              {tip === 'streak' ? `연속 학습 ${streak}일` : tip === 'xp' ? `경험치(XP) ${xp.toLocaleString()}` : `익힌 용어 ${knownWords.length}개`}
            </p>
            <p className="relative mt-1 text-2xs text-[var(--color-tooltip-ink)] leading-relaxed break-keep">
              {tip === 'streak' ? '오늘까지 하루도 빠지지 않고 학습한 날 수예요. 하루라도 쉬면 처음부터 다시 세요.'
                : tip === 'xp' ? '학습과 퀴즈로 쌓여요. 리그 순위와 성장 단계는 XP로 정해져요.'
                : '학습을 마친 용어 수예요. 같은 용어를 다시 배워도 늘지 않아요.'}
            </p>
          </div>
        )}
      </div>}

      <BottomSheet
        open={shopOpen}
        className="original-modal"
        onDimmerClick={rewardedAdPending ? () => {} : closeShop}
        header={<span className="sheet-title">에너지</span>}
      >
        <EnergyShopContent
          energy={energy}
          energyMax={energyMax}
          energyLeft={energyLeft}
          rewardedAdAvailable={rewardedAdAvailable}
          rewardedAdReady={rewardedAdReady}
          rewardedAdPreparing={rewardedAdPreparing}
          rewardedAdPending={rewardedAdPending}
          onEnergyAd={handleEnergyAd}
        />
      </BottomSheet>
    </>
  );
};
