import { Check } from '../ui/OtterIcons';

type Props = {
  isRewarded: boolean;
  pending?: boolean;
  onClaim: () => void;
};

// 받기는 주버튼, 받은 뒤에는 버튼 모양 없이 체크와 글자로만 남겨 꺼진 버튼으로 보이지 않게 한다.
export const MissionRewardStatus = ({ isRewarded, pending = false, onClaim }: Props) => (
  isRewarded
    ? <span className="mission-reward-status anim-pop-in" data-state="claimed"><Check size={16} aria-hidden="true" />받음</span>
    : <button type="button" className="mission-reward-status anim-attn bg-brand-500 text-white" data-state={pending ? 'pending' : 'ready'} disabled={pending} aria-busy={pending} onClick={onClaim}>{pending ? '적립 중' : '받기'}</button>
);
