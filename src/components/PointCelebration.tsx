import { useEffect, useRef } from 'react';
import { XpIcon } from './StatIcons';
import { logClick } from '../lib/analytics';
import { useModalTurn } from '../lib/modalTurn';
import { m, useReducedMotion } from 'motion/react';
import { AchievementShareButton } from './AchievementShareButton';
import { questShareCard } from '../lib/achievementImage';
import './PointCelebration.css';

export type PointReward = { xp: number; title?: string };

export const PointCelebration = ({ reward, onClose }: { reward: PointReward; onClose: () => void }) => {
  const close = () => { logClick('point_celebration_close', { xp: reward.xp }); onClose(); };
  const myTurn = useModalTurn(true);
  const confirmRef = useRef<HTMLButtonElement>(null);
  const reduceMotion = useReducedMotion();
  useEffect(() => {
    if (!myTurn) return;
    const previousFocus = document.activeElement as HTMLElement | null;
    confirmRef.current?.focus();
    return () => previousFocus?.focus();
  }, [myTurn]);
  if (!myTurn) return null;
  return (
    <div className="original-modal point-celebration" onClick={close} onKeyDown={event => {
      if (event.key === 'Escape') { event.stopPropagation(); close(); }
      if (event.key === 'Tab') {
        const buttons = Array.from(event.currentTarget.querySelectorAll<HTMLButtonElement>('button:not(:disabled)'));
        const index = buttons.indexOf(document.activeElement as HTMLButtonElement);
        event.preventDefault();
        buttons[(index + (event.shiftKey ? -1 : 1) + buttons.length) % buttons.length]?.focus();
      }
    }}>
      <div role="dialog" aria-modal="true" aria-label="미션 완료" aria-describedby="point-celebration-description" onClick={e => e.stopPropagation()} className="point-celebration-content anim-pop-in">
        <h2>미션 클리어!</h2>
        <p className="point-celebration-subtitle">보상도 챙겼어!</p>
        <div className="point-celebration-art">
          <img src="/otter/v5/otter-cheer.svg" alt="" aria-hidden="true" width={172} height={192} data-otter="cheer" />
        </div>
        <m.div initial={reduceMotion ? false : { scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 400, damping: 20, delay: 0.15 }} className="point-celebration-reward">
          <XpIcon size={24} />+{reward.xp} XP
        </m.div>
        <p id="point-celebration-description" className="point-celebration-description">오늘의 돈 공부, XP로 차곡차곡.</p>
        <button ref={confirmRef} type="button" onClick={close} className="point-celebration-confirm">확인</button>
        <AchievementShareButton card={questShareCard(reward.title ?? '오늘의 돈 공부, 하나 더 완료!', reward.xp)} />
      </div>
    </div>
  );
};
