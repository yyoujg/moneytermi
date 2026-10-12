import type { Course, Word } from '../types';

export type WordLookup = {
  byName: Map<string, Word>;
  byBaseName: Map<string, Word>;
  courseIdByWordId: Map<number, string>;
  courseByWordId: Map<number, Course>;
};

export const baseTermName = (name: string) => name.split(/[(/;]/)[0].trim();

export const buildWordLookup = (allWords: Word[], courses: Course[]): WordLookup => {
  const byName = new Map<string, Word>();
  const byBaseName = new Map<string, Word>();
  const courseIdByWordId = new Map<number, string>();
  const courseByWordId = new Map<number, Course>();

  for (const word of allWords) {
    byName.set(word.word, word);
    const baseName = baseTermName(word.word);
    if (baseName.length >= 2 && !byBaseName.has(baseName)) byBaseName.set(baseName, word);
  }

  for (const course of courses) {
    for (const word of course.words) {
      if (!courseIdByWordId.has(word.id)) courseIdByWordId.set(word.id, course.id);
      if (!courseByWordId.has(word.id)) courseByWordId.set(word.id, course);
    }
  }

  return { byName, byBaseName, courseIdByWordId, courseByWordId };
};

export const relatedWordNames = (word: Word, lookup: WordLookup): string[] => {
  const names: string[] = [];
  const seen = new Set<string>();

  for (const relatedWord of word.relatedWords ?? []) {
    const match = lookup.byName.get(relatedWord) ?? lookup.byBaseName.get(baseTermName(relatedWord));
    if (!match || match.word === word.word || seen.has(match.word)) continue;
    seen.add(match.word);
    names.push(match.word);
  }

  return names;
};
