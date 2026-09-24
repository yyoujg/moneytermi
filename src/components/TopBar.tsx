import { useEffect, useState } from 'react';
import { BookOpen, Flame, Play, Sparkles, Zap } from 'lucide-react';
import { toast } from 'sonner';
import { useAppContext } from '../context/AppContext';
import { getGrowthStage } from '../constants';
import { logClick } from '../lib/analytics';
import { calcStreak } from '../lib/streak';
import { isRewardedAdEnabled, showRewardedAd } from '../lib/ads';

// 모든 화면 상단 고정 바. 왼쪽 로고, 오른쪽 연속일·티어·포인트·학습단어.
// 포인트를 누르면 광고를 보고 충전한다.
export const TopBar = () => {
  const { points, xp, boostUntil, knownWords, attendanceDates, claimAdReward } = useAppContext();
  const [now, setNow] = useState(() => Date.now());
  const streak = calcStreak(attendanceDates);
  const boostLeft = boostUntil ? boostUntil - now : 0;

  // 부스트가 켜져 있는 동안만 1초 타이머. TopBar만 리렌더된다.
  useEffect(() => {
    if (!boostUntil || boostUntil <= Date.now()) return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [boostUntil]);
  const stage = getGrowthStage(xp);

  const handleAd = () => {
    if (!isRewardedAdEnabled()) return;
    logClick('rewarded_ad_start', { from: 'topbar_points' });
    showRewardedAd((amount, unit) => {
      claimAdReward(amount, unit).then(credited => {
        if (credited) toast.success(`+${credited}P 받았어요`);
      });
    });
  };

  return (
    <div className="shrink-0 h-12 flex items-center justify-between px-5 bg-[var(--color-card)] border-b border-[var(--color-line)]">
      <span className="text-base font-black tracking-tight text-brand-500">머니터미</span>

      <div className="flex items-center gap-3 text-2xs font-medium text-[var(--color-ink-3)]">
        <span className="flex items-center gap-1">
          <Flame size={12} className="text-brand-500 fill-current" />{streak}일
        </span>
        <span className="flex items-center gap-1">{stage.emoji}{stage.name}</span>
        <button onClick={handleAd} className="flex items-center gap-1">
          <Zap size={12} className="text-brand-500 fill-current" />
          {points.toLocaleString()}P
          {isRewardedAdEnabled() && <Play size={10} className="text-brand-500" />}
        </button>
        <span className="flex items-center gap-1">
          <Sparkles size={12} className="text-brand-500" />{xp.toLocaleString()}XP
        </span>
        <span className="flex items-center gap-1">
          <BookOpen size={12} />{knownWords.length}개
        </span>
        {boostLeft > 0 && (
          <span className="flex items-center gap-0.5 font-bold text-brand-500">
            ⚡2배 {Math.floor(boostLeft / 60000)}:{String(Math.floor((boostLeft % 60000) / 1000)).padStart(2, '0')}
          </span>
        )}
      </div>
    </div>
  );
};
