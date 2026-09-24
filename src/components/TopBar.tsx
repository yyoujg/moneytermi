import { useEffect, useState } from 'react';
import { BottomSheet } from '@toss/tds-mobile';
import { toast } from 'sonner';
import { useAppContext } from '../context/AppContext';
import { getGrowthStage } from '../constants';
import { logClick } from '../lib/analytics';
import { calcStreak } from '../lib/streak';
import { isRewardedAdEnabled, showRewardedAd } from '../lib/ads';

// 모든 화면 상단 고정 바. 왼쪽 로고, 오른쪽에 이모지 + 숫자만 나열한다.
// 포인트를 누르면 구매 시트가 열린다(광고 충전 / XP 2배 부스트).
export const TopBar = () => {
  const { points, xp, boostUntil, knownWords, attendanceDates, claimAdReward, buyBoost } = useAppContext();
  const [now, setNow] = useState(() => Date.now());
  const [shopOpen, setShopOpen] = useState(false);

  const streak = calcStreak(attendanceDates);
  const stage = getGrowthStage(xp);
  const boostLeft = boostUntil ? boostUntil - now : 0;

  // 부스트가 켜져 있는 동안만 1초 타이머. TopBar만 리렌더된다.
  useEffect(() => {
    if (!boostUntil || boostUntil <= Date.now()) return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [boostUntil]);

  const handleAd = () => {
    if (!isRewardedAdEnabled()) { toast.error('지금은 광고를 볼 수 없어요'); return; }
    logClick('rewarded_ad_start', { from: 'topbar_shop' });
    showRewardedAd((amount, unit) => {
      claimAdReward(amount, unit).then(credited => {
        if (credited) toast.success(`+${credited}P 받았어요`);
      });
    });
    setShopOpen(false);
  };

  const handleBoost = async () => {
    if (await buyBoost()) { toast.success('30분간 XP 2배! ⚡'); setShopOpen(false); }
    else toast.error('포인트가 부족해요');
  };

  return (
    <>
      <div className="shrink-0 h-12 flex items-center justify-between px-5 bg-[var(--color-card)] border-b border-[var(--color-line)]">
        <span className="text-base font-black tracking-tight text-brand-500">머니터미</span>

        <div className="flex items-center gap-3 text-sm font-bold text-[var(--color-ink-2)]">
          <span className="flex items-center gap-1">🔥{streak}</span>
          <span className="flex items-center gap-1">{stage.emoji}</span>
          <span className="flex items-center gap-1">✨{xp.toLocaleString()}</span>
          <button onClick={() => setShopOpen(true)} className="flex items-center gap-1 active:opacity-60">
            ⚡{points.toLocaleString()}
          </button>
          <span className="flex items-center gap-1">📖{knownWords.length}</span>
          {boostLeft > 0 && (
            <span className="text-xs font-bold text-brand-500">
              ×2 {Math.floor(boostLeft / 60000)}:{String(Math.floor((boostLeft % 60000) / 1000)).padStart(2, '0')}
            </span>
          )}
        </div>
      </div>

      <BottomSheet
        open={shopOpen}
        onDimmerClick={() => setShopOpen(false)}
        header={<span style={{ paddingLeft: '20px', fontWeight: 700, color: 'var(--color-ink)' }}>포인트 상점</span>}
      >
        <div className="px-5 pb-6 flex flex-col gap-2">
          <p className="text-xs text-[var(--color-ink-3)] mb-1">보유 ⚡{points.toLocaleString()}P</p>

          <button
            onClick={handleAd}
            className="w-full flex items-center justify-between rounded-chip px-4 py-4 text-sm font-bold text-brand-500 active:opacity-70"
            style={{ backgroundColor: 'var(--color-brand-soft)' }}
          >
            <span>📺 광고 보고 포인트 받기</span>
            <span className="text-2xs font-medium">무료</span>
          </button>

          <button
            onClick={handleBoost}
            disabled={points < 300 || boostLeft > 0}
            className="w-full flex items-center justify-between rounded-chip px-4 py-4 text-sm font-bold text-brand-500 active:opacity-70 disabled:opacity-40"
            style={{ backgroundColor: 'var(--color-brand-soft)' }}
          >
            <span>⚡ {boostLeft > 0 ? '부스트 사용 중' : 'XP 2배 부스트'}</span>
            <span className="text-2xs font-medium">300P · 30분</span>
          </button>

          <p className="text-2xs text-[var(--color-ink-4)] mt-1 leading-relaxed">
            포인트는 순위에 반영되지 않아요. 리그 순위는 학습으로 쌓는 XP로만 정해져요.
          </p>
        </div>
      </BottomSheet>
    </>
  );
};
