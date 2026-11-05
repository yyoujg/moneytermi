import { CELEBRATION_COLORS } from '../lib/visualPalette';
import { XpIcon } from './StatIcons';
import { logClick } from '../lib/analytics';
import { useModalTurn } from '../lib/modalTurn';
import { m } from 'motion/react';

// 미션을 마쳤을 때 토스트 대신 띄우는 축하 모달. 받은 XP를 보여준다.
// 색종이·등장 애니메이션은 StreakCelebration/BadgeCelebration과 같은 클래스.
const CONFETTI = Array.from({ length: 5 }, (_, i) => CELEBRATION_COLORS[i % CELEBRATION_COLORS.length]);

export type PointReward = { xp: number };

export const PointCelebration = ({ reward, onClose }: { reward: PointReward; onClose: () => void }) => {
  const close = () => { logClick('point_celebration_close', { xp: reward.xp }); onClose(); };
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

      <div role="dialog" aria-label="미션 완료" onClick={e => e.stopPropagation()}
        className="app-card flex w-full max-w-xs flex-col items-center rounded-card bg-[var(--color-card)] px-6 pb-6 pt-6 text-center anim-pop-in">
        {/* 미션을 마친 기쁨은 응원하는 수달로 */}
        <img src="/otter/v5/otter-cheer.svg" alt="" aria-hidden="true" width={120} height={120} className="mb-2 h-[120px] w-[120px]" data-otter="cheer" />
        <h2 className="text-xl font-bold text-[var(--color-ink)]">
          미션 완료!
        </h2>
        <p className="mt-2! text-sm text-[var(--color-ink-3)] break-keep">
          미션을 마치고 경험치를 모았어요.
        </p>
        {/* 보상은 박스 없이 한 줄로 */}
        <div className="mt-5 flex items-center justify-center gap-4 text-lg font-bold tabular-nums">
          <m.span initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 500, damping: 12, delay: 0.25 }}
            className="inline-flex items-center gap-1 text-[var(--color-reward-foreground)]"><XpIcon size={20} />+{reward.xp} XP</m.span>
        </div>
        <button onClick={close} className="action-button mt-6 w-full">
          확인
        </button>
      </div>
    </div>
  );
};
