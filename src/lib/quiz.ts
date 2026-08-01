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

  // 같은 카테고리 우선 정렬 (카테고리 정보 있을 때만)
  const cat = categoryOf?.(correctWord.id);
  const ranked = cat
    ? [...shuffle(others.filter(w => categoryOf?.(w.id) === cat)),
       ...shuffle(others.filter(w => categoryOf?.(w.id) !== cat))]
    : shuffle(others);

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
      { label: correctWord.meaning, answer: correctWord.word, isCorrect: true },
      ...distractors.map(w => ({ label: w.meaning, answer: w.word, isCorrect: false })),
    ]);
    return { type, promptLabel: '이 용어의 뜻은?', promptMain: correctWord.word, options: opts };
  }

  // meaning_to_word / cloze : 보기 = 단어
  const opts: QuizOption[] = shuffle([
    { label: correctWord.word, answer: correctWord.word, isCorrect: true },
    ...distractors.map(w => ({ label: w.word, answer: w.word, isCorrect: false })),
  ]);

  if (type === 'cloze') {
    const blanked = clozeText(correctWord) ?? correctWord.meaning;
    return { type, promptLabel: '빈칸에 들어갈 용어는?', promptMain: blanked, options: opts };
  }

  return {
    type: 'meaning_to_word',
    promptLabel: '이 뜻에 맞는 용어는?',
    promptMain: correctWord.meaning,
    promptSub: correctWord.detailedMeaning,
    options: opts,
  };
};

// 콤보 기반 포인트 계산
export const calcEarned = (combo: number): number => {
  if (combo >= 5) return 20;
  if (combo >= 3) return 15;
  return 10;
};
