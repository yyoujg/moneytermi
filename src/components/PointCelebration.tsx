import { Zap, Sparkles } from 'lucide-react';
import { logClick } from '../lib/analytics';

// 포인트를 받았을 때 토스트 대신 띄우는 축하 모달. 미션 보상(포인트+XP)과 광고 보상(포인트)이 함께 쓴다.
// 색종이·등장 애니메이션은 StreakCelebration/BadgeCelebration과 같은 클래스.
const CONFETTI = ['#f97316', '#fde68a', '#fecaca', '#bfdbfe', '#bbf7d0', '#c7d2fe', '#fbcfe8', '#f97316', '#fde68a', '#bfdbfe', '#bbf7d0', '#fecaca'];

export type PointReward = { points: number; xp?: number; source: 'mission' | 'ad' };

export const PointCelebration = ({ reward, onClose }: { reward: PointReward; onClose: () => void }) => {
  const close = () => { logClick('point_celebration_close', { source: reward.source, points: reward.points }); onClose(); };
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center px-6 overflow-hidden" style={{ background: 'rgba(0,0,0,0.55)' }} onClick={close}>
      {CONFETTI.map((c, i) => (
        <span
          key={i}
          aria-hidden
          className="anim-confetti"
          style={{ '--x': `${(i * 8 + 4) % 100}%`, '--d': `${(i % 6) * 0.4}s`, '--r': i % 2 ? 1 : -1, background: c } as React.CSSProperties}
        />
      ))}

      <div
        role="dialog"
        aria-label="포인트 획득"
        onClick={e => e.stopPropagation()}
        className="w-full max-w-xs rounded-card bg-[var(--color-card)] px-6 pt-8 pb-5 flex flex-col items-center gap-3 shadow-lg anim-pop-in"
      >
        <div
          className="w-20 h-20 flex items-center justify-center"
          style={{ borderRadius: 9999, background: 'var(--color-brand-soft)', boxShadow: '0 0 0 6px rgba(249,115,22,0.18)' }}
        >
          <Zap size={40} className="text-brand-500 fill-current" />
        </div>

        <p className="text-4xl font-black text-[var(--color-ink)] anim-pop-in" style={{ '--i': 2 } as React.CSSProperties}>+{reward.points}P</p>
        {reward.xp ? (
          <p className="flex items-center gap-1 text-sm font-bold text-brand-500 anim-fade-up" style={{ '--i': 3 } as React.CSSProperties}>
            <Sparkles size={14} />+{reward.xp} XP
          </p>
        ) : null}
        <p className="text-sm text-[var(--color-ink-3)] text-center break-keep anim-fade-up" style={{ '--i': 4 } as React.CSSProperties}>
          {reward.source === 'mission' ? '미션 보상을 받았어요! 다음 레슨에 써 보세요.' : '광고를 끝까지 봐 주셔서 고마워요!'}
        </p>

        <button
          onClick={close}
          className="w-full mt-2 py-4 rounded-button text-sm font-bold text-white bg-brand-500 active:opacity-90 anim-fade-up"
          style={{ '--i': 5 } as React.CSSProperties}
        >
          확인
        </button>
      </div>
    </div>
  );
};
