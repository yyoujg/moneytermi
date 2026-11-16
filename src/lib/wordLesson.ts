import type { Word, WordVisual } from '../types';
import { buildCustomQuizItem, buildQuizItem, lessonChecks } from './quiz';

export const wordLessonVisuals = (word: Word) => {
  const visuals = (word.visuals ?? [])
    .filter((visual): visual is Exclude<WordVisual, { type: 'text' | 'quiz' }> => visual.type !== 'text' && visual.type !== 'quiz')
    .map(visual => visual.type === 'table' && visual.title.endsWith('비슷한 개념') ? {
      ...visual,
      title: '비슷한 개념',
      rows: visual.rows.filter(row => row[0] !== word.word),
    } : visual)
    .filter(visual => visual.type !== 'table' || visual.rows.length > 0);
  const primary = visuals.find(visual => visual.type !== 'ecos' && !(visual.type === 'table' && visual.title === '비슷한 개념'));
  return { primary, more: visuals.filter(visual => visual !== primary) };
};

export const buildWordLessonCheck = (word: Word, knownWords: Word[], allWords: Word[]) => {
  const check = lessonChecks([word])[0];
  return check ? buildCustomQuizItem(check.quiz) : buildQuizItem('word_to_meaning', word, knownWords, allWords);
};
