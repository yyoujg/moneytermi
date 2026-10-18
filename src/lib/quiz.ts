import type { Word } from '../types';
import { shuffle } from './random';

// 단어 id → 코스 카테고리. buildQuizItem/getDistractors에 주입해 같은 주제 오답을 우선.
export type CategoryOf = (wordId: number) => string | undefined;

// 화면 표시의 공백·대소문자·유니코드 호환 표기 차이는 같은 보기로 취급한다.
const optionKey = (text: string): string => text.normalize('NFKC').replace(/\s+/gu, '').toLowerCase();

// 이름 중복은 모든 유형에서, 표시 문구 중복은 뜻 고르기에서 추가로 제외한다.
const selectDistractors = (
  correctWord: Word,
  knownWords: Word[],
  allWords: Word[],
  categoryOf?: CategoryOf,
  labelOf?: (word: Word) => string,
): Word[] => {
  const pool = knownWords.length >= 4 ? knownWords : allWords;
  const head = (word: string) => optionKey(word.split(/[(/;]/)[0]).slice(0, 3);
  const myHead = head(correctWord.word);
  const dissimilar = pool.filter(w => w.id !== correctWord.id && (myHead.length < 3 || head(w.word) !== myHead));
  const cat = categoryOf?.(correctWord.id);
  const ranked = cat
    ? [...shuffle(dissimilar.filter(w => categoryOf?.(w.id) === cat)),
       ...shuffle(dissimilar.filter(w => categoryOf?.(w.id) !== cat))]
    : shuffle(dissimilar);

  const ids = new Set([correctWord.id]);
  const names = new Set([optionKey(correctWord.word)]);
  const labels = new Set(labelOf ? [optionKey(labelOf(correctWord))] : []);
  const wrong: Word[] = [];
  // 우선 후보가 중복으로 빠져도 전체 자료에서 보충하되, 가짜 보기는 만들지 않는다.
  for (const w of [...ranked, ...shuffle(allWords)]) {
    if (wrong.length >= 3) break;
    const name = optionKey(w.word);
    const label = labelOf ? optionKey(labelOf(w)) : name;
    if (!name || !label || ids.has(w.id) || names.has(name) || labels.has(label)) continue;
    ids.add(w.id);
    names.add(name);
    labels.add(label);
    wrong.push(w);
  }
  return wrong;
};

// 같은 카테고리와 이미 배운 단어를 우선하며, 유일한 후보가 부족하면 3개 미만을 반환한다.
export const getDistractors = (
  correctWord: Word,
  knownWords: Word[],
  allWords: Word[],
  categoryOf?: CategoryOf,
): Word[] => selectDistractors(correctWord, knownWords, allWords, categoryOf);

export const getOptions = (correctWord: Word, knownWords: Word[], allWords: Word[]): string[] => {
  const wrong = getDistractors(correctWord, knownWords, allWords).map(w => w.word);
  return shuffle([...wrong, correctWord.word]);
};

// ── 퀴즈 유형 ──────────────────────────────────────────────────
// 채점은 서버가 mc 모드로 p_answer == word 비교 → 어떤 유형이든 제출값은 항상 정답 단어의 word.
export type QuizType = 'meaning_to_word' | 'word_to_meaning' | 'scenario_to_word' | 'cloze' | 'custom';
export type QuizOption = { label: string; answer: string; isCorrect: boolean };
export type QuizItem = {
  type: QuizType;
  promptLabel: string;   // 상단 소제목
  promptMain: string;    // 문제 본문
  promptSub?: string;    // 보조 설명 박스 (있으면)
  explanation?: string;
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

export const scenarioText = (word: Word): string | null => {
  const example = word.learningExample?.replace(/^학습용 가정:\s*/, '').trim();
  return example ? maskTerm(example, word.word) : null;
};

// cloze는 예문에 단어가 그대로 들어있을 때만 가능
export const clozeText = (word: Word): string | null => {
  const ex = word.newsExample?.trim();
  if (!ex || !ex.includes(word.word)) return null;
  return ex.split(word.word).join(BLANK);
};

export type CustomQuiz = Extract<NonNullable<Word['visuals']>[number], { type: 'quiz' }>;

const isValidCustomQuiz = (quiz: CustomQuiz): boolean => {
  if (typeof quiz.q !== 'string' || !quiz.q.trim() || !Array.isArray(quiz.options) || quiz.options.length < 2) return false;
  if (!Number.isInteger(quiz.answer) || quiz.answer < 0 || quiz.answer >= quiz.options.length) return false;
  const labels = Array.from(quiz.options, label => typeof label === 'string' ? optionKey(label) : '');
  return labels.every(Boolean) && new Set(labels).size === labels.length;
};

const customQuizzes = (word: Word) =>
  (word.visuals ?? []).filter((v): v is CustomQuiz =>
    v.type === 'quiz' && isValidCustomQuiz(v) &&
    // 서버는 answer가 정답 용어인지 비교하므로, 오답 문구가 용어와 같으면 문제 전체를 제외한다.
    v.options.every((label, index) => index === v.answer || optionKey(label) !== optionKey(word.word))
  );

export const lessonChecks = (words: Word[]) => words.flatMap(word =>
  customQuizzes(word).filter(quiz => quiz.lessonCheck && quiz.explanation?.trim()).slice(0, 1).map(quiz => ({ word, quiz }))
);

// 직접 호출은 기존대로 보기 글자 자체를 answer로 반환한다. 단어 기반 선택 경로에서 유효성을 검증한다.
export const buildCustomQuizItem = (quiz: CustomQuiz): QuizItem => {
  const options = quiz.options.map((label, i) => ({ label, answer: label, isCorrect: i === quiz.answer }));
  return {
    type: 'custom',
    promptLabel: '알맞은 것을 고르세요',
    promptMain: quiz.q,
    explanation: quiz.explanation,
    options: shuffle(options),
  };
};

export const pickQuizType = (word: Word, rand: () => number = Math.random): QuizType => {
  if (customQuizzes(word).length) return 'custom';   // 직접 만든 객관식이 있으면 그 문제를 낸다
  const types: QuizType[] = ['meaning_to_word', 'word_to_meaning'];
  if (scenarioText(word)) types.push('scenario_to_word');
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
  // 직접 만든 객관식: 정답 보기만 제출값이 단어(서버가 정답 처리), 오답 보기는 보기 글자 자체
  const quizzes = customQuizzes(correctWord);
  if (type === 'custom' && quizzes.length) {
    const cq = quizzes[Math.floor(Math.random() * quizzes.length)];
    const item = buildCustomQuizItem(cq);
    return { ...item, options: item.options.map(opt => opt.isCorrect ? { ...opt, answer: correctWord.word } : opt) };
  }

  const distractors = selectDistractors(
    correctWord, knownWords, allWords, categoryOf,
    type === 'word_to_meaning' ? w => maskTerm(w.meaning, w.word) : undefined,
  );

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

  if (type === 'scenario_to_word') {
    const scenario = scenarioText(correctWord);
    if (scenario) {
      return {
        type,
        promptLabel: '상황에 맞는 용어는?',
        promptMain: scenario,
        promptSub: maskTerm(correctWord.meaning, correctWord.word),
        options: opts,
      };
    }
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
