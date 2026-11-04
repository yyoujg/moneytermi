// 배지는 수달과 같은 낙서 그림체 일러스트(public/badges/v3, docs/character/badges/trace_badges.py로 벡터화).
// 획득은 수달 3색, 미획득은 회색 잠김본. 40px 이하는 선을 굵게 한 단순화본을 쓴다(캐릭터 바이블 규칙).
const STAT: Record<string, string> = { w: 'words', s: 'streak', x: 'xp' };
// ponytail: 2026-11-04에 늘린 9개(200단어~, 2주~, 2,000XP~)는 전용 그림이 없어 같은 계열의 가장 높은 단계 그림을 임시로 쓴다.
// 새 그림(public/badges/v3/badge-<이름>[-small|-locked].svg)이 오면 오른쪽 값만 바꾼다.
const FILE: Record<string, string> = {
  w1: 'word1', w10: 'word10', w50: 'word50', w100: 'word100', w200: 'word100', w500: 'word100', w1000: 'word100',
  s3: 'streak3', s7: 'streak7', s14: 'streak7', s30: 'streak30', s60: 'streak30', s100: 'streak30',
  x100: 'xp100', x500: 'xp500', x1000: 'xp1000', x2000: 'xp1000', x5000: 'xp1000', x10000: 'xp1000',
};

export const BadgeGlyph = ({ id, size = 22, className = '', earned = true }: {
  id: string; size?: number; className?: string; earned?: boolean;
}) => {
  const variant = !earned ? '-locked' : size <= 40 ? '-small' : '';
  return (
    <span aria-hidden="true" data-badge-id={id} data-earned={earned} data-badge-stat={STAT[id[0]]}
      className={`badge-glyph shrink-0 ${earned ? '' : 'is-locked'} ${className}`} style={{ width: size, height: size }}>
      <img src={`/badges/v3/badge-${FILE[id] ?? 'word1'}${variant}.svg`} alt="" width={size} height={size} />
    </span>
  );
};
