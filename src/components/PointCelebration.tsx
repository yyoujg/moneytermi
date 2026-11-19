import { XpIcon } from './StatIcons';
import { logClick } from '../lib/analytics';
import { useModalTurn } from '../lib/modalTurn';
import { m, useReducedMotion } from 'motion/react';
import { CelebrationScreen } from './CelebrationScreen';
import { questShareCard } from '../lib/achievementImage';

export type PointReward = { xp: number; title?: string };

export const PointCelebration = ({ reward, onClose }: { reward: PointReward; onClose: () => void }) => {
  const close = () => { logClick('point_celebration_close', { xp: reward.xp }); onClose(); };
  const myTurn = useModalTurn(true);
  const reduceMotion = useReducedMotion();
  if (!myTurn) return null;
  return (
    <CelebrationScreen
      label="미션 완료"
      title="미션 클리어!"
      subtitle="보상도 챙겼어!"
      art={<img src="/otter/v5/otter-cheer.svg" alt="" aria-hidden="true" width={172} height={192} data-otter="cheer" />}
      record={(
        <m.div initial={reduceMotion ? false : { scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 400, damping: 20, delay: 0.15 }} className="celebration-record">
          <XpIcon size={24} />+{reward.xp} XP
        </m.div>
      )}
      description="오늘의 돈 공부, XP로 차곡차곡."
      shareCard={questShareCard(reward.title ?? '오늘의 돈 공부, 하나 더 완료!', reward.xp)}
      onClose={close}
    />
  );
};
