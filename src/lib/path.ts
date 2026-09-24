import type { Course, Word } from '../types';

// 코스의 단어를 3~5개 묶음(레슨)으로 나누고, 레슨 3개마다 퀴즈 노드를 끼운 패스를 만든다.
// 진도 판정은 기존 규칙 그대로 — 단어가 knownIds에 있으면 완료, 코스별로 첫 미완료 레슨이 현재 위치.
export type PathNodeType = 'lesson' | 'quiz';
export type PathNodeState = 'done' | 'current' | 'available' | 'locked';

export type PathNode = {
  id: string;
  type: PathNodeType;
  courseId: string;
  words: Word[];
  state: PathNodeState;
};

export type PathSection = {
  course: Course;
  nodes: PathNode[];
  knownCount: number;
};

const LESSONS_PER_QUIZ = 3;

// ── 패스 기하 ────────────────────────────────────────────────────
// 노드 1개가 차지하는 세로 높이와 커넥터 svg 반폭.
export const ROW = 112;
export const SPAN = 80;
export const NODE = 64;
const GAP = 6; // 노드 테두리와 점선 사이 여백

// 8스텝 지그재그. 320px 화면 기준 여유 폭은 ±106px이라 68은 안전하다.
const OFFSETS = [0, 48, 68, 48, 0, -48, -68, -48];
export const nodeOffsetX = (i: number) => OFFSETS[i % OFFSETS.length];

// 레슨(코스 섹션)마다 다른 색. 한 코스 안의 노드는 같은 색을 공유하고, 다음 코스에서 색이 바뀐다.
// 라이트/다크 양쪽에서 흰 아이콘이 읽히는 채도로 고르고, 입체 그림자는 같은 계열의 진한 색.
const SECTION_COLORS = [
  { face: '#f97316', shadow: '#c2410c' }, // 브랜드 오렌지
  { face: '#22c55e', shadow: '#15803d' }, // 초록
  { face: '#3b82f6', shadow: '#1d4ed8' }, // 파랑
  { face: '#a855f7', shadow: '#7e22ce' }, // 보라
  { face: '#ec4899', shadow: '#be185d' }, // 핑크
  { face: '#14b8a6', shadow: '#0f766e' }, // 청록
];
export const sectionColor = (i: number) => SECTION_COLORS[i % SECTION_COLORS.length];

// 양 끝 접선이 수직인 큐빅. 노드마다 조각을 그려도 이음새가 보이지 않는다.
// (배너 높이가 한글 줄바꿈에 따라 변해서 섹션 전체를 한 장의 svg로 그릴 수 없다)
// 시작/끝을 노드 반지름 + 여백만큼 잘라내 점선이 노드 위로 지나가지 않게 한다.
// 제어점 x를 끝점 x와 같게 두는 한 접선은 수직으로 유지된다.
export const connectorD = (fromX: number, toX: number): string => {
  const x1 = SPAN + fromX;
  const x2 = SPAN + toX;
  const y1 = NODE / 2 + GAP;
  const y2 = ROW - NODE / 2 - GAP;
  return `M ${x1} ${y1} C ${x1} ${ROW * 0.42}, ${x2} ${ROW * 0.58}, ${x2} ${y2}`;
};

// 균등 분배. n=6 -> 3,3 / n=7 -> 4,3 / n=10 -> 4,3,3 / n=23 -> 4,4,4,4,4,3
export const chunkWords = (words: Word[], target = 4): Word[][] => {
  const n = words.length;
  if (n === 0) return [];
  const groups = Math.max(1, Math.round(n / target));
  const base = Math.floor(n / groups);
  const rem = n % groups;
  const out: Word[][] = [];
  let i = 0;
  for (let g = 0; g < groups; g++) {
    const size = base + (g < rem ? 1 : 0);
    out.push(words.slice(i, i + size));
    i += size;
  }
  return out;
};

const buildSection = (course: Course, knownIds: Set<number>): PathSection => {
  const lessons = chunkWords(course.words);
  const doneFlags = lessons.map(ws => ws.every(w => knownIds.has(w.id)));
  const currentIdx = doneFlags.findIndex(d => !d);

  const nodes: PathNode[] = [];
  const pushQuiz = (upto: number) => {
    const words = lessons.slice(0, upto + 1).flat();
    // 앞선 레슨을 다 끝냈을 때만 열린다. 퀴즈 완료를 기록할 곳이 없어 진행은 막지 않는다.
    nodes.push({
      id: `${course.id}-q${nodes.length}`,
      type: 'quiz',
      courseId: course.id,
      words,
      state: doneFlags.slice(0, upto + 1).every(Boolean) ? 'available' : 'locked',
    });
  };

  lessons.forEach((words, i) => {
    nodes.push({
      id: `${course.id}-l${i}`,
      type: 'lesson',
      courseId: course.id,
      words,
      state: doneFlags[i] ? 'done' : i === currentIdx ? 'current' : 'locked',
    });
    if ((i + 1) % LESSONS_PER_QUIZ === 0 && i < lessons.length - 1) pushQuiz(i);
  });
  if (lessons.length > 0) pushQuiz(lessons.length - 1);

  return {
    course,
    nodes,
    knownCount: course.words.filter(w => knownIds.has(w.id)).length,
  };
};

export const buildPath = (courses: Course[], knownIds: Set<number>): PathSection[] =>
  courses.map(c => buildSection(c, knownIds));
