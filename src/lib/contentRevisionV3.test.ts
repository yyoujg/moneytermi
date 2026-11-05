import { describe, expect, it } from 'vitest';
import raw from '../../supabase/content/meaning-quiz-revision-v3.json';
import { chunkWords } from './path';
import { buildCustomQuizItem, buildQuizItem, lessonChecks, type CustomQuiz } from './quiz';
import type { Word, WordVisual } from '../types';

type RevisionRow = {
  wordId: number;
  word: string;
  before: Record<string, unknown>;
  after: Record<string, unknown>;
  changedFields: string[];
  expectedRowMd5: string;
  evidence: { url: string; summary: string }[];
  quizEdits: { visualIndex: number; before: CustomQuiz; after: CustomQuiz }[];
};
const pack = raw as unknown as {
  records: RevisionRow[];
  summary: { changedWords: number; changedQuizzes: number; changedTermDefinitions: number };
  coverage: { courses: { id: string; wordIds: number[] }[]; checkWordIds: number[] };
};
const changes = pack.records.flatMap(row => row.quizEdits.map(edit => ({ ...edit, wordId: row.wordId, word: row.word })));
const labelKey = (s: string) => s.normalize('NFKC').replace(/\s+/gu, '').toLowerCase();
const makeWord = (id: number, word = String(id), visuals?: WordVisual[]): Word => ({
  id, word, meaning: '검증용 뜻', detailedMeaning: '', newsExample: '', hint: '', difficulty: 1, visuals,
});

describe('운영 용어·퀴즈 3차 교정', () => {
  it('검수한 84개 행·86문항·13개 뜻만 변경한다', () => {
    expect(pack.records).toHaveLength(84);
    expect(new Set(pack.records.map(row => row.wordId)).size).toBe(84);
    expect(changes).toHaveLength(86);
    expect(new Set(changes.map(q => `${q.wordId}:${q.visualIndex}`)).size).toBe(86);
    expect(pack.summary.changedWords).toBe(84);
    expect(pack.summary.changedQuizzes).toBe(86);
    expect(pack.summary.changedTermDefinitions).toBe(13);
    const allowed = new Set(['meaning', 'detailed_meaning', 'learning_example', 'news_example', 'visuals']);
    for (const row of pack.records) {
      expect(row.expectedRowMd5).toMatch(/^[a-f0-9]{32}$/);
      expect(row.evidence.length).toBeGreaterThan(0);
      expect(row.changedFields.length).toBeGreaterThan(0);
      expect(new Set(Object.keys(row.before))).toEqual(new Set(row.changedFields));
      expect(new Set(Object.keys(row.after))).toEqual(new Set(row.changedFields));
      for (const field of row.changedFields) {
        expect(allowed.has(field)).toBe(true);
        expect(row.after[field]).not.toEqual(row.before[field]);
      }
      for (const source of row.evidence) {
        expect(source.url).toMatch(/^https:\/\//);
        expect(source.summary.trim().length).toBeGreaterThan(5);
      }
    }
  });

  it('비퀴즈 시각자료와 기존 문항 위치·학습 확인 표시를 보존한다', () => {
    const editable = new Set(['q', 'options', 'answer', 'explanation']);
    for (const row of pack.records) {
      if (!row.changedFields.includes('visuals')) continue;
      const before = row.before.visuals as WordVisual[];
      const after = row.after.visuals as WordVisual[];
      expect(after).toHaveLength(before.length);
      before.forEach((visual, index) => {
        const edit = row.quizEdits.find(q => q.visualIndex === index);
        if (!edit) expect(after[index]).toEqual(visual);
        else {
          expect(visual.type).toBe('quiz');
          expect(after[index]).toEqual(edit.after);
          expect(visual).toEqual(edit.before);
          for (const field of new Set([...Object.keys(edit.before), ...Object.keys(edit.after)])) {
            if (!editable.has(field)) {
              expect((edit.after as Record<string, unknown>)[field]).toEqual((edit.before as Record<string, unknown>)[field]);
            }
          }
        }
      });
    }
  });

  it.each(changes)('용어 $wordId의 $visualIndex번 문항을 실제 앱에서 표시·채점할 수 있다', change => {
    const q = change.after;
    expect(q.q.trim().length).toBeGreaterThan(10);
    expect(q.q.length).toBeLessThanOrEqual(180);
    expect(q.options.length).toBeGreaterThanOrEqual(2);
    expect(new Set(q.options.map(labelKey)).size).toBe(q.options.length);
    expect(q.options.every(option => option.trim())).toBe(true);
    expect(Number.isInteger(q.answer)).toBe(true);
    expect(q.answer).toBeGreaterThanOrEqual(0);
    expect(q.answer).toBeLessThan(q.options.length);
    expect(q.explanation?.trim().length).toBeGreaterThan(10);
    expect(q.lessonCheck).toBe(change.before.lessonCheck);
    const direct = buildCustomQuizItem(q);
    expect(direct.options.filter(option => option.isCorrect).map(option => option.label)).toEqual([q.options[q.answer]]);
    const word = makeWord(change.wordId, change.word, [q]);
    const item = buildQuizItem('custom', word, [word], [word]);
    expect(item.type).toBe('custom');
    expect(item.promptMain).toBe(q.q);
    expect(item.options.filter(option => option.isCorrect)).toHaveLength(1);
    expect(item.options.find(option => option.isCorrect)?.answer).toBe(change.word);
    expect(item.options.filter(option => !option.isCorrect).every(option => labelKey(option.answer) !== labelKey(change.word))).toBe(true);
    expect(lessonChecks([word])).toHaveLength(q.lessonCheck ? 1 : 0);
  });

  it('앱의 실제 분할 규칙으로 78개 코스·320개 레슨의 확인 문항 연결을 보존한다', () => {
    const checkIds = new Set(pack.coverage.checkWordIds);
    let lessonCount = 0;
    let linkCount = 0;
    expect(pack.coverage.courses).toHaveLength(78);
    for (const course of pack.coverage.courses) {
      linkCount += course.wordIds.length;
      for (const words of chunkWords(course.wordIds.map(id => makeWord(id)))) {
        lessonCount += 1;
        expect(words.some(word => checkIds.has(word.id)), course.id).toBe(true);
      }
    }
    expect(linkCount).toBe(1234);
    expect(lessonCount).toBe(320);
  });

  it('기존에 숨겨졌던 지니계수 문항을 실제 앱 선택 경로에서 복구한다', () => {
    const edit = changes.find(q => q.wordId === 551 && q.visualIndex === 3);
    expect(edit).toBeDefined();
    const beforeWord = makeWord(551, '지니계수', [edit!.before]);
    const afterWord = makeWord(551, '지니계수', [edit!.after]);
    expect(buildQuizItem('custom', beforeWord, [beforeWord], [beforeWord]).type).not.toBe('custom');
    expect(buildQuizItem('custom', afterWord, [afterWord], [afterWord]).type).toBe('custom');
  });
});
