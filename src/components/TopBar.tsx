import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import type React from 'react';
import { BottomSheet } from '@toss/tds-mobile';
import { ChevronsUp, Tv } from 'lucide-react';
import { StreakIcon, XpIcon, PointIcon, WordsIcon } from './StatIcons';
import { showModal } from './AlertModal';
import { useAppContext } from '../context/AppContext';
import { logClick } from '../lib/analytics';
import { calcStreak } from '../lib/streak';
import { isRewardedAdEnabled, showRewardedAd } from '../lib/ads';
import { LESSON_COST, XP_BONUS_POINTS, XP_BONUS_STEP } from '../constants';
import { feedbackClaim, feedbackBoost } from '../lib/feedback';
import { PointCelebration, type PointReward } from './PointCelebration';
import { RollingNumber } from './RollingNumber';

// 모든 화면 상단 고정 바. 아이콘 + 숫자만 나열한다(티어는 마이페이지에만).
// 연속 학습·XP·배운 단어는 누르면 아래에 짧은 설명 말풍선, 포인트는 구매 시트(광고 충전 / XP 2배 부스트)가 열린다.
type Tip = 'streak' | 'xp' | 'words';
const TIP_W = 256;
export const TopBar = () => {
  const { points, xp, boostUntil, knownWords, attendanceDates, claimAdReward, buyBoost, shopOpen, shopReason, openShop, closeShop } = useAppContext();
  const [now, setNow] = useState(() => Date.now());
  const [celebration, setCelebration] = useState<PointReward | null>(null);
  const [tip, setTip] = useState<Tip | null>(null);
  // 학습 중에는 각 화면의 레슨명과 진행 단계에 집중한다. 상점 시트는 계속 마운트한다.
  const pathname = useLocation().pathname;
  const hideBar = ['/home', '/league', '/league/rules', '/my', '/welcome', '/word-card', '/quiz', '/lesson-check', '/review'].includes(pathname);
  const compactBar = pathname === '/course';
  const [tipPos, setTipPos] = useState({ left: 16, tail: 0 });   // 말풍선 위치: 아이콘 아래 가운데, 화면 밖으로 안 나가게 16px 안쪽에서 멈춘다

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
  const boostLeft = boostUntil ? boostUntil - now : 0;

  // 부스트가 켜져 있는 동안만 1초 타이머. TopBar만 리렌더된다.
  useEffect(() => {
    if (!boostUntil || boostUntil <= Date.now()) return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [boostUntil]);

  const handleAd = () => {
    if (!isRewardedAdEnabled()) { showModal('지금은 광고를 볼 수 없어요', 'error'); return; }
    logClick('rewarded_ad_start', { from: 'topbar_shop' });
    showRewardedAd((amount, unit) => {
      claimAdReward(amount, unit).then(credited => {
        if (credited) { feedbackClaim(); setCelebration({ points: credited, source: 'ad' }); }
      });
    });
    closeShop();
  };

  const handleBoost = async () => {
    const r = await buyBoost();
    if (r === 'ok') { feedbackBoost(); showModal('30분간 XP 2배!'); closeShop(); }
    else if (r === 'active') { showModal('이미 부스트 중이에요', 'error'); closeShop(); }
    else showModal('포인트가 부족해요', 'error');
  };

  return (
    <>
      {/* 앱 이름·홈 이동은 토스 내비게이션 바가 맡는다. 자체 로고 헤더를 두면 검수에서 '자체 헤더 중복'으로 반려된다(2026-09-29) */}
      {!hideBar && <div data-topbar className="relative z-40 shrink-0 h-12 flex items-center px-4 min-[390px]:px-5 bg-[var(--color-card)]">

        <div className="ml-auto flex max-w-full items-center justify-end gap-3 overflow-x-auto text-[13px] font-bold whitespace-nowrap text-[var(--color-ink)] min-[390px]:gap-4 min-[390px]:text-sm [&::-webkit-scrollbar]:hidden">
          <button onClick={e => toggleTip('streak', e)} aria-label="연속 학습" className="flex min-h-11 min-w-11 items-center justify-center gap-1.5 active:opacity-60">
            <StreakIcon size={19} /><span><RollingNumber value={streak} /></span>
          </button>
          {!compactBar && <button onClick={e => toggleTip('xp', e)} aria-label="경험치" className="flex min-h-11 min-w-11 items-center justify-center gap-1.5 active:opacity-60">
            <XpIcon size={19} /><span><RollingNumber value={xp} /></span>
          </button>}
          <button onClick={() => { setTip(null); openShop(); }} aria-label="포인트 상점" className="flex min-h-11 min-w-11 items-center justify-center gap-1.5 active:opacity-60">
            <PointIcon size={19} /><span><RollingNumber value={points} /></span>
          </button>
          {!compactBar && <button onClick={e => toggleTip('words', e)} aria-label="배운 단어" className="flex min-h-11 min-w-11 items-center justify-center gap-1.5 active:opacity-60">
            <WordsIcon size={19} /><span><RollingNumber value={knownWords.length} /></span>
          </button>}
          {boostLeft > 0 && (
            <span className="text-xs font-bold text-[var(--color-ink)]">
              ×2 {Math.floor(boostLeft / 60000)}:{String(Math.floor((boostLeft % 60000) / 1000)).padStart(2, '0')}
            </span>
          )}
        </div>

        {tip && (
          <div role="status" onClick={() => setTip(null)} style={{ left: tipPos.left, width: TIP_W }} className="absolute top-full mt-2 rounded-chip bg-[#222] px-4 py-3 anim-pop-in">
            <span className="absolute -top-1 w-2.5 h-2.5 rotate-45 bg-[#222]" style={{ left: tipPos.tail - 5 }} />
            <p className="relative text-xs font-bold text-white">
              {tip === 'streak' ? `연속 학습 ${streak}일` : tip === 'xp' ? `경험치(XP) ${xp.toLocaleString()}` : `배운 단어 ${knownWords.length}개`}
            </p>
            <p className="relative mt-1 text-2xs text-white leading-relaxed break-keep">
              {tip === 'streak' ? '오늘까지 하루도 빠지지 않고 학습한 날 수예요. 하루라도 쉬면 처음부터 다시 세요.'
                : tip === 'xp' ? `학습과 퀴즈로 쌓여요. 리그 순위와 성장 단계는 XP로 정해지고, XP ${XP_BONUS_STEP}마다 ${XP_BONUS_POINTS}P를 더 받아요.`
                : '학습을 마친 단어 수예요. 같은 단어를 다시 배워도 늘지 않아요.'}
            </p>
          </div>
        )}
      </div>}

      <BottomSheet
        open={shopOpen}
        className="original-modal"
        onDimmerClick={closeShop}
        header={<span style={{ paddingLeft: '20px', fontWeight: 700, color: 'var(--color-ink)' }}>{shopReason === 'lesson' ? '포인트가 부족해요' : '포인트 상점'}</span>}
      >
        <div className="px-5 pb-6 flex flex-col gap-2">
          {shopReason === 'lesson' && (
            <p className="text-sm font-bold text-[var(--color-ink)] mb-1 break-keep">레슨을 시작하려면 {LESSON_COST}P가 필요해요</p>
          )}
          <p className="flex items-center gap-1 text-xs text-[var(--color-ink-3)] mb-1">보유 <PointIcon size={12} />{points.toLocaleString()}P</p>

          {/* 레슨이 막혀서 열렸을 땐 광고가 주행동이라 채운 버튼으로 */}
          <button
            onClick={handleAd}
            className={`grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-chip px-4 py-4 text-sm font-bold active:opacity-70 ${shopReason === 'lesson' ? 'bg-brand-500' : 'bg-[var(--color-button-secondary)] text-[var(--color-ink-2)]'}`}
          >
            <span className="flex min-w-0 items-center gap-2 text-left leading-5"><Tv size={18} className="shrink-0" />광고 보고 포인트 받기</span>
            <span className="shrink-0 text-right text-2xs font-medium leading-4 opacity-80">시청하고 받기</span>
          </button>

          <button
            onClick={handleBoost}
            disabled={points < 300 || boostLeft > 0}
            className="grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-chip bg-[var(--color-button-secondary)] px-4 py-4 text-sm font-bold text-[var(--color-ink-2)] active:opacity-70 disabled:opacity-60"
          >
            <span className="flex min-w-0 items-center gap-2 text-left leading-5"><ChevronsUp size={18} className="shrink-0" />{boostLeft > 0 ? '부스트 사용 중' : 'XP 2배 부스트'}</span>
            <span className="shrink-0 text-right text-2xs font-medium leading-4">
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
            첫 레슨은 무료예요. 이후 레슨 시작에 {LESSON_COST}P가 들어요. 퀴즈·복습은 무료. 포인트는 순위에 반영되지 않아요.
          </p>
        </div>
      </BottomSheet>
      {celebration && <PointCelebration reward={celebration} onClose={() => setCelebration(null)} />}
    </>
  );
};
