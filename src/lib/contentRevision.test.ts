import { describe, expect, it } from 'vitest';
import pack from '../../supabase/content/meaning-quiz-revision-v1.json';
import { buildCustomQuizItem, buildQuizItem, type CustomQuiz } from './quiz';
import type { Word } from '../types';

type Fields = Record<string, unknown>;
type Revision = { wordId: number; word: string; before: Fields; after: Fields; reason: string; sourceUrls: string[]; evidence: string };
const records = pack.records as unknown as Revision[];
const visualArray = (value: unknown): Fields[] => {
  expect(Array.isArray(value)).toBe(true);
  return value as Fields[];
};
const allowed = new Set(['meaning', 'detailed_meaning', 'learning_example', 'news_example', 'visuals']);
const key = (text: string) => text.normalize('NFKC').replace(/\s+/gu, '').toLowerCase();

describe('운영 뜻·퀴즈 콘텐츠 수정안', () => {
  it('전체 검토 범위와 변경 식별자가 일관되고 원복에 필요한 원문이 있다', () => {
    expect(pack.summary.reviewedWords).toBe(1233);
    expect(pack.summary.reviewedQuizzes).toBe(401);
    expect(records.length).toBeGreaterThan(0);
    expect(records).toHaveLength(pack.summary.changedWords);
    expect(new Set(records.map(row => row.wordId)).size).toBe(records.length);
    for (const row of records) {
      expect(Number.isInteger(row.wordId)).toBe(true);
      expect(row.word.trim()).not.toBe('');
      expect(Object.keys(row.before).sort()).toEqual(Object.keys(row.after).sort());
      expect(row.reason.trim().length).toBeGreaterThan(5);
      expect(row.evidence.trim().length).toBeGreaterThan(5);
      for (const field of Object.keys(row.after)) {
        expect(allowed.has(field), field).toBe(true);
        expect(row.after[field]).not.toEqual(row.before[field]);
        if (field !== 'visuals') expect(typeof row.after[field]).toBe('string');
      }
      if (typeof row.after.news_example === 'string') expect(row.after.news_example.includes(row.word)).toBe(true);
      if (typeof row.after.learning_example === 'string') expect(row.after.learning_example.startsWith('학습용 가정: ')).toBe(true);
    }
  });

  it('도표·연결·기존 문제 수와 레슨 체크 조건을 보존한다', () => {
    let changedQuizzes = 0;
    for (const row of records.filter(row => 'visuals' in row.after)) {
      const before = visualArray(row.before.visuals);
      const after = visualArray(row.after.visuals);
      expect(after).toHaveLength(before.length);
      after.forEach((visual, index) => {
        const old = before[index];
        if (old.type !== 'quiz') { expect(visual).toEqual(old); return; }
        expect(visual.type).toBe('quiz');
        expect(Object.keys(visual).sort()).toEqual(Object.keys(old).sort());
        for (const field of Object.keys(old).filter(field => !['q', 'options', 'answer', 'explanation'].includes(field))) expect(visual[field]).toEqual(old[field]);
        expect((visual.options as string[]).length).toBe((old.options as string[]).length);
        if (JSON.stringify(visual) !== JSON.stringify(old)) {
          // 키 나열 순서는 내용 변경으로 세지 않는다.
          const content = (item: Fields) => [item.q, item.options, item.answer, item.explanation];
          if (JSON.stringify(content(visual)) !== JSON.stringify(content(old))) changedQuizzes += 1;
        }
      });
    }
    expect(changedQuizzes).toBe(pack.summary.quizzes);
  });

  it('각 문제는 고유한 보기·정답 한 개·해설과 기존 서버 제출 형식을 유지한다', () => {
    for (const row of records.filter(row => 'visuals' in row.after)) {
      const visuals = visualArray(row.after.visuals);
      for (const visual of visuals.filter(visual => visual.type === 'quiz')) {
        const quiz = visual as unknown as CustomQuiz;
        expect(quiz.q.trim().length).toBeGreaterThan(10);
        expect(quiz.explanation?.trim().length).toBeGreaterThan(10);
        expect(new Set(quiz.options.map(key)).size).toBe(quiz.options.length);
        expect(quiz.options.every(option => option.trim().length > 0)).toBe(true);
        expect(Number.isInteger(quiz.answer)).toBe(true);
        expect(quiz.answer).toBeGreaterThanOrEqual(0);
        expect(quiz.answer).toBeLessThan(quiz.options.length);
        const item = buildCustomQuizItem(quiz);
        expect(item.options.filter(option => option.isCorrect).map(option => option.label)).toEqual([quiz.options[quiz.answer]]);
        const word: Word = { id: row.wordId, word: row.word, meaning: '', detailedMeaning: '', newsExample: '', hint: '', difficulty: 1, visuals: [quiz] };
        const submitted = buildQuizItem('custom', word, [], []);
        expect(submitted.options.find(option => option.isCorrect)?.answer).toBe(row.word);
        expect(submitted.options.filter(option => !option.isCorrect).every(option => key(option.answer) !== key(row.word))).toBe(true);
      }
    }
  });
});
