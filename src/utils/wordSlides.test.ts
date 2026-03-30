import { describe, it, expect } from 'vitest';
import { getWordSlides } from './wordSlides';
import type { Word } from '../types';

const makeWord = (overrides: Partial<Word> = {}): Word => ({
  id: 1,
  word: '테스트',
  meaning: '테스트 뜻',
  detailedMeaning: '자세한 설명',
  newsExample: '뉴스 예시',
  hint: 'ㅌㅅㅌ',
  difficulty: 1,
  relatedWords: [],
  ...overrides,
});

describe('getWordSlides', () => {
  it('relatedWords 없으면 5개 슬라이드 반환', () => {
    const slides = getWordSlides(makeWord({ relatedWords: [] }));
    expect(slides).toHaveLength(5);
  });

  it('relatedWords 있으면 6개 슬라이드 반환 (list 포함)', () => {
    const slides = getWordSlides(makeWord({ relatedWords: ['관련단어1'] }));
    expect(slides).toHaveLength(6);
    expect(slides[5].cardType).toBe('list');
  });

  it('슬라이드 순서: intro → summary → content → photo → compare', () => {
    const slides = getWordSlides(makeWord());
    expect(slides[0].cardType).toBe('intro');
    expect(slides[1].cardType).toBe('summary');
    expect(slides[2].cardType).toBe('content');
    expect(slides[3].cardType).toBe('photo');
    expect(slides[4].cardType).toBe('compare');
  });

  it('hint가 빈 문자열이어도 photo 슬라이드 포함', () => {
    const slides = getWordSlides(makeWord({ hint: '' }));
    const photoSlide = slides.find(s => s.cardType === 'photo');
    expect(photoSlide).toBeDefined();
  });

  it('list 슬라이드에 relatedWords 태그가 포함', () => {
    const relatedWords = ['금리', '환율'];
    const slides = getWordSlides(makeWord({ relatedWords }));
    const listSlide = slides.find(s => s.cardType === 'list');
    expect(listSlide?.tags).toEqual(relatedWords);
  });
});
