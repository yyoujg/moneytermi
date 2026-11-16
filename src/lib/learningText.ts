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

export const spokenDefinition = (meaning: string): string => meaning.trim().split(/(?<=[.!?])\s+/).map(sentence => {
  if (!sentence) return '';
  const text = sentence.replace(/[.!?]$/, '');
  if (/(?:이에요|예요|해요|돼요|아요|어요|려요|져요|워요|나요|까요|세요|죠)$/.test(text)) return `${text}${sentence.match(/[.!?]$/)?.[0] ?? '.'}`;
  const note = text.match(/\s*(\([^()]*\))$/);
  const noun = note ? text.slice(0, note.index).trimEnd() : text;
  if (/(?:는지|인지)$/.test(noun)) return `${text}를 말해요.`;
  const last = noun.charCodeAt(noun.length - 1);
  const hasFinalConsonant = last >= 0xac00 && last <= 0xd7a3
    ? (last - 0xac00) % 28 !== 0
    : /[013678]$/.test(noun);
  return `${noun}${hasFinalConsonant ? '이에요' : '예요'}.${note ? ` ${note[1]}` : ''}`;
}).join(' ');
