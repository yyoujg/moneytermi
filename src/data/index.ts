import type { Word, Course } from '../types';
import { BOK_COURSES_PART1 } from './macro_economy_general';
import { BOK_COURSES_PART2 } from './macro_fintech_credit';
import { BOK_COURSES_PART3 } from './macro_national_income';
import { BOK_COURSES_PART4 } from './macro_global_finance';
import { BOK_COURSES_PART5 } from './macro_corporate_monetary';
import { BOK_COURSES_PART6 } from './macro_market_psychology';
import { BOK_COURSES_PART7 } from './macro_realeconomy_fund';
import { BOK_COURSES_PART8 } from './macro_stock_risk';
import { BOK_COURSES_PART9 } from './macro_central_bank';

export const COURSES: Course[] = [
  ...BOK_COURSES_PART1,
  ...BOK_COURSES_PART2,
  ...BOK_COURSES_PART3,
  ...BOK_COURSES_PART4,
  ...BOK_COURSES_PART5,
  ...BOK_COURSES_PART6,
  ...BOK_COURSES_PART7,
  ...BOK_COURSES_PART8,
  ...BOK_COURSES_PART9,
];

export const ALL_WORDS: Word[] = COURSES.flatMap((c) => c.words);

// 카테고리 목록 (CourseScreen 필터 탭용)
export const CATEGORIES: string[] = [...new Set(COURSES.map((c) => c.category))];
