import { describe, expect, it } from 'vitest';
import type { Word } from '../types';
import { selectLessonQuizWords } from './lessonQuiz';

const word = (id: number): Word => ({
  id,
  word: `term-${id}`,
  meaning: '',
  detailedMeaning: '',
  newsExample: '',
  hint: '',
  difficulty: 1,
});

describe('selectLessonQuizWords', () => {
  it('keeps the current lesson order and skips unknown words', () => {
    const picked = selectLessonQuizWords(
      [word(5), word(2), word(9), word(1)],
      new Set([1, 2, 5]),
    );

    expect(picked.map(item => item.id)).toEqual([5, 2, 1]);
  });

  it('limits the queue to five words by default', () => {
    const picked = selectLessonQuizWords(
      [1, 2, 3, 4, 5, 6].map(word),
      new Set([1, 2, 3, 4, 5, 6]),
    );

    expect(picked.map(item => item.id)).toEqual([1, 2, 3, 4, 5]);
  });
});
