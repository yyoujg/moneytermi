import { describe, expect, it } from 'vitest';
import { buildCourseContent } from './courseContent';

const wordRow = (id: number, difficulty: number) => ({
  id,
  word: `term-${id}`,
  meaning: `meaning-${id}`,
  detailed_meaning: `detail-${id}`,
  news_example: `news-${id}`,
  learning_example: null,
  hint: `hint-${id}`,
  difficulty,
  related_words: null,
  visuals: null,
  sources: null,
});

describe('buildCourseContent', () => {
  it('preserves course_words position instead of word id or difficulty', () => {
    const content = buildCourseContent(
      [wordRow(1, 3), wordRow(2, 1), wordRow(3, 2)],
      [
        { course_id: 'c1', word_id: 2, position: 3 },
        { course_id: 'c1', word_id: 1, position: 1 },
        { course_id: 'c1', word_id: 3, position: 2 },
        { course_id: 'c1', word_id: 999, position: 4 },
      ],
      [{ id: 'c1', level: 'L1', title: 'Course 1', description: '', category: 'Basics' }],
    );

    expect(content.courses[0]!.words.map(word => word.id)).toEqual([1, 3, 2]);
    expect(content.allWords.map(word => word.id)).toEqual([1, 2, 3]);
  });
});
