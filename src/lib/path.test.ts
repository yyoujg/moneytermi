import { describe, it, expect } from 'vitest';
import { chunkWords, buildPath, nodeOffsetX, sectionColor, connectorD, SPAN, ROW, NODE } from './path';
import type { Course, Word } from '../types';

const makeWords = (n: number): Word[] =>
  Array.from({ length: n }, (_, i) => ({
    id: i + 1,
    word: `단어${i + 1}`,
    meaning: '',
    detailedMeaning: '',
    newsExample: '',
    hint: '',
    difficulty: 1 as const,
  }));

const makeCourse = (id: string, n: number): Course => ({
  id,
  level: 'Lv.1',
  title: id,
  description: '',
  category: '경제',
  words: makeWords(n),
});

describe('chunkWords', () => {
  it('빈 배열', () => {
    expect(chunkWords([])).toEqual([]);
  });

  it('단어를 잃거나 중복하지 않는다 (n=1~30)', () => {
    for (let n = 1; n <= 30; n++) {
      const ws = makeWords(n);
      const flat = chunkWords(ws).flat();
      expect(flat.map(w => w.id)).toEqual(ws.map(w => w.id));
    }
  });

  it('n>=3이면 모든 묶음이 3~5개', () => {
    for (let n = 3; n <= 30; n++) {
      for (const g of chunkWords(makeWords(n))) {
        expect(g.length).toBeGreaterThanOrEqual(3);
        expect(g.length).toBeLessThanOrEqual(5);
      }
    }
  });

  it('알려진 분배', () => {
    const sizes = (n: number) => chunkWords(makeWords(n)).map(g => g.length);
    expect(sizes(6)).toEqual([3, 3]);
    expect(sizes(7)).toEqual([4, 3]);
    expect(sizes(10)).toEqual([4, 3, 3]);
    expect(sizes(23)).toEqual([4, 4, 4, 4, 4, 3]);
  });

  it('3개 미만 코스는 한 묶음으로 둔다', () => {
    expect(chunkWords(makeWords(2)).map(g => g.length)).toEqual([2]);
  });
});

describe('buildPath', () => {
  const course = makeCourse('c1', 16); // 4레슨

  it('레슨 3개마다 + 끝에 퀴즈', () => {
    const [sec] = buildPath([course], new Set());
    expect(sec.nodes.map(n => n.type)).toEqual(['lesson', 'lesson', 'lesson', 'quiz', 'lesson', 'quiz', 'review']);
  });

  it('레슨이 3개 이하면 끝에 퀴즈 1개만', () => {
    const [sec] = buildPath([makeCourse('c2', 12)], new Set());
    expect(sec.nodes.map(n => n.type)).toEqual(['lesson', 'lesson', 'lesson', 'quiz', 'review']);
  });

  it('진도 0: 첫 레슨이 current, 나머지 locked', () => {
    const [sec] = buildPath([course], new Set());
    const lessons = sec.nodes.filter(n => n.type === 'lesson');
    expect(lessons.map(n => n.state)).toEqual(['current', 'locked', 'locked', 'locked']);
    expect(sec.nodes.filter(n => n.type === 'quiz').every(n => n.state === 'locked')).toBe(true);
    expect(sec.knownCount).toBe(0);
  });

  it('첫 레슨 완료: 두 번째가 current', () => {
    const known = new Set(course.words.slice(0, 4).map(w => w.id));
    const [sec] = buildPath([course], known);
    const lessons = sec.nodes.filter(n => n.type === 'lesson');
    expect(lessons.map(n => n.state)).toEqual(['done', 'current', 'locked', 'locked']);
    expect(sec.knownCount).toBe(4);
  });

  it('앞선 레슨을 다 끝내면 퀴즈가 available', () => {
    const known = new Set(course.words.slice(0, 12).map(w => w.id));
    const [sec] = buildPath([course], known);
    const quizzes = sec.nodes.filter(n => n.type === 'quiz');
    expect(quizzes[0].state).toBe('available');
    expect(quizzes[1].state).toBe('locked');
  });

  it('전부 완료하면 current가 없다', () => {
    const known = new Set(course.words.map(w => w.id));
    const [sec] = buildPath([course], known);
    expect(sec.nodes.some(n => n.state === 'current')).toBe(false);
    expect(sec.nodes.filter(n => n.type === 'quiz').every(n => n.state === 'available')).toBe(true);
    expect(sec.knownCount).toBe(16);
  });

  it('퀴즈 노드는 앞선 레슨의 단어를 모두 담는다', () => {
    const [sec] = buildPath([course], new Set());
    const quizzes = sec.nodes.filter(n => n.type === 'quiz');
    expect(quizzes[0].words).toHaveLength(12);
    expect(quizzes[1].words).toHaveLength(16);
  });

  it('단어 없는 코스는 노드도 없다', () => {
    const [sec] = buildPath([makeCourse('empty', 0)], new Set());
    expect(sec.nodes).toEqual([]);
  });

  it('코스 순서를 그대로 유지한다', () => {
    const secs = buildPath([makeCourse('a', 4), makeCourse('b', 4)], new Set());
    expect(secs.map(s => s.course.id)).toEqual(['a', 'b']);
  });
});

describe('기하', () => {
  it('오프셋은 8주기이고 0에서 시작한다', () => {
    expect(nodeOffsetX(0)).toBe(0);
    expect(nodeOffsetX(8)).toBe(0);
    for (let i = 0; i < 64; i++) expect(nodeOffsetX(i)).toBe(nodeOffsetX(i + 8));
  });

  it('오프셋이 화면 밖으로 나가지 않는다 (320px 기준 여유 ±106)', () => {
    for (let i = 0; i < 64; i++) expect(Math.abs(nodeOffsetX(i))).toBeLessThanOrEqual(68);
  });

  it('커넥터 양 끝 접선이 수직이다 — 조각을 이어도 이음새가 안 보이는 조건', () => {
    const d = connectorD(-48, 68);
    const [sx, , c1x, , c2x, , ex] = d.match(/-?\d+(?:\.\d+)?/g)!.map(Number);
    expect(sx).toBe(SPAN - 48);
    expect(c1x).toBe(sx);      // 시작 제어점 x == 시작 x
    expect(ex).toBe(SPAN + 68);
    expect(c2x).toBe(ex);      // 끝 제어점 x == 끝 x
  });
});

describe('커넥터가 노드를 침범하지 않는다', () => {
  it('시작/끝 y가 노드 반지름 밖에 있다', () => {
    const n = connectorD(0, 48).match(/-?\d+(?:\.\d+)?/g)!.map(Number);
    const startY = n[1], endY = n[7];
    expect(startY).toBeGreaterThan(NODE / 2);       // 이전 노드 아래쪽 밖
    expect(endY).toBeLessThan(ROW - NODE / 2);      // 다음 노드 위쪽 밖
  });
});

describe('sectionColor', () => {
  it('6주기로 반복하고 이웃한 코스는 색이 다르다', () => {
    for (let i = 0; i < 24; i++) {
      expect(sectionColor(i)).toEqual(sectionColor(i + 6));
      expect(sectionColor(i).face).not.toBe(sectionColor(i + 1).face);
    }
  });

  it('첫 코스는 브랜드 색', () => {
    expect(sectionColor(0).face).toBe('#f97316');
  });
});

describe('누적 복습 노드', () => {
  const a = makeCourse('a', 8);
  const b = makeCourse('b', 8);

  it('코스마다 끝에 review 노드가 하나씩 붙는다', () => {
    const secs = buildPath([a, b], new Set());
    for (const s of secs) {
      expect(s.nodes.filter(n => n.type === 'review')).toHaveLength(1);
      expect(s.nodes[s.nodes.length - 1].type).toBe('review');
    }
  });

  it('앞 코스 단어까지 누적한다', () => {
    const [s1, s2] = buildPath([a, b], new Set());
    const r1 = s1.nodes.find(n => n.type === 'review')!;
    const r2 = s2.nodes.find(n => n.type === 'review')!;
    expect(r1.words).toHaveLength(8);
    expect(r2.words).toHaveLength(16);
    expect(r2.words.slice(0, 8).map(w => w.id)).toEqual(a.words.map(w => w.id));
  });

  it('그 코스를 다 끝내야 열린다', () => {
    const locked = buildPath([a], new Set())[0].nodes.find(n => n.type === 'review')!;
    expect(locked.state).toBe('locked');
    const open = buildPath([a], new Set(a.words.map(w => w.id)))[0].nodes.find(n => n.type === 'review')!;
    expect(open.state).toBe('available');
  });

  it('단어 없는 코스에는 붙지 않는다', () => {
    expect(buildPath([makeCourse('empty', 0)], new Set())[0].nodes).toEqual([]);
  });
});
