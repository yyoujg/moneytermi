export type AuthUser = {
  id: string;
  nickname: string;
  email?: string;
  isGuest: boolean;
  leagueTier: string;
};

export type AuthState = {
  user: AuthUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
};


export type Word = {
  id: number;
  word: string;
  meaning: string;
  detailedMeaning: string;
  newsExample: string;
  hint: string;
  difficulty: 1 | 2 | 3;
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

type MissionBase = {
  id: string;
  title: string;
  reward: number;
  current: number;
  target: number;
  isRewarded: boolean;
};

// 미션 종류는 서버 mission_defs가 정한다(고정 키 아님).
export type Mission = MissionBase & { sortOrder: number };
export type Missions = Record<string, Mission>;
