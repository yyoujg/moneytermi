import { useEffect, useRef } from 'react';
import { XpIcon } from './StatIcons';
import { logClick } from '../lib/analytics';
import { useModalTurn } from '../lib/modalTurn';
import { m, useReducedMotion } from 'motion/react';
import './PointCelebration.css';
import { shareTossLink } from '../lib/share';
import { shareMessage } from '../lib/shareCopy';

export type PointReward = { xp: number; missionTitle?: string };

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
        const buttons = Array.from(event.currentTarget.querySelectorAll<HTMLButtonElement>('button'));
        const current = buttons.indexOf(document.activeElement as HTMLButtonElement);
        event.preventDefault();
        buttons[(current + (event.shiftKey ? -1 : 1) + buttons.length) % buttons.length]?.focus();
      }
    }}>
      <div role="dialog" aria-modal="true" aria-label="미션 완료" aria-describedby="point-celebration-description" onClick={e => e.stopPropagation()} className="point-celebration-content anim-pop-in">
        <h2>미션 끝. 제법 빠른데?</h2>
        <p className="point-celebration-subtitle">XP까지 야무지게 접수.</p>
        <div className="point-celebration-art">
          <img src="/otter/v5/otter-cheer.svg" alt="" aria-hidden="true" width={172} height={192} data-otter="cheer" />
        </div>
        <m.div initial={reduceMotion ? false : { scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 400, damping: 20, delay: 0.15 }} className="point-celebration-reward">
          <XpIcon size={24} />+{reward.xp} XP
        </m.div>
        <p id="point-celebration-description" className="point-celebration-description">계획만 있는 줄 알았더니 결과까지 있네.</p>
        <button ref={confirmRef} type="button" onClick={close} className="point-celebration-confirm">확인</button>
        <button type="button" className="point-celebration-share" onClick={() => {
          logClick('mission_reward_share', { xp: reward.xp });
          void shareTossLink('intoss://moneytermi/home', shareMessage({ kind: 'quest', mission: reward.missionTitle ?? '미션', xp: reward.xp }), 'quest');
        }}>미션 기록 공유</button>
      </div>
    </div>
  );
};
