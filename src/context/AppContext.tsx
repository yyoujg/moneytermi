import React, { createContext, useContext, useState } from 'react';
import type { Word, Missions } from '../types';

type AppContextValue = {
  points: number;
  setPoints: React.Dispatch<React.SetStateAction<number>>;
  knownWords: Word[];
  setKnownWords: React.Dispatch<React.SetStateAction<Word[]>>;
  unknownWords: Word[];
  setUnknownWords: React.Dispatch<React.SetStateAction<Word[]>>;
  missions: Missions;
  setMissions: React.Dispatch<React.SetStateAction<Missions>>;
  claimReward: (missionId: keyof Missions) => void;
};

const AppContext = createContext<AppContextValue | null>(null);

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  const [points, setPoints] = useState(0);
  const [knownWords, setKnownWords] = useState<Word[]>([]);
  const [unknownWords, setUnknownWords] = useState<Word[]>([]);
  const [missions, setMissions] = useState<Missions>({
    m1: { id: 'm1', title: '앱 출석하기', reward: 10, current: 1, target: 1, isRewarded: false },
    m2: { id: 'm2', title: '용어 줍줍 1회 완료', reward: 20, current: 0, target: 1, isRewarded: false },
    m3: { id: 'm3', title: '퀴즈 정답 3회 맞히기', reward: 30, current: 0, target: 3, isRewarded: false },
  });

  const claimReward = (missionId: keyof Missions) => setMissions((prev) => {
    const mission = prev[missionId];
    if (mission.current >= mission.target && !mission.isRewarded) {
      setPoints((p) => p + mission.reward);
      return { ...prev, [missionId]: { ...mission, isRewarded: true } };
    }
    return prev;
  });

  return (
    <AppContext.Provider value={{ points, setPoints, knownWords, setKnownWords, unknownWords, setUnknownWords, missions, setMissions, claimReward }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppContext must be used within AppProvider');
  return ctx;
};
