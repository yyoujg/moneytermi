import React, { createContext, useContext, useState, useEffect, useRef, useMemo } from 'react';
import type { Word, Course, Missions } from '../types';
import { supabase, getGuestClient } from '../lib/supabase';
import { loadStoredProfile } from '../hooks/useAuth';
import { useDebouncedEffect } from '../hooks/useDebouncedEffect';
import { Storage } from '../lib/storage';
import { requestAppReview } from '../lib/review';
import { logClick } from '../lib/analytics';
import { toDateStr } from '../lib/date';
import { nextSrs, gradeFromResult, addDays } from '../lib/srs';
import { DAILY_REVIEW_CAP } from '../constants';

type WpRow = { word_id: number; ease: number; interval_d: number; reps: number; due_date: string };

type AppContextValue = {
  ready: boolean;
  hydrated: boolean;
  points: number;
  setPoints: React.Dispatch<React.SetStateAction<number>>;
  knownWords: Word[];
  knownIds: Set<number>;
  setKnownWords: React.Dispatch<React.SetStateAction<Word[]>>;
  unknownWords: Word[];
  setUnknownWords: React.Dispatch<React.SetStateAction<Word[]>>;
  missions: Missions;
  setMissions: React.Dispatch<React.SetStateAction<Missions>>;
  claimReward: (missionId: keyof Missions) => Promise<void>;
  claimReferralReward: (amount: number, unit: string) => Promise<number | null>;
  claimAdReward: (amount: number, unit: string) => Promise<number | null>;
  submitQuizAnswer: (
    wordId: number, answer: string, mode: 'mc' | 'typed',
    usedHint: boolean, sessionStart: boolean,
  ) => Promise<{ correct: boolean; earned: number; combo: number; points: number; m3Current: number } | null>;
  toggleKnown: (word: Word) => void;
  attendanceDates: string[];
  checkIn: () => Promise<void>;
  courses: Course[];
  allWords: Word[];
  dueQueue: Word[];
  recordReview: (wordId: number, correct: boolean, usedHint: boolean) => Promise<void>;
  myEmoji: string;
  updateMyEmoji: (emoji: string) => Promise<void>;
};

const AppContext = createContext<AppContextValue | null>(null);

const DEFAULT_MISSIONS: Missions = {
  m1: { id: 'm1', title: '앱 출석하기',         reward: 10, current: 0, target: 1, isRewarded: false },
  m3: { id: 'm3', title: '퀴즈 정답 3회 맞히기', reward: 30, current: 0, target: 3, isRewarded: false },
};

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  const [points, setPoints]               = useState(0);
  const [knownWords, setKnownWords]       = useState<Word[]>([]);
  const [unknownWords, setUnknownWords]   = useState<Word[]>([]);
  const [missions, setMissions]           = useState<Missions>(DEFAULT_MISSIONS);
  const [attendanceDates, setAttendanceDates] = useState<string[]>([]);
  const [courses, setCourses]             = useState<Course[]>([]);
  const [allWords, setAllWords]           = useState<Word[]>([]);
  const [wpRows, setWpRows]               = useState<WpRow[]>([]);
  const [myEmoji, setMyEmoji]             = useState<string>('😊');
  const [ready, setReady]                 = useState(false);
  const [hydrated, setHydrated]           = useState(false);
  const pendingKnownIds   = useRef<Set<number> | null>(null);
  const pendingUnknownIds = useRef<Set<number> | null>(null);

  const knownIds = useMemo(() => new Set(knownWords.map(w => w.id)), [knownWords]);

  // ── Storage는 초기 로드 시 한 번만 읽고 ref에 캐싱 ────────────
  const profileIdRef    = useRef<string | null>(null);
  const dbRef           = useRef<typeof supabase>(supabase);
  const lastMissionDate = useRef<string>(toDateStr(new Date()));
  const autoCheckedRef  = useRef(false);

  // ── 콘텐츠 로드 (courses + words) ─────────────────────────────
  useEffect(() => {
    const loadContent = async () => {
      try {
      const [{ data: wordsData }, { data: cwData }, { data: coursesData }] = await Promise.all([
        supabase.from('words').select('*').order('id'),
        supabase.from('course_words').select('course_id, word_id, position').order('position'),
        supabase.from('courses').select('*').order('sort_order', { ascending: true }),
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
          .filter(Boolean)
          .sort((a: any, b: any) => (a.difficulty ?? 0) - (b.difficulty ?? 0)) as Word[],
      }));

      setCourses(builtCourses);
      setAllWords(Array.from(wordMap.values()));
      } catch (e) {
        console.error('[AppContext] 콘텐츠 로드 실패:', e);
      }
    };
    loadContent();
  }, []);

  // ── 초기 로드 (profileId 준비될 때까지 재시도) ────────────────
  useEffect(() => {
    let cancelled = false;
    let attempt = 0;

    const load = async () => {
      if (cancelled) return;

      const p = await loadStoredProfile();
      const profileId = p?.profileId ?? null;

      // profileId가 없으면 useAuth.initAuth()가 아직 실행 중 — 재시도
      if (!profileId) {
        if (attempt++ < 12) {
          setTimeout(load, 500);
        } else {
          console.error('[AppContext] profileId 로드 실패 — 콘텐츠만 표시합니다.');
          if (!cancelled) setReady(true);
        }
        return;
      }

      // ref에 캐싱 — 이후 sync 이펙트들은 Storage를 다시 읽지 않음
      profileIdRef.current = profileId;
      dbRef.current = p?.guestToken ? getGuestClient(p.guestToken) : supabase;
      const db = dbRef.current;
      const today = toDateStr(new Date());

      try {
      // 1. points — DB값과 로컬값 중 큰 값 유지 (로딩 중 적립 포인트 보존)
      const { data: profile, error: profileErr } = await db
        .from('profiles')
        .select('points')
        .eq('id', profileId)
        .single();

      // profileId가 Supabase에 없으면 (오프라인 폴백 UUID 등) localStorage 초기화 후 재시도
      if (profileErr?.code === 'PGRST116') {
        await Storage.removeItem('moneytermi_auth');
        profileIdRef.current = null;
        dbRef.current = supabase;
        attempt = 0;
        setTimeout(load, 300);
        return;
      }
      if (profileErr) console.error('[load] profiles fetch 실패:', profileErr);
      if (profile) setPoints(profile.points);  // 서버 단일 진실원

      // 2. word_progress → 실제 Word 객체 복원
      const { data: progress } = await db
        .from('word_progress')
        .select('word_id, status, ease, interval_d, reps, due_date')
        .eq('user_id', profileId);

      if (progress && progress.length > 0) {
        const knownIdSet   = new Set(progress.filter(p => p.status === 'known').map(p => p.word_id));
        const unknownIdSet = new Set(progress.filter(p => p.status === 'unknown').map(p => p.word_id));
        pendingKnownIds.current   = knownIdSet;
        pendingUnknownIds.current = unknownIdSet;
        setWpRows(progress.map(p => ({
          word_id: p.word_id, ease: p.ease, interval_d: p.interval_d,
          reps: p.reps, due_date: p.due_date,
        })));
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

      // 5. 내 프로필 이모지 로드
      const { data: myProfile } = await db
        .from('profiles')
        .select('emoji')
        .eq('id', profileId)
        .single();
      if (myProfile?.emoji) setMyEmoji(myProfile.emoji);

      } catch (e) {
        console.error('[AppContext] 초기 로드 실패:', e);
      } finally {
        if (!cancelled && profileIdRef.current !== null) setReady(true);
      }
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
    setHydrated(true);
  }, [allWords, ready]);

  // ── 첫 학습 단어 초기 SRS 시드 (wpRows에 없는 단어만, due = 내일) ──
  const seedInitialSrs = async (words: Word[], status: 'known' | 'unknown', profileId: string) => {
    const fresh = words.filter(w => !wpRows.some(r => r.word_id === w.id));
    if (fresh.length === 0) return;
    const due = addDays(new Date(), 1);
    const seed = fresh.map(w => ({ user_id: profileId, word_id: w.id, status, ease: 2.5, interval_d: 1, reps: 0, due_date: due }));
    const { error } = await dbRef.current.from('word_progress').upsert(seed, { onConflict: 'user_id,word_id' });
    if (error) { console.error('[sync] 초기 SRS 시드 실패:', error); return; }
    setWpRows(prev => [...prev, ...fresh.map(w => ({ word_id: w.id, ease: 2.5, interval_d: 1, reps: 0, due_date: due }))]);
  };

  // ── knownWords → word_progress upsert (2초 디바운스) ──────────
  useDebouncedEffect(async () => {
    if (!ready || knownWords.length === 0) return;
    const profileId = profileIdRef.current;
    if (!profileId) return;
    const rows = knownWords.map(w => ({ user_id: profileId, word_id: w.id, status: 'known' as const }));
    const { error } = await dbRef.current.from('word_progress').upsert(rows, { onConflict: 'user_id,word_id' });
    if (error) console.error('[sync] word_progress(known) 저장 실패:', error);
    await seedInitialSrs(knownWords, 'known', profileId);
  }, [knownWords, ready], 2000);

  // ── unknownWords → word_progress upsert ───────────────────────
  useDebouncedEffect(async () => {
    if (!ready || unknownWords.length === 0) return;
    const profileId = profileIdRef.current;
    if (!profileId) return;
    const rows = unknownWords.map(w => ({ user_id: profileId, word_id: w.id, status: 'unknown' as const }));
    const { error } = await dbRef.current.from('word_progress').upsert(rows, { onConflict: 'user_id,word_id' });
    if (error) console.error('[sync] word_progress(unknown) 저장 실패:', error);
    await seedInitialSrs(unknownWords, 'unknown', profileId);
  }, [unknownWords, ready], 2000);

  // ── checkIn — 출석 버튼 클릭 시 ────────────────────────────────
  const checkIn = async () => {
    const today = toDateStr(new Date());

    // UI 먼저 업데이트 (profileId 유무와 무관)
    setAttendanceDates(prev => prev.includes(today) ? prev : [today, ...prev]);
    setMissions(prev => ({
      ...prev,
      m1: { ...prev.m1, current: 1 },
    }));

    const profileId = profileIdRef.current;
    if (!profileId) return;

    const { error } = await dbRef.current.rpc('checkin', { p_date: today });
    if (error) console.error('[checkIn] checkin RPC 실패:', error);
  };

  // ── 앱 진입 시 자동 출석 (세션 1회 래치) ──────────────────────
  useEffect(() => {
    if (!ready || !profileIdRef.current || autoCheckedRef.current) return;
    autoCheckedRef.current = true;
    const today = toDateStr(new Date());
    if (!attendanceDates.includes(today)) {
      logClick('checkin_auto');
      checkIn();
    }
  }, [ready]);

  // ── 자정 미션 초기화 ──────────────────────────────────────────
  useEffect(() => {
    if (!ready) return;

    const scheduleReset = () => {
      const now = new Date();
      const next = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
      const msUntilMidnight = next.getTime() - now.getTime();

      const t = setTimeout(() => {
        const today = toDateStr(new Date());
        if (today !== lastMissionDate.current) {
          lastMissionDate.current = today;
          setMissions(DEFAULT_MISSIONS);
        }
        scheduleReset();
      }, msUntilMidnight);

      return t;
    };

    const t = scheduleReset();
    return () => clearTimeout(t);
  }, [ready]);

  // ── toggleKnown ───────────────────────────────────────────────
  const toggleKnown = (word: Word) => {
    const isKnown = knownWords.some(w => w.id === word.id);
    if (isKnown) {
      setKnownWords(prev => prev.filter(w => w.id !== word.id));
      setUnknownWords(prev => prev.some(w => w.id === word.id) ? prev : [...prev, word]);
    } else {
      if (knownWords.length === 0) { logClick('activation_first_card'); requestAppReview(); }
      setKnownWords(prev => prev.some(w => w.id === word.id) ? prev : [...prev, word]);
      setUnknownWords(prev => prev.filter(w => w.id !== word.id));
    }
  };

  // ── updateMyEmoji ─────────────────────────────────────────────
  const updateMyEmoji = async (emoji: string) => {
    setMyEmoji(emoji);
    const profileId = profileIdRef.current;
    if (!profileId) return;
    await dbRef.current.from('profiles').update({ emoji }).eq('id', profileId);
  };

  // ── claimReward — 서버가 자격 검증 후 적립 ─────────────────────
  const claimReward = async (missionId: keyof Missions) => {
    const mission = missions[missionId];
    if (mission.current < mission.target || mission.isRewarded) return;
    const today = toDateStr(new Date());
    const { data, error } = await dbRef.current.rpc('claim_mission_reward', {
      p_mission_id: missionId, p_date: today,
    });
    if (error || !data) { console.error('[claimReward] 실패:', error); return; }
    setPoints(data.points);
    setMissions(prev => ({ ...prev, [missionId]: { ...prev[missionId], isRewarded: true } }));
    logClick('mission_reward_claim', { mission_id: missionId, reward: mission.reward });
    requestAppReview();
  };

  // ── claimReferralReward — 친구초대(contactsViral) 리워드, 서버가 상한 적용 후 적립 ──
  const claimReferralReward = async (amount: number, unit: string) => {
    const { data, error } = await dbRef.current.rpc('claim_referral_reward', {
      p_reward_amount: amount, p_reward_unit: unit,
    });
    if (error || !data) { console.error('[claimReferralReward] 실패:', error); return null; }
    setPoints(data.points);
    logClick('referral_reward_claim', { amount: data.credited });
    return data.credited as number;
  };

  // ── claimAdReward — 리워드 광고(loadFullScreenAd/showFullScreenAd), 서버가 상한 적용 후 적립 ──
  const claimAdReward = async (amount: number, unit: string) => {
    const { data, error } = await dbRef.current.rpc('claim_ad_reward', {
      p_reward_amount: amount, p_reward_unit: unit,
    });
    if (error || !data) { console.error('[claimAdReward] 실패:', error); return null; }
    setPoints(data.points);
    logClick('ad_reward_claim', { amount: data.credited });
    return data.credited as number;
  };

  // ── submitQuizAnswer — 서버 채점 (포인트·콤보·m3 서버 소유) ────
  const submitQuizAnswer = async (
    wordId: number, answer: string, mode: 'mc' | 'typed',
    usedHint: boolean, sessionStart: boolean,
  ) => {
    const { data, error } = await dbRef.current.rpc('submit_quiz_answer', {
      p_word_id: wordId, p_answer: answer, p_mode: mode,
      p_used_hint: usedHint, p_session_start: sessionStart,
    });
    if (error || !data) { console.error('[submitQuizAnswer] 실패:', error); return null; }
    setPoints(data.points);
    setMissions(prev => ({ ...prev, m3: { ...prev.m3, current: data.m3_current } }));
    return {
      correct: data.correct, earned: data.earned, combo: data.combo,
      points: data.points, m3Current: data.m3_current,
    };
  };

  // ── 오늘 복습 큐 (due_date <= 오늘) ────────────────────────────
  const dueQueue = useMemo(() => {
    const todayStr = toDateStr(new Date());
    const byId = new Map(allWords.map(w => [w.id, w]));
    return wpRows
      .filter(r => r.due_date <= todayStr)
      .sort((a, b) => a.due_date.localeCompare(b.due_date))
      .slice(0, DAILY_REVIEW_CAP)
      .map(r => byId.get(r.word_id))
      .filter(Boolean) as Word[];
  }, [wpRows, allWords]);

  // ── recordReview — SRS 일정만 갱신 (포인트는 submitQuizAnswer가 담당) ─
  const recordReview = async (wordId: number, correct: boolean, usedHint: boolean) => {
    const existing = wpRows.find(r => r.word_id === wordId);
    const base = existing ?? { ease: 2.5, interval_d: 0, reps: 0 };
    const grade = gradeFromResult(correct, usedHint);
    const ns = nextSrs(base, grade);
    const due = addDays(new Date(), ns.interval_d);

    setWpRows(prev => [
      ...prev.filter(r => r.word_id !== wordId),
      { word_id: wordId, ease: ns.ease, interval_d: ns.interval_d, reps: ns.reps, due_date: due },
    ]);

    const profileId = profileIdRef.current;
    if (!profileId) return;
    const { error } = await dbRef.current.from('word_progress').upsert({
      user_id: profileId, word_id: wordId,
      status: correct ? 'known' : 'unknown',
      ease: ns.ease, interval_d: ns.interval_d, reps: ns.reps,
      due_date: due, last_grade: grade,
    }, { onConflict: 'user_id,word_id' });
    if (error) console.error('[recordReview] word_progress 저장 실패:', error);
  };

  return (
    <AppContext.Provider value={{
      ready,
      hydrated,
      points, setPoints,
      knownWords, knownIds, setKnownWords,
      unknownWords, setUnknownWords,
      missions, setMissions,
      claimReward,
      claimReferralReward,
      claimAdReward,
      submitQuizAnswer,
      toggleKnown,
      checkIn,
      attendanceDates,
      courses,
      allWords,
      dueQueue,
      recordReview,
      myEmoji,
      updateMyEmoji,
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
