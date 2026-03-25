export type Word = {
  id: number;
  word: string;
  meaning: string;
  detailedMeaning: string;
  newsExample: string;
  hint: string;
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
