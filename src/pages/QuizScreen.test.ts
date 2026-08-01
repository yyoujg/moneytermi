import { describe, it, expect } from 'vitest';
import { calcEarned, getOptions, getDistractors, buildQuizItem, pickQuizType, clozeText } from '../lib/quiz';
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

// ── 퀴즈 유형 (코드 C) ─────────────────────────────────────────
const clozeWord: Word = {
  id: 99, word: '핀테크', meaning: '금융과 기술의 결합', detailedMeaning: '상세',
  newsExample: '핀테크 기업이 은행을 위협한다.', hint: '', difficulty: 1, relatedWords: [],
};

describe('clozeText', () => {
  it('예문에 단어가 있으면 빈칸 처리', () => {
    expect(clozeText(clozeWord)).toBe('____ 기업이 은행을 위협한다.');
  });
  it('예문에 단어가 없으면 null', () => {
    expect(clozeText({ ...clozeWord, newsExample: '관련 없는 문장' })).toBeNull();
    expect(clozeText({ ...clozeWord, newsExample: '' })).toBeNull();
  });
});

describe('pickQuizType', () => {
  it('cloze 불가 단어는 cloze를 고르지 않음', () => {
    const noCloze = { ...clozeWord, newsExample: '' };
    for (let i = 0; i < 30; i++) {
      expect(pickQuizType(noCloze)).not.toBe('cloze');
    }
  });
  it('rand 주입으로 유형 결정 가능', () => {
    expect(pickQuizType(clozeWord, () => 0)).toBe('meaning_to_word');
  });
});

describe('buildQuizItem', () => {
  it('모든 유형: 보기 4개 + 정답 정확히 1개, 정답 answer는 정답 단어', () => {
    (['meaning_to_word', 'word_to_meaning', 'cloze'] as const).forEach(type => {
      const item = buildQuizItem(type, clozeWord, allWords, allWords);
      expect(item.options).toHaveLength(4);
      const correct = item.options.filter(o => o.isCorrect);
      expect(correct).toHaveLength(1);
      expect(correct[0].answer).toBe(clozeWord.word); // 서버 mc 채점 정합
    });
  });
  it('word_to_meaning: 보기 label은 뜻, 제출 answer는 단어', () => {
    const item = buildQuizItem('word_to_meaning', clozeWord, allWords, allWords);
    expect(item.promptMain).toBe(clozeWord.word);
    const correct = item.options.find(o => o.isCorrect)!;
    expect(correct.label).toBe(clozeWord.meaning);
    expect(correct.answer).toBe(clozeWord.word);
  });
  it('meaning_to_word: 제출 answer가 모두 서로 다른 단어', () => {
    const item = buildQuizItem('meaning_to_word', clozeWord, allWords, allWords);
    expect(new Set(item.options.map(o => o.answer)).size).toBe(4);
  });
});

// ── 코드 B: 같은 카테고리 오답 우선 ────────────────────────────
describe('getDistractors 카테고리 우선', () => {
  // 1~4는 '경제', 5~10은 '금융' 이라고 가정
  const categoryOf = (id: number) => (id <= 4 ? '경제' : '금융');

  it('같은 카테고리 단어가 충분하면 오답 3개 모두 같은 카테고리', () => {
    const correct = allWords[0]; // id1, 경제 (경제: id1~4 → 오답 후보 3개)
    for (let i = 0; i < 20; i++) {
      const d = getDistractors(correct, allWords, allWords, categoryOf);
      expect(d).toHaveLength(3);
      d.forEach(w => expect(categoryOf(w.id)).toBe('경제'));
    }
  });

  it('같은 카테고리가 부족하면 다른 카테고리로 채움(항상 3개)', () => {
    const soloCat = (id: number) => (id === 1 ? 'A' : 'B'); // 정답만 A
    const d = getDistractors(allWords[0], allWords, allWords, soloCat);
    expect(d).toHaveLength(3);
  });

  it('categoryOf 없으면 기존 동작(3개 반환)', () => {
    expect(getDistractors(allWords[0], allWords, allWords)).toHaveLength(3);
  });
});
