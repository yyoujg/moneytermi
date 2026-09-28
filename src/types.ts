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
  visuals?: WordVisual[];
  sources?: string[];
};

// 단어 설명용 그래프·표 (words.visuals jsonb). ecos는 한국은행 통계를 ecos-series 함수로 불러온다.
export type WordVisual =
  | { type: 'line'; title: string; caption?: string; unit?: string; x: string[]; series: { name: string; values: number[] }[] }
  | { type: 'table'; title: string; caption?: string; columns: string[]; rows: string[][] }
  | { type: 'ecos'; title: string; caption?: string; stat: string; item: string; cycle: 'M'; unit: string; months?: number }
  | { type: 'flow'; title: string; caption?: string; steps: string[] }
  | { type: 'text'; title: string; caption?: string; body: string };

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
