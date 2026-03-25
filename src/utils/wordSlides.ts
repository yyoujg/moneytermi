import type { Word, WordSlide } from '../types';

export const getWordSlides = (word: Word): WordSlide[] => [
  {
    cardType: 'intro',
    label: '단어 소개',
    emoji: '📌',
  },
  {
    cardType: 'summary',
    label: '한 줄 정의',
    emoji: '💡',
    body: word.meaning,
  },
  {
    cardType: 'content',
    label: '자세히 알아보기',
    emoji: '📖',
    body: word.detailedMeaning,
  },
  {
    cardType: 'photo',
    label: '핵심 포인트',
    emoji: '🎯',
    body: word.hint,
  },
  {
    cardType: 'compare',
    label: '뉴스에서는',
    emoji: '📰',
    body: word.newsExample,
  },
  ...(word.relatedWords?.length
    ? [{ cardType: 'list' as const, label: '관련 용어', emoji: '🔗', tags: word.relatedWords }]
    : []
  ),
];
