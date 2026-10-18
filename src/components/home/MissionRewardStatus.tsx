type Props = {
  isRewarded: boolean;
  onClaim: () => void;
};

// 받기와 완료는 같은 크기를 쓰되, 완료는 누를 수 없는 상태 표시로 남긴다.
export const MissionRewardStatus = ({ isRewarded, onClaim }: Props) => (
  isRewarded
    ? <span className="mission-reward-status anim-pop-in" data-state="claimed">완료</span>
    : <button type="button" className="mission-reward-status anim-attn bg-brand-500 text-white" data-state="ready" onClick={onClaim}>받기</button>
);
