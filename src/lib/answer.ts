// 주관식(리뷰) 정답 판정 정규화. 서버 answer_matches(supabase/migration_answer_normalize.sql)와 동일 규칙.
// 괄호 안 약어·슬래시 분해 항목을 모두 정답 후보로 인정한다.

const normalize = (s: string): string => s.replace(/\s+/g, '').toLowerCase();

export const answerMatches = (input: string, word: string): boolean => {
  const a = normalize(input);
  if (a === '') return false;

  const parenMatch = word.match(/\(([^)]*)\)/);
  const paren = parenMatch ? normalize(parenMatch[1]) : '';
  const base = word.replace(/\([^)]*\)/g, ''); // 괄호·내용 제거

  const cand = base
    .split('/')
    .map(normalize)
    .filter((x) => x !== '');
  if (paren !== '') cand.push(paren);

  return cand.includes(a);
};
