import { useEffect, useState } from 'react';
import { BottomSheet } from '@toss/tds-mobile';
import { Flame, Sparkles, Zap, BookOpen, Tv } from 'lucide-react';
import { toast } from 'sonner';
import { useAppContext } from '../context/AppContext';
import { logClick } from '../lib/analytics';
import { calcStreak } from '../lib/streak';
import { isRewardedAdEnabled, showRewardedAd } from '../lib/ads';
import { LESSON_COST, XP_BONUS_POINTS, XP_BONUS_STEP } from '../constants';
import { useCountUp } from '../hooks/useCountUp';
import { feedbackClaim, feedbackBoost } from '../lib/feedback';

// 모든 화면 상단 고정 바. 왼쪽 로고, 오른쪽에 아이콘 + 숫자만 나열한다(티어는 마이페이지에만).
// 아이콘은 마이페이지 요약 카드와 같은 lucide 세트를 쓴다.
// 포인트를 누르면 구매 시트가 열린다(광고 충전 / XP 2배 부스트).
export const TopBar = () => {
  const { points, xp, boostUntil, knownWords, attendanceDates, claimAdReward, buyBoost, shopOpen, shopReason, openShop, closeShop } = useAppContext();
  const [now, setNow] = useState(() => Date.now());

  const streak = calcStreak(attendanceDates);
  const boostLeft = boostUntil ? boostUntil - now : 0;
  const xpShown = useCountUp(xp);
  const pointsShown = useCountUp(points);

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
        if (credited) { feedbackClaim(); toast.success(`+${credited}P 받았어요`); }
      });
    });
    closeShop();
  };

  const handleBoost = async () => {
    if (await buyBoost()) { feedbackBoost(); toast.success('30분간 XP 2배! ⚡'); closeShop(); }
    else toast.error('포인트가 부족해요');
  };

  return (
    <>
      <div className="shrink-0 h-12 flex items-center justify-between px-5 bg-[var(--color-card)] border-b border-[var(--color-line)]">
        <span className="text-base font-black tracking-tight text-brand-500">머니터미</span>

        <div className="flex items-center gap-3 text-sm font-bold text-[var(--color-ink-2)]">
          <span className="flex items-center gap-1"><Flame size={15} className="text-brand-500 fill-current" /><span key={streak} className="anim-bump">{streak}</span></span>
          <span className="flex items-center gap-1"><Sparkles size={15} className="text-brand-500" /><span key={xp} className="anim-bump">{xpShown.toLocaleString()}</span></span>
          <button onClick={() => openShop()} aria-label="포인트 상점" className="flex items-center gap-1 active:opacity-60">
            <Zap size={15} className="text-brand-500 fill-current" /><span key={points} className="anim-bump">{pointsShown.toLocaleString()}</span>
          </button>
          <span className="flex items-center gap-1"><BookOpen size={15} className="text-brand-500" /><span key={knownWords.length} className="anim-bump">{knownWords.length}</span></span>
          {boostLeft > 0 && (
            <span className="text-xs font-bold text-brand-500">
              ×2 {Math.floor(boostLeft / 60000)}:{String(Math.floor((boostLeft % 60000) / 1000)).padStart(2, '0')}
            </span>
          )}
        </div>
      </div>

      <BottomSheet
        open={shopOpen}
        onDimmerClick={closeShop}
        header={<span style={{ paddingLeft: '20px', fontWeight: 700, color: 'var(--color-ink)' }}>{shopReason === 'lesson' ? '포인트가 부족해요' : '포인트 상점'}</span>}
      >
        <div className="px-5 pb-6 flex flex-col gap-2">
          {shopReason === 'lesson' && (
            <p className="text-sm font-bold text-[var(--color-ink)] mb-1 break-keep">레슨을 시작하려면 {LESSON_COST}P가 필요해요</p>
          )}
          <p className="flex items-center gap-1 text-xs text-[var(--color-ink-3)] mb-1">보유 <Zap size={12} className="text-brand-500 fill-current" />{points.toLocaleString()}P</p>

          {/* 레슨이 막혀서 열렸을 땐 광고가 주행동이라 채운 버튼으로 */}
          <button
            onClick={handleAd}
            className={`w-full flex items-center justify-between rounded-chip px-4 py-4 text-sm font-bold active:opacity-70 ${shopReason === 'lesson' ? 'text-white bg-brand-500 anim-attn' : 'text-brand-500'}`}
            style={shopReason === 'lesson' ? undefined : { backgroundColor: 'var(--color-brand-soft)' }}
          >
            <span className="flex items-center gap-2"><Tv size={16} />광고 보고 포인트 받기</span>
            <span className="text-2xs font-medium opacity-80">시청하고 받기</span>
          </button>

          <button
            onClick={handleBoost}
            disabled={points < 300 || boostLeft > 0}
            className="w-full flex items-center justify-between rounded-chip px-4 py-4 text-sm font-bold text-brand-500 active:opacity-70 disabled:opacity-40"
            style={{ backgroundColor: 'var(--color-brand-soft)' }}
          >
            <span className="flex items-center gap-2"><Zap size={16} className="fill-current" />{boostLeft > 0 ? '부스트 사용 중' : 'XP 2배 부스트'}</span>
            <span className="text-2xs font-medium">
              {boostLeft > 0
                ? `${Math.floor(boostLeft / 60000)}:${String(Math.floor((boostLeft % 60000) / 1000)).padStart(2, '0')} 남음`
                : points < 300 ? `${(300 - points).toLocaleString()}P 더 필요` : '300P · 30분'}
            </span>
          </button>

          <div className="rounded-chip px-4 py-3 mt-1" style={{ backgroundColor: 'var(--color-surface)' }}>
            <p className="text-2xs font-bold text-[var(--color-ink-3)] mb-1!">학습으로 모으기</p>
            <p className="text-2xs text-[var(--color-ink-4)] leading-relaxed break-keep">
              퀴즈 정답 +10~20P · 미션 보상 +10~50P · XP {XP_BONUS_STEP}마다 +{XP_BONUS_POINTS}P
            </p>
          </div>
          <p className="text-2xs text-[var(--color-ink-4)] mt-1 leading-relaxed">
            레슨 시작에 {LESSON_COST}P가 들어요. 퀴즈·복습은 무료. 포인트는 순위에 반영되지 않아요.
          </p>
        </div>
      </BottomSheet>
    </>
  );
};
