import { describe, expect, it } from 'vitest';
import type { Course, Word } from '../types';
import { baseTermName, buildWordLookup, relatedWordNames } from './wordLookup';

const makeWord = (id: number, word: string, relatedWords?: string[]): Word => ({
  id,
  word,
  meaning: `${word} 뜻`,
  detailedMeaning: `${word} 자세한 뜻`,
  newsExample: '',
  hint: '',
  difficulty: 1,
  relatedWords,
});

describe('wordLookup', () => {
  it('normalizes long economic terms to their base names', () => {
    expect(baseTermName('주가지수선물거래(코스피200)')).toBe('주가지수선물거래');
    expect(baseTermName('전세가율/매매가 대비 전세가')).toBe('전세가율');
    expect(baseTermName('채무불이행; 디폴트')).toBe('채무불이행');
  });

  it('builds indexes for word name and course lookup', () => {
    const word = makeWord(1, '전세가율');
    const course: Course = {
      id: 'real-estate',
      level: '초급',
      title: '부동산 기초',
      description: '',
      category: '부동산',
      words: [word],
    };

    const lookup = buildWordLookup([word], [course]);

    expect(lookup.byName.get('전세가율')).toBe(word);
    expect(lookup.byBaseName.get('전세가율')).toBe(word);
    expect(lookup.courseIdByWordId.get(1)).toBe('real-estate');
    expect(lookup.courseByWordId.get(1)).toBe(course);
  });

  it('resolves related words by exact name, base name, and de-duplicates them', () => {
    const jeonseRate = makeWord(1, '전세가율', ['깡통전세', '갭투자', '갭투자', '없는 단어']);
    const can = makeWord(2, '깡통전세(역전세 위험)');
    const gap = makeWord(3, '갭투자');
    const lookup = buildWordLookup([jeonseRate, can, gap], []);

    expect(relatedWordNames(jeonseRate, lookup)).toEqual(['깡통전세(역전세 위험)', '갭투자']);
  });
});
