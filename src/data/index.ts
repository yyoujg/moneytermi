import type { Word, Course } from '../types';
import { ECONOMY_COURSES } from './macro';

export const COURSES: Course[] = [
  ...ECONOMY_COURSES,
  // 새 카테고리 courses 배열 추가
];

export const ALL_WORDS: Word[] = COURSES.flatMap((c) => c.words);

// 카테고리 목록 (CourseScreen 필터 탭용)
export const CATEGORIES: string[] = [...new Set(COURSES.map((c) => c.category))];
