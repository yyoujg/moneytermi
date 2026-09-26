import type { Word } from '../types';

// 단어 id → 코스 카테고리. buildQuizItem/getDistractors에 주입해 같은 주제 오답을 우선.
export type CategoryOf = (wordId: number) => string | undefined;

// 오답용 방해 단어 3개 (정답과 겹치지 않게). knownWords가 충분하면 그 안에서.
// categoryOf가 있으면 정답과 같은 카테고리의 단어를 먼저 채워 그럴듯한 보기를 만든다.
export const getDistractors = (
  correctWord: Word,
  knownWords: Word[],
  allWords: Word[],
  categoryOf?: CategoryOf,
): Word[] => {
  const pool = knownWords.length >= 4 ? knownWords : allWords;
  const others = pool.filter(w => w.id !== correctWord.id);
  const shuffle = (a: Word[]): Word[] => [...a].sort(() => Math.random() - 0.5);

  // 이름이 비슷한 용어(통화정책수단 vs 통화정책체계)는 오답으로 두지 않는다. 기본형 앞 3글자 비교.
  const head = (w: string) => w.split(/[(/;]/)[0].replace(/\s+/g, '').slice(0, 3);
  const myHead = head(correctWord.word);
  const dissimilar = myHead.length >= 3 ? others.filter(w => head(w.word) !== myHead) : others;

  // 같은 카테고리 우선 정렬 (카테고리 정보 있을 때만)
  const cat = categoryOf?.(correctWord.id);
  const ranked = cat
    ? [...shuffle(dissimilar.filter(w => categoryOf?.(w.id) === cat)),
       ...shuffle(dissimilar.filter(w => categoryOf?.(w.id) !== cat))]
    : shuffle(dissimilar);

  const wrong: Word[] = [];
  for (const w of ranked) {
    if (wrong.length >= 3) break;
    wrong.push(w);
  }

  if (wrong.length < 3) {
    const fallback = shuffle(allWords.filter(w => w.id !== correctWord.id));
    for (const w of fallback) {
      if (wrong.length >= 3) break;
      if (!wrong.some(x => x.id === w.id)) wrong.push(w);
    }
  }
  return wrong.slice(0, 3);
};

export const getOptions = (correctWord: Word, knownWords: Word[], allWords: Word[]): string[] => {
  const wrong = getDistractors(correctWord, knownWords, allWords).map(w => w.word);
  return [...wrong, correctWord.word].sort(() => Math.random() - 0.5);
};

// ── 퀴즈 유형 ──────────────────────────────────────────────────
// 채점은 서버가 mc 모드로 p_answer == word 비교 → 어떤 유형이든 제출값은 항상 정답 단어의 word.
export type QuizType = 'meaning_to_word' | 'word_to_meaning' | 'cloze';
export type QuizOption = { label: string; answer: string; isCorrect: boolean };
export type QuizItem = {
  type: QuizType;
  promptLabel: string;   // 상단 소제목
  promptMain: string;    // 문제 본문
  promptSub?: string;    // 보조 설명 박스 (있으면)
  options: QuizOption[];
};

const BLANK = '____';

// 본문(복습 상세)에 용어 자체가 들어 있다. 보기/문제에 쓸 때 용어를 가린다.
// 가리는 대상: 전체 단어, 괄호·슬래시 앞 기본형, 슬래시 각 조각, 괄호 안 약어(GDP). 바로 뒤에 붙은 영문 괄호도 함께.
// 한글은 글자 사이 띄어쓰기가 달라도('국고 전산망') 가린다.
// 용어를 찾는 정규식(g). 단어카드 '자세히' 하이라이트와 maskTerm이 같은 범위를 본다. 대상이 없으면 null.
export const termPattern = (word: string): RegExp | null => {
  const base = word.split(/[(/;]/)[0].trim();
  const segments = word.split('/').map(s => s.replace(/\([^)]*\)/g, '').trim());
  const parens = [...word.matchAll(/\(([^)]*)\)/g)].map(m => m[1].trim());
  const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const pattern = (t: string) => /^[가-힣\s]+$/.test(t) ? t.replace(/\s+/g, '').split('').map(esc).join('\\s*') : esc(t);
  const targets = [...new Set([word, base, ...segments, ...parens].filter(t => t.length >= 2))].sort((a, b) => b.length - a.length);
  return targets.length ? new RegExp(targets.map(pattern).join('|'), 'g') : null;
};

export const maskTerm = (text: string, word: string): string => {
  const p = termPattern(word);
  return p ? text.replace(new RegExp(`(?:${p.source})(\\s*\\([^)]*\\))?`, 'g'), BLANK) : text;
};

// cloze는 예문에 단어가 그대로 들어있을 때만 가능
export const clozeText = (word: Word): string | null => {
  const ex = word.newsExample?.trim();
  if (!ex || !ex.includes(word.word)) return null;
  return ex.split(word.word).join(BLANK);
};

export const pickQuizType = (word: Word, rand: () => number = Math.random): QuizType => {
  const types: QuizType[] = ['meaning_to_word', 'word_to_meaning'];
  if (clozeText(word)) types.push('cloze');
  return types[Math.floor(rand() * types.length)];
};

export const buildQuizItem = (
  type: QuizType,
  correctWord: Word,
  knownWords: Word[],
  allWords: Word[],
  categoryOf?: CategoryOf,
): QuizItem => {
  const distractors = getDistractors(correctWord, knownWords, allWords, categoryOf);
  const shuffle = <T,>(a: T[]): T[] => [...a].sort(() => Math.random() - 0.5);

  if (type === 'word_to_meaning') {
    const opts: QuizOption[] = shuffle([
      { label: maskTerm(correctWord.meaning, correctWord.word), answer: correctWord.word, isCorrect: true },
      ...distractors.map(w => ({ label: maskTerm(w.meaning, w.word), answer: w.word, isCorrect: false })),
    ]);
    return { type, promptLabel: '이 용어의 뜻은?', promptMain: correctWord.word, options: opts };
  }

  // meaning_to_word / cloze : 보기 = 단어
  const opts: QuizOption[] = shuffle([
    { label: correctWord.word, answer: correctWord.word, isCorrect: true },
    ...distractors.map(w => ({ label: w.word, answer: w.word, isCorrect: false })),
  ]);

  if (type === 'cloze') {
    const blanked = clozeText(correctWord) ?? maskTerm(correctWord.meaning, correctWord.word);
    return { type, promptLabel: '빈칸에 들어갈 용어는?', promptMain: blanked, options: opts };
  }

  return {
    type: 'meaning_to_word',
    promptLabel: '이 뜻에 맞는 용어는?',
    // detailedMeaning은 수백 자라 문제로 쓰기엔 길다. 첫 문장(meaning)만, 용어는 가려서.
    promptMain: maskTerm(correctWord.meaning, correctWord.word),
    options: opts,
  };
};

// 콤보 기반 포인트 계산
export const calcEarned = (combo: number): number => {
  if (combo >= 5) return 20;
  if (combo >= 3) return 15;
  return 10;
};
