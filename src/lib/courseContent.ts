import type { Course, Word } from '../types';

type WordRow = {
  id: number;
  word: string;
  meaning: string;
  detailed_meaning: string;
  news_example: string;
  learning_example?: string | null;
  hint: string;
  difficulty: number;
  related_words?: string[] | null;
  visuals?: unknown;
  sources?: string[] | null;
};

type CourseWordRow = {
  course_id: string;
  word_id: number;
  position: number;
};

type CourseRow = {
  id: string;
  level: string;
  title: string;
  description: string;
  category: string;
};

const toWord = (row: WordRow): Word => ({
  id: row.id,
  word: row.word,
  meaning: row.meaning,
  detailedMeaning: row.detailed_meaning,
  newsExample: row.news_example,
  learningExample: row.learning_example ?? undefined,
  hint: row.hint,
  difficulty: row.difficulty as Word['difficulty'],
  relatedWords: row.related_words ?? [],
  visuals: (row.visuals as Word['visuals']) ?? undefined,
  sources: row.sources ?? [],
});

export const buildCourseContent = (
  wordRows: WordRow[],
  courseWordRows: CourseWordRow[],
  courseRows: CourseRow[],
): { courses: Course[]; allWords: Word[] } => {
  const allWords = wordRows.map(toWord);
  const wordMap = new Map(allWords.map(word => [word.id, word]));
  const courseWordMap = new Map<string, CourseWordRow[]>();

  for (const row of courseWordRows) {
    const rows = courseWordMap.get(row.course_id);
    if (rows) rows.push(row);
    else courseWordMap.set(row.course_id, [row]);
  }

  const courses = courseRows.map(row => ({
    id: row.id,
    level: row.level,
    title: row.title,
    description: row.description,
    category: row.category,
    words: [...(courseWordMap.get(row.id) ?? [])]
      .sort((a, b) => a.position - b.position)
      .map(courseWord => wordMap.get(courseWord.word_id))
      .filter((word): word is Word => Boolean(word)),
  }));

  return { courses, allWords };
};
