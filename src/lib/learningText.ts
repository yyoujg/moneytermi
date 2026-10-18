// 핵심 뜻과 겹치는 첫 문장은 문장 경계가 확실할 때만 생략한다.
// 접두 문자열만 잘라 '이에요.' 또는 '으로, ...' 같은 문장 꼬리가 남지 않게 한다.
export const additionalMeaning = (meaning: string, detailedMeaning: string): string => {
  const brief = meaning.trim();
  const detail = detailedMeaning.trim();
  if (!brief || !detail.startsWith(brief)) return detail;
  const rest = detail.slice(brief.length);
  if (!rest.trim()) return '';
  if (/[.!?。]$/.test(brief) || /^\s*\n/.test(rest)) return rest.trim();
  const boundary = /^(?:(?:이에요|예요|입니다|이다|에요)[.!?]\s*|[.!?](?:\s+|$))/;
  return boundary.test(rest) ? rest.replace(boundary, '').trim() : detail;
};
