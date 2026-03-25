import React, { createContext, useContext, useState } from 'react';
import type { Word, Missions } from '../types';

const toDateStr = (d: Date) => d.toISOString().slice(0, 10); // 'YYYY-MM-DD'
const today = toDateStr(new Date());

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
  attendanceDates: string[];
};

const AppContext = createContext<AppContextValue | null>(null);

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  const [points, setPoints] = useState(0);
  const [knownWords, setKnownWords] = useState<Word[]>([]);
  const [unknownWords, setUnknownWords] = useState<Word[]>([]);
  const [missions, setMissions] = useState<Missions>({
    m1: { id: 'm1', title: '앱 출석하기', reward: 10, current: 1, target: 1, isRewarded: false },
    m2: { id: 'm2', title: '용어 학습 1회 완료', reward: 20, current: 0, target: 1, isRewarded: false },
    m3: { id: 'm3', title: '퀴즈 정답 3회 맞히기', reward: 30, current: 0, target: 3, isRewarded: false },
  });

  // 오늘 날짜를 자동으로 출석 목록에 포함 (데모용 더미 날짜 포함)
  const [attendanceDates] = useState<string[]>(() => {
    const base = new Date();
    const dates: string[] = [];
    // 최근 몇 일 더미 출석 데이터
    [0, 1, 2, 4, 5, 8, 9, 10, 14, 15, 20].forEach((offset) => {
      const d = new Date(base);
      d.setDate(d.getDate() - offset);
      dates.push(toDateStr(d));
    });
    return dates;
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
    <AppContext.Provider value={{ points, setPoints, knownWords, setKnownWords, unknownWords, setUnknownWords, missions, setMissions, claimReward, attendanceDates }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppContext must be used within AppProvider');
  return ctx;
};
