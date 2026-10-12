import type { Word } from '../types';
import { takeShuffled, type RandomFn } from './random';

export const COURSE_QUIZ_COUNT = 5;
export const COURSE_REVIEW_COUNT = 10;
export const LESSON_WARMUP_COUNT = 3;

export const learnedOrFallbackWords = (words: Word[], knownIds: Set<number>): Word[] => {
  const learned = words.filter(word => knownIds.has(word.id));
  return learned.length > 0 ? learned : words;
};

export const selectCourseQuizWords = (
  words: Word[],
  knownIds: Set<number>,
  count = COURSE_QUIZ_COUNT,
  rand: RandomFn = Math.random,
): Word[] => takeShuffled(learnedOrFallbackWords(words, knownIds), count, rand);

export const firstUnknownWordIndex = (words: Word[], knownIds: Set<number>): number => {
  const index = words.findIndex(word => !knownIds.has(word.id));
  return index < 0 ? 0 : index;
};
