import type { Word, Course } from '../types';
import { ECONOMY_COURSES } from './macro';
import { STOCK_COURSES } from './stocks';
import { REALESTATE_COURSES } from './realestate';
import { CRYPTO_COURSES } from './crypto';
// 새 카테고리 추가 시 여기에 import 추가

export const COURSES: Course[] = [
  ...ECONOMY_COURSES,
  ...STOCK_COURSES,
  ...REALESTATE_COURSES,
  ...CRYPTO_COURSES,
  // 새 카테고리 courses 배열 추가
];

export const ALL_WORDS: Word[] = COURSES.flatMap((c) => c.words);

// 카테고리 목록 (CourseScreen 필터 탭용)
export const CATEGORIES: string[] = [...new Set(COURSES.map((c) => c.category))];
