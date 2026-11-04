// 등급 10단계는 달리 장면으로 구분한다: 빈 지갑 → 가계부 → 돈 세기 → 저금통 → 안경·폰 → 신문 → 투자 차트 → 명상 → 금고 → 돈방석
// (public/league/v3, docs/character/league10). 아직 못 간 등급은 회색 잠김본. 단순화본이 없어 크기와 상관없이 같은 그림을 쓴다.
const STAGE_FILE: Record<number, string> = {
  1: '01-empty', 2: '02-ledger', 3: '03-saver', 4: '04-savings', 5: '05-routine',
  6: '06-news', 7: '07-investor', 8: '08-holder', 9: '09-rich', 10: '10-master',
};

export const StageGlyph = ({ id, size = 20, className = '', locked = false }: { id: number; size?: number; className?: string; locked?: boolean }) => {
  const variant = locked ? '-locked' : '';
  return (
    <img src={`/league/v3/league-${STAGE_FILE[id] ?? STAGE_FILE[1]}${variant}.svg`} alt="" aria-hidden="true" data-stage-id={id}
      width={size} height={size} className={`stage-glyph shrink-0 ${className}`} style={{ width: size, height: size }} />
  );
};

// 마이 통계처럼 작은 자리(24px)는 수달 없이 사물 하나로 그린 등급 아이콘(public/league/icons)을 쓴다
export const StageIcon = ({ id, size = 24 }: { id: number; size?: number }) => (
  <img src={`/league/icons/league-icon-${STAGE_FILE[id] ?? STAGE_FILE[1]}.svg`} alt="" aria-hidden="true" data-stage-icon={id} width={size} height={size} />
);
