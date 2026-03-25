export type CardType = 'intro' | 'content' | 'compare' | 'summary' | 'photo' | 'list';

export type WordSlide = {
  cardType: CardType;
  label: string;
  emoji: string;
  body?: string;
  tags?: string[];
};

export type Word = {
  id: number;
  word: string;
  meaning: string;
  detailedMeaning: string;
  newsExample: string;
  hint: string;
  relatedWords?: string[];
};

export type Course = {
  id: string;
  level: string;
  title: string;
  description: string;
  category: string;
  words: Word[];
};

export type Mission = {
  id: string;
  title: string;
  reward: number;
  current: number;
  target: number;
  isRewarded: boolean;
};

export type Missions = {
  m1: Mission;
  m2: Mission;
  m3: Mission;
};
