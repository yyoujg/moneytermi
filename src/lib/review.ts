import { requestReview } from '@apps-in-toss/web-framework';
import type { Course, Word } from '../types';
import { logClick } from './analytics';
import { toDateStr } from './date';

// 만족도 높은 순간(보상 수령/퀴즈 완료)에 앱 리뷰 요청. 노출은 플랫폼이 제어.
// 미지원 버전/웹 환경에서는 조용히 무시한다.
// 로깅 주의: review_request_called는 "SDK 호출이 resolve됐다"는 뜻일 뿐, 실제 리뷰 시트 노출 여부는 알 수 없다.
export const requestAppReview = async (): Promise<void> => {
  try {
    if (typeof requestReview.isSupported === 'function' && !requestReview.isSupported()) {
      logClick('review_request_unsupported');
      return;
    }
    await requestReview();
    logClick('review_request_called');
  } catch {
    logClick('review_request_error');
  }
};

export type ReviewProgressRow = {
  word_id: number;
  status?: 'known' | 'unknown';
  due_date?: string;
  reps?: number;
  last_grade?: number | null;
};

export type RecallWordOptions = {
  candidates: Word[];
  knownIds: Set<number>;
  progressRows: ReviewProgressRow[];
  courses: Course[];
  excludeIds?: Iterable<number>;
  count: number;
  today?: string;
};

const rankCourseOrder = (courses: Course[]) => {
  const order = new Map<number, number>();
  let i = 0;
  for (const course of courses) {
    for (const word of course.words) {
      if (!order.has(word.id)) order.set(word.id, i++);
    }
  }
  return order;
};

const priorityTier = (row: ReviewProgressRow | undefined, today: string) => {
  const due = !!row?.due_date && row.due_date <= today;
  const wrong = row?.status === 'unknown' || row?.last_grade === 0;
  if (due && wrong) return 0;
  if (due) return 1;
  if (wrong) return 2;
  return 3;
};

export const selectRecallWords = ({
  candidates,
  knownIds,
  progressRows,
  courses,
  excludeIds,
  count,
  today = toDateStr(new Date()),
}: RecallWordOptions): Word[] => {
  if (count <= 0) return [];
  const excluded = new Set(excludeIds ?? []);
  const progressById = new Map(progressRows.map(row => [row.word_id, row]));
  const courseOrder = rankCourseOrder(courses);
  const seen = new Set<number>();

  return candidates
    .filter(word => {
      if (seen.has(word.id)) return false;
      seen.add(word.id);
      return knownIds.has(word.id) && !excluded.has(word.id);
    })
    .sort((a, b) => {
      const ar = progressById.get(a.id);
      const br = progressById.get(b.id);
      const tier = priorityTier(ar, today) - priorityTier(br, today);
      if (tier !== 0) return tier;
      const due = (ar?.due_date ?? '9999-12-31').localeCompare(br?.due_date ?? '9999-12-31');
      if (due !== 0) return due;
      const reps = (ar?.reps ?? Number.MAX_SAFE_INTEGER) - (br?.reps ?? Number.MAX_SAFE_INTEGER);
      if (reps !== 0) return reps;
      const order = (courseOrder.get(a.id) ?? Number.MAX_SAFE_INTEGER) - (courseOrder.get(b.id) ?? Number.MAX_SAFE_INTEGER);
      if (order !== 0) return order;
      return a.id - b.id;
    })
    .slice(0, count);
};

export const shouldScheduleRetry = (queue: Word[], index: number, wordId: number): boolean => {
  if (index >= queue.length - 1) return false;
  return !queue.slice(index + 1).some(word => word.id === wordId);
};
