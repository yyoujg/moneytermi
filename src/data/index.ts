import type { Word, Course } from '../types';
import { MACRO_ECONOMY_GENERAL } from './macro_economy_general';
import { MACRO_MACROECONOMICS } from './macro_macroeconomics';
import { MACRO_FINANCE } from './macro_finance';
import { MACRO_STOCK } from './macro_stock';

export const COURSES: Course[] = [
  ...MACRO_ECONOMY_GENERAL,
  ...MACRO_MACROECONOMICS,
  ...MACRO_FINANCE,
  ...MACRO_STOCK,
];

export const ALL_WORDS: Word[] = COURSES.flatMap((c) => c.words);

export const CATEGORIES: string[] = [...new Set(COURSES.map((c) => c.category))];
