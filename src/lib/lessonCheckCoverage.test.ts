import { describe, expect, it } from 'vitest';
import pack from '../../supabase/content/lesson-checks-20261016.json';
import manifest from '../../supabase/content/lesson-check-coverage-20261016.json';
import { chunkWords } from './path';
import { buildCustomQuizItem, lessonChecks, type CustomQuiz } from './quiz';
import type { Word } from '../types';

const makeWord = (id: number): Word => ({
  id, word: String(id), meaning: '', detailedMeaning: '', newsExample: '', hint: '', difficulty: 1,
});
const existing = new Set(manifest.existingCheckWordIds);
const additions = new Map(pack.map(p => [p.wordId, p.quiz as CustomQuiz]));

describe('운영 코스 전체 상황 문항 확충', () => {
  it('신규 문항은 단어와 질문이 중복되지 않고 정답과 해설이 유효하다', () => {
    expect(pack).toHaveLength(221);
    expect(additions.size).toBe(pack.length);
    expect(new Set(pack.map(p => p.quiz.q)).size).toBe(pack.length);
    for (const p of pack) {
      const q = p.quiz as CustomQuiz;
      expect(existing.has(p.wordId)).toBe(false);
      expect(q.lessonCheck).toBe(true);
      expect(q.q.trim().length).toBeGreaterThan(10);
      expect(q.explanation?.trim().length).toBeGreaterThan(10);
      expect(q.options).toHaveLength(3);
      expect(new Set(q.options).size).toBe(q.options.length);
      expect(q.options.every(option => option.trim().length > 0)).toBe(true);
      expect(Number.isInteger(q.answer)).toBe(true);
      expect(q.answer).toBeGreaterThanOrEqual(0);
      expect(q.answer).toBeLessThan(q.options.length);
      const item = buildCustomQuizItem(q);
      expect(item.options.filter(option => option.isCorrect).map(option => option.label)).toEqual([q.options[q.answer]]);
      expect(lessonChecks([{ ...makeWord(p.wordId), visuals: [q] }])).toHaveLength(1);
    }
  });

  it('실제 앱 분할 함수 기준 78개 코스의 320개 레슨을 모두 채운다', () => {
    let total = 0;
    let before = 0;
    const coveredLessons = new Set<string>();
    for (const course of manifest.courses) {
      chunkWords(course.words.map(w => makeWord(w.id))).forEach((words, i) => {
        total += 1;
        if (words.some(w => existing.has(w.id))) before += 1;
        const id = course.id + '-l' + i;
        expect(words.some(w => existing.has(w.id) || additions.has(w.id)), id).toBe(true);
        for (const p of pack.filter(p => p.lessonId === id)) {
          expect(words.some(w => w.id === p.wordId), id).toBe(true);
          coveredLessons.add(id);
        }
      });
    }
    expect(manifest.courses).toHaveLength(78);
    expect(total).toBe(320);
    expect(before).toBe(99);
    expect(coveredLessons.size).toBe(221);
  });
});
