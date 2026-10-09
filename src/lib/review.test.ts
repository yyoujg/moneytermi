import { describe, expect, it } from 'vitest';
import type { Course, Word } from '../types';
import { selectRecallWords, shouldScheduleRetry } from './review';

const word = (id: number): Word => ({
  id,
  word: `용어${id}`,
  meaning: '',
  detailedMeaning: '',
  newsExample: '',
  hint: '',
  difficulty: 1,
});

const course = (id: string, ids: number[]): Course => ({
  id,
  level: '기초',
  title: id,
  description: '',
  category: id,
  words: ids.map(word),
});

describe('selectRecallWords', () => {
  const courses = [course('앞 단원', [1, 2, 3]), course('뒤 단원', [4, 5])];
  const candidates = [1, 2, 3, 4, 5].map(word);

  it('밀린 복습, 오답, 오래된 앞 단원 순으로 결정적으로 고른다', () => {
    const picked = selectRecallWords({
      candidates,
      knownIds: new Set([1, 2, 3, 4, 5]),
      courses,
      count: 4,
      today: '2026-10-09',
      progressRows: [
        { word_id: 1, status: 'known', due_date: '2026-10-08', reps: 3 },
        { word_id: 2, status: 'unknown', due_date: '2026-10-12', reps: 0 },
        { word_id: 3, status: 'known', due_date: '2026-10-10', reps: 0 },
        { word_id: 4, status: 'known', due_date: '2026-10-10', reps: 0 },
        { word_id: 5, status: 'known', due_date: '2026-10-20', reps: 5 },
      ],
    });

    expect(picked.map(w => w.id)).toEqual([1, 2, 3, 4]);
  });

  it('현재 레슨 단어와 미학습 단어를 섞지 않는다', () => {
    const picked = selectRecallWords({
      candidates,
      knownIds: new Set([1, 2, 4]),
      courses,
      excludeIds: [1, 4],
      count: 3,
      today: '2026-10-09',
      progressRows: [
        { word_id: 1, status: 'known', due_date: '2026-10-01', reps: 0 },
        { word_id: 2, status: 'known', due_date: '2026-10-02', reps: 0 },
        { word_id: 3, status: 'unknown', due_date: '2026-10-01', reps: 0 },
        { word_id: 4, status: 'known', due_date: '2026-10-01', reps: 0 },
      ],
    });

    expect(picked.map(w => w.id)).toEqual([2]);
  });

  it('처음 사용자나 작은 후보 풀에서는 가능한 만큼만 안정적으로 돌려준다', () => {
    expect(selectRecallWords({
      candidates: [word(9)],
      knownIds: new Set([9]),
      courses: [course('작은 풀', [9])],
      count: 3,
      today: '2026-10-09',
      progressRows: [],
    }).map(w => w.id)).toEqual([9]);
  });
});

describe('shouldScheduleRetry', () => {
  const queue = [1, 2, 3].map(word);

  it('다른 문제 뒤에 둘 수 있을 때만 재출제한다', () => {
    expect(shouldScheduleRetry(queue, 0, 1)).toBe(true);
    expect(shouldScheduleRetry(queue, 2, 3)).toBe(false);
  });

  it('이미 뒤에 같은 문제가 있으면 중복으로 붙이지 않는다', () => {
    expect(shouldScheduleRetry([word(1), word(2), word(1)], 0, 1)).toBe(false);
  });
});
