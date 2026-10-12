import { describe, expect, it } from 'vitest';
import type { Word } from '../types';
import { firstUnknownWordIndex, learnedOrFallbackWords, selectCourseQuizWords } from './coursePractice';

const word = (id: number): Word => ({
  id,
  word: `term-${id}`,
  meaning: '',
  detailedMeaning: '',
  newsExample: '',
  hint: '',
  difficulty: 1,
});

describe('course practice helpers', () => {
  const words = [1, 2, 3, 4].map(word);

  it('uses learned words when the node has learned words', () => {
    expect(learnedOrFallbackWords(words, new Set([2, 4])).map(item => item.id)).toEqual([2, 4]);
  });

  it('falls back to node words before anything is learned', () => {
    expect(learnedOrFallbackWords(words, new Set()).map(item => item.id)).toEqual([1, 2, 3, 4]);
  });

  it('selects a shuffled course quiz queue from the right pool', () => {
    expect(selectCourseQuizWords(words, new Set([1, 2, 3]), 2, () => 0).map(item => item.id)).toEqual([2, 3]);
  });

  it('finds the first unknown word index', () => {
    expect(firstUnknownWordIndex(words, new Set([1, 2]))).toBe(2);
    expect(firstUnknownWordIndex(words, new Set([1, 2, 3, 4]))).toBe(0);
  });
});
