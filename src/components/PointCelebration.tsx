import { CELEBRATION_COLORS } from '../lib/visualPalette';
import { PointIcon, XpIcon } from './StatIcons';
import { logClick } from '../lib/analytics';
import { useModalTurn } from '../lib/modalTurn';

// 코인을 받았을 때 토스트 대신 띄우는 축하 모달. 미션 보상(코인+XP)과 광고 보상(코인)이 함께 쓴다.
// 색종이·등장 애니메이션은 StreakCelebration/BadgeCelebration과 같은 클래스.
const CONFETTI = Array.from({ length: 5 }, (_, i) => CELEBRATION_COLORS[i % CELEBRATION_COLORS.length]);

export type PointReward = { points: number; xp?: number; source: 'mission' | 'ad' };

export const PointCelebration = ({ reward, onClose }: { reward: PointReward; onClose: () => void }) => {
  const close = () => { logClick('point_celebration_close', { source: reward.source, points: reward.points }); onClose(); };
  const myTurn = useModalTurn(true);
  if (!myTurn) return null;
  return (
    <div className="original-modal fixed inset-0 z-[60] flex items-center justify-center px-6 overflow-hidden" style={{ background: 'var(--color-overlay)' }} onClick={close}>
      {CONFETTI.map((c, i) => (
        <span
          key={i}
          aria-hidden
          className="anim-confetti"
          style={{ '--x': `${(i * 8 + 4) % 100}%`, '--d': `${(i % 6) * 0.4}s`, '--r': i % 2 ? 1 : -1, background: c } as React.CSSProperties}
        />
      ))}

      <div role="dialog" aria-label="코인 획득" onClick={e => e.stopPropagation()}
        className="app-card flex w-full max-w-xs flex-col items-center rounded-card bg-[var(--color-card)] px-6 pb-6 pt-8 text-center anim-pop-in">
        <h2 className="text-xl font-bold text-[var(--color-ink)]">
          {reward.source === 'mission' ? '오늘의 미션 완료!' : '코인을 받았어요!'}
        </h2>
        <p className="mt-2! text-sm text-[var(--color-ink-3)] break-keep">
          {reward.source === 'mission' ? '미션을 마치고 코인을 모았어요.' : '광고 시청 보상으로 코인을 받았어요.'}
        </p>
        {/* 보상은 박스 없이 한 줄로 */}
        <div className="mt-5 flex items-center justify-center gap-4 text-lg font-bold tabular-nums">
          <span className="inline-flex items-center gap-1 text-[var(--color-reward-foreground)]"><PointIcon size={20} />코인 +{reward.points}개</span>
          {reward.xp ? <span className="inline-flex items-center gap-1 text-[var(--color-ink)]"><XpIcon size={20} />+{reward.xp} XP</span> : null}
        </div>
        <button onClick={close} className="action-button mt-6 w-full">
          확인
        </button>
      </div>
    </div>
  );
};
