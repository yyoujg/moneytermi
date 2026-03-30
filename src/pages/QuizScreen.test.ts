import { describe, it, expect } from 'vitest';
import { calcEarned, getOptions } from './QuizScreen';
import type { Word } from '../types';

// ── calcEarned ────────────────────────────────────────────────
describe('calcEarned', () => {
  it('콤보 1~2: 10P', () => {
    expect(calcEarned(1)).toBe(10);
    expect(calcEarned(2)).toBe(10);
  });

  it('콤보 3~4: 15P', () => {
    expect(calcEarned(3)).toBe(15);
    expect(calcEarned(4)).toBe(15);
  });

  it('콤보 5 이상: 20P', () => {
    expect(calcEarned(5)).toBe(20);
    expect(calcEarned(10)).toBe(20);
  });
});

// ── getOptions ────────────────────────────────────────────────
const makeWord = (id: number): Word => ({
  id,
  word: `단어${id}`,
  meaning: `뜻${id}`,
  detailedMeaning: '',
  newsExample: '',
  hint: '',
  difficulty: 1,
  relatedWords: [],
});

const allWords = Array.from({ length: 10 }, (_, i) => makeWord(i + 1));
const correctWord = allWords[0]; // 단어1

describe('getOptions', () => {
  it('항상 4개의 선택지를 반환', () => {
    const opts = getOptions(correctWord, allWords, allWords);
    expect(opts).toHaveLength(4);
  });

  it('정답 단어가 반드시 포함', () => {
    for (let i = 0; i < 10; i++) {
      const opts = getOptions(correctWord, allWords, allWords);
      expect(opts).toContain(correctWord.word);
    }
  });

  it('중복 선택지 없음', () => {
    for (let i = 0; i < 10; i++) {
      const opts = getOptions(correctWord, allWords, allWords);
      expect(new Set(opts).size).toBe(4);
    }
  });

  it('knownWords < 4이면 allWords pool 사용', () => {
    const fewKnown = allWords.slice(0, 2); // 2개만 알고있음
    const opts = getOptions(correctWord, fewKnown, allWords);
    expect(opts).toHaveLength(4);
    expect(opts).toContain(correctWord.word);
  });

  it('knownWords >= 4이면 knownWords pool 사용', () => {
    const knownWords = allWords.slice(0, 5); // 5개 알고있음
    // knownWords 밖의 단어는 포함되지 않아야 함
    const knownWordSet = new Set(knownWords.map(w => w.word));
    for (let i = 0; i < 20; i++) {
      const opts = getOptions(correctWord, knownWords, allWords);
      opts.forEach(opt => {
        expect(knownWordSet.has(opt)).toBe(true);
      });
    }
  });
});
