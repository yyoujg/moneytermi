import type { Word } from '../types';

export const selectLessonQuizWords = (words: Word[], knownIds: Set<number>, count = 5): Word[] =>
  words.filter(word => knownIds.has(word.id)).slice(0, count);
