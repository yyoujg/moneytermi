import { Zap, Sparkles } from 'lucide-react';
import { logClick } from '../lib/analytics';

// 포인트를 받았을 때 토스트 대신 띄우는 축하 모달. 미션 보상(포인트+XP)과 광고 보상(포인트)이 함께 쓴다.
// 색종이·등장 애니메이션은 StreakCelebration/BadgeCelebration과 같은 클래스.
const CONFETTI = ['#f97316', '#fde68a', '#fecaca', '#bfdbfe', '#bbf7d0', '#c7d2fe', '#fbcfe8', '#f97316', '#fde68a', '#bfdbfe', '#bbf7d0', '#fecaca'];

export type PointReward = { points: number; xp?: number; source: 'mission' | 'ad' };

export const PointCelebration = ({ reward, onClose }: { reward: PointReward; onClose: () => void }) => {
  const close = () => { logClick('point_celebration_close', { source: reward.source, points: reward.points }); onClose(); };
  return (
    <div className="original-modal fixed inset-0 z-[60] flex items-center justify-center px-6 overflow-hidden" style={{ background: 'rgba(0,0,0,0.55)' }} onClick={close}>
      {CONFETTI.map((c, i) => (
        <span
          key={i}
          aria-hidden
          className="anim-confetti"
          style={{ '--x': `${(i * 8 + 4) % 100}%`, '--d': `${(i % 6) * 0.4}s`, '--r': i % 2 ? 1 : -1, background: c } as React.CSSProperties}
        />
      ))}

      <div role="dialog" aria-label="포인트 획득" onClick={e => e.stopPropagation()}
        className="flex w-full max-w-xs flex-col items-center rounded-card bg-[var(--color-card)] px-6 pb-6 pt-8 text-center anim-pop-in">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[var(--color-brand-soft)] text-brand-500">
          <Zap size={38} fill="currentColor" />
        </div>
        <h2 className="mt-5! text-xl font-bold text-[var(--color-ink)]">
          {reward.source === 'mission' ? '오늘의 미션 완료!' : '포인트를 받았어요!'}
        </h2>
        <p className="mt-2! text-sm text-[var(--color-ink-3)] break-keep">
          {reward.source === 'mission' ? '수고했어요. 내일도 함께해요.' : '광고를 끝까지 봐 주셔서 고마워요.'}
        </p>
        <div className={`mt-6 grid w-full gap-2 ${reward.xp ? 'grid-cols-2' : 'grid-cols-1'}`}>
          {reward.xp ? (
            <div className="flex flex-col items-center rounded-card bg-[var(--color-surface)] px-3 py-4">
              <Sparkles size={22} className="text-brand-500" />
              <span className="mt-2 text-lg font-bold text-[var(--color-ink)]">+{reward.xp} XP</span>
              <span className="text-xs text-[var(--color-ink-3)]">경험치</span>
            </div>
          ) : null}
          <div className="flex flex-col items-center rounded-card bg-[var(--color-brand-soft)] px-3 py-4">
            <Zap size={22} className="text-brand-500" />
            <span className="mt-2 text-lg font-bold text-[var(--color-ink)]">+{reward.points}P</span>
            <span className="text-xs text-[var(--color-ink-3)]">포인트</span>
          </div>
        </div>
        <button onClick={close} className="mt-6 w-full rounded-button bg-brand-500 py-4 text-sm font-bold text-white active:opacity-90">
          확인
        </button>
      </div>
    </div>
  );
};
