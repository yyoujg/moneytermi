import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import type { Word, Course, Missions } from '../types';
import { supabase, getGuestClient } from '../lib/supabase';
import { loadStoredProfile } from '../hooks/useAuth';

const toDateStr = (d: Date) => d.toISOString().slice(0, 10);

const getStoredIds = () => {
  const p = loadStoredProfile();
  return { profileId: p?.profileId ?? null, guestToken: p?.guestToken ?? null };
};

const getDb = () => {
  const { guestToken } = getStoredIds();
  return guestToken ? getGuestClient(guestToken) : supabase;
};

export type LeagueUser = {
  id: string;
  name: string;
  points: number;
  emoji: string;
};

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
  otherLeagueUsers: LeagueUser[];
  checkIn: () => Promise<void>;
  courses: Course[];
  allWords: Word[];
};

const AppContext = createContext<AppContextValue | null>(null);

const DEFAULT_MISSIONS: Missions = {
  m1: { id: 'm1', title: '앱 출석하기',         reward: 10, current: 0, target: 1, isRewarded: false },
  m2: { id: 'm2', title: '용어 학습 1회 완료',   reward: 20, current: 0, target: 1, isRewarded: false },
  m3: { id: 'm3', title: '퀴즈 정답 3회 맞히기', reward: 30, current: 0, target: 3, isRewarded: false },
};

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  const [points, setPoints]               = useState(0);
  const [knownWords, setKnownWords]       = useState<Word[]>([]);
  const [unknownWords, setUnknownWords]   = useState<Word[]>([]);
  const [missions, setMissions]           = useState<Missions>(DEFAULT_MISSIONS);
  const [attendanceDates, setAttendanceDates] = useState<string[]>([]);
  const [otherLeagueUsers, setOtherLeagueUsers] = useState<LeagueUser[]>([]);
  const [courses, setCourses]             = useState<Course[]>([]);
  const [allWords, setAllWords]           = useState<Word[]>([]);
  const [ready, setReady]                 = useState(false);
  const pendingKnownIds   = useRef<Set<number> | null>(null);
  const pendingUnknownIds = useRef<Set<number> | null>(null);

  // ── 콘텐츠 로드 (courses + words) ─────────────────────────────
  useEffect(() => {
    const loadContent = async () => {
      const [{ data: wordsData }, { data: cwData }, { data: coursesData }] = await Promise.all([
        supabase.from('words').select('*').order('id'),
        supabase.from('course_words').select('course_id, word_id, position').order('position'),
        supabase.from('courses').select('*'),
      ]);
      if (!wordsData || !coursesData || !cwData) return;

      const wordMap = new Map(wordsData.map((w: any) => [w.id, {
        id: w.id,
        word: w.word,
        meaning: w.meaning,
        detailedMeaning: w.detailed_meaning,
        newsExample: w.news_example,
        hint: w.hint,
        relatedWords: w.related_words ?? [],
      } as Word]));

      const builtCourses: Course[] = coursesData.map((c: any) => ({
        id: c.id,
        level: c.level,
        title: c.title,
        description: c.description,
        category: c.category,
        words: cwData
          .filter((cw: any) => cw.course_id === c.id)
          .sort((a: any, b: any) => a.position - b.position)
          .map((cw: any) => wordMap.get(cw.word_id))
          .filter(Boolean) as Word[],
      }));

      setCourses(builtCourses);
      setAllWords(Array.from(wordMap.values()));
    };
    loadContent();
  }, []);

  // ── 초기 로드 (profileId 준비될 때까지 재시도) ────────────────
  useEffect(() => {
    let cancelled = false;
    let attempt = 0;

    const load = async () => {
      if (cancelled) return;

      const { profileId } = getStoredIds();
      // profileId가 없으면 useAuth.initAuth()가 아직 실행 중 — 재시도
      if (!profileId) {
        if (attempt++ < 12) setTimeout(load, 500);
        return;
      }

      const db = getDb();
      const today = toDateStr(new Date());

      // 1. points — DB값과 로컬값 중 큰 값 유지 (로딩 중 적립 포인트 보존)
      const { data: profile, error: profileErr } = await db
        .from('profiles')
        .select('points')
        .eq('id', profileId)
        .single();
      if (profileErr) console.error('[load] profiles fetch 실패:', profileErr);
      if (profile) setPoints(prev => Math.max(prev, profile.points));

      // 2. word_progress → 실제 Word 객체 복원
      const { data: progress } = await db
        .from('word_progress')
        .select('word_id, status')
        .eq('user_id', profileId);

      if (progress && progress.length > 0) {
        const knownIds   = new Set(progress.filter(p => p.status === 'known').map(p => p.word_id));
        const unknownIds = new Set(progress.filter(p => p.status === 'unknown').map(p => p.word_id));
        pendingKnownIds.current   = knownIds;
        pendingUnknownIds.current = unknownIds;
      }

      // 3. daily_missions
      const { data: dm } = await db
        .from('daily_missions')
        .select('mission_id, current, is_rewarded')
        .eq('user_id', profileId)
        .eq('date', today);

      if (dm && dm.length > 0) {
        setMissions(prev => {
          const next = { ...prev };
          dm.forEach(row => {
            const key = row.mission_id as keyof Missions;
            if (next[key]) next[key] = {
              ...next[key],
              current: Math.max(next[key].current, row.current),
              isRewarded: next[key].isRewarded || row.is_rewarded,
            };
          });
          return next;
        });
      }

      // 4. attendance
      const { data: att, error: attLoadErr } = await db
        .from('attendance')
        .select('date')
        .eq('user_id', profileId)
        .order('date', { ascending: false })
        .limit(60);
      if (attLoadErr) console.error('[load] attendance fetch 실패:', attLoadErr);

      const dates = att ? att.map(a => a.date) : [];
      setAttendanceDates(dates);

      // 오늘 이미 출석했으면 m1 자동 완료
      if (dates.includes(today)) {
        setMissions(prev => ({
          ...prev,
          m1: { ...prev.m1, current: 1 },
        }));
      }

      // 5. 리그 유저 — 본인 제외한 전체 프로필 (공개 SELECT)
      const { data: league } = await supabase
        .from('profiles')
        .select('id, nickname, points, emoji')
        .neq('id', profileId)
        .order('points', { ascending: false })
        .limit(49);

      if (league) {
        setOtherLeagueUsers(league.map(u => ({
          id: u.id,
          name: u.nickname,
          points: u.points,
          emoji: u.emoji,
        })));
      }

      if (!cancelled) setReady(true);
    };

    load();
    return () => { cancelled = true; };
  }, []);

  // ── allWords 로드 후 pending word IDs 해소 ────────────────────
  useEffect(() => {
    if (allWords.length === 0) return;
    if (pendingKnownIds.current) {
      setKnownWords(allWords.filter(w => pendingKnownIds.current!.has(w.id)));
      pendingKnownIds.current = null;
    }
    if (pendingUnknownIds.current) {
      setUnknownWords(allWords.filter(w => pendingUnknownIds.current!.has(w.id)));
      pendingUnknownIds.current = null;
    }
  }, [allWords]);

  // ── points → Supabase 동기화 (1초 디바운스) ───────────────────
  useEffect(() => {
    if (!ready) return;
    const { profileId } = getStoredIds();
    if (!profileId) return;
    const t = setTimeout(async () => {
      const { error } = await getDb().from('profiles').update({ points }).eq('id', profileId);
      if (error) console.error('[sync] points 저장 실패:', error);
    }, 1000);
    return () => clearTimeout(t);
  }, [points, ready]);

  // ── knownWords → word_progress upsert (2초 디바운스) ──────────
  useEffect(() => {
    if (!ready || knownWords.length === 0) return;
    const { profileId } = getStoredIds();
    if (!profileId) return;
    const t = setTimeout(async () => {
      const rows = knownWords.map(w => ({ user_id: profileId, word_id: w.id, status: 'known' as const }));
      const { error } = await getDb().from('word_progress').upsert(rows, { onConflict: 'user_id,word_id' });
      if (error) console.error('[sync] word_progress(known) 저장 실패:', error);
    }, 2000);
    return () => clearTimeout(t);
  }, [knownWords, ready]);

  // ── unknownWords → word_progress upsert ───────────────────────
  useEffect(() => {
    if (!ready || unknownWords.length === 0) return;
    const { profileId } = getStoredIds();
    if (!profileId) return;
    const t = setTimeout(async () => {
      const rows = unknownWords.map(w => ({ user_id: profileId, word_id: w.id, status: 'unknown' as const }));
      const { error } = await getDb().from('word_progress').upsert(rows, { onConflict: 'user_id,word_id' });
      if (error) console.error('[sync] word_progress(unknown) 저장 실패:', error);
    }, 2000);
    return () => clearTimeout(t);
  }, [unknownWords, ready]);

  // ── missions → daily_missions upsert (1.5초 디바운스) ─────────
  useEffect(() => {
    if (!ready) return;
    const { profileId } = getStoredIds();
    if (!profileId) return;
    const today = toDateStr(new Date());
    const t = setTimeout(async () => {
      const rows = (Object.values(missions) as Missions[keyof Missions][]).map(m => ({
        user_id: profileId, mission_id: m.id, date: today,
        current: m.current, is_rewarded: m.isRewarded,
      }));
      const { error } = await getDb().from('daily_missions').upsert(rows, { onConflict: 'user_id,mission_id,date' });
      if (error) console.error('[sync] daily_missions 저장 실패:', error);
    }, 1500);
    return () => clearTimeout(t);
  }, [missions, ready]);

  // ── checkIn — 출석 버튼 클릭 시 ────────────────────────────────
  const checkIn = async () => {
    const today = toDateStr(new Date());

    // UI 먼저 업데이트 (profileId 유무와 무관)
    setAttendanceDates(prev => prev.includes(today) ? prev : [today, ...prev]);
    setMissions(prev => ({
      ...prev,
      m1: { ...prev.m1, current: 1 },
    }));

    const { profileId } = getStoredIds();
    if (!profileId) return;
    const db = getDb();

    const { error: attErr } = await db.from('attendance').upsert(
      { user_id: profileId, date: today },
      { onConflict: 'user_id,date' }
    );
    if (attErr) console.error('[checkIn] attendance upsert 실패:', attErr);

    // 디바운스 sync가 initialized.current에 막힐 수 있으므로 직접 저장
    const { error: dmErr } = await db.from('daily_missions').upsert(
      { user_id: profileId, mission_id: 'm1', date: today, current: 1, is_rewarded: false },
      { onConflict: 'user_id,mission_id,date' }
    );
    if (dmErr) console.error('[checkIn] daily_missions upsert 실패:', dmErr);
  };

  // ── claimReward ───────────────────────────────────────────────
  const claimReward = (missionId: keyof Missions) => setMissions(prev => {
    const mission = prev[missionId];
    if (mission.current >= mission.target && !mission.isRewarded) {
      setPoints(p => p + mission.reward);
      return { ...prev, [missionId]: { ...mission, isRewarded: true } };
    }
    return prev;
  });

  return (
    <AppContext.Provider value={{
      points, setPoints,
      knownWords, setKnownWords,
      unknownWords, setUnknownWords,
      missions, setMissions,
      claimReward,
      checkIn,
      attendanceDates,
      otherLeagueUsers,
      courses,
      allWords,
    }}>
      {children}
    </AppContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export function useAppContext() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppContext must be used within AppProvider');
  return ctx;
}
