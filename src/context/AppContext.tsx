import React, { createContext, useContext, useState, useEffect, useRef, useMemo } from 'react';
import type { Word, Course, Missions } from '../types';
import { supabase, getGuestClient } from '../lib/supabase';
import { loadStoredProfile } from '../hooks/useAuth';
import { useDebouncedEffect } from '../hooks/useDebouncedEffect';
import { Storage } from '../lib/storage';
import { requestAppReview } from '../lib/review';
import { claimPromotion } from '../lib/promotion';
import { logClick } from '../lib/analytics';
import { missionSlot, msUntilNextSlot, toDateStr } from '../lib/date';
import { nextSrs, gradeFromResult, addDays } from '../lib/srs';
import { DAILY_REVIEW_CAP, MISSION_XP } from '../constants';

type WpRow = { word_id: number; ease: number; interval_d: number; reps: number; due_date: string };

type AppContextValue = {
  ready: boolean;
  hydrated: boolean;
  points: number;
  setPoints: React.Dispatch<React.SetStateAction<number>>;
  xp: number;
  boostUntil: number | null;
  buyBoost: () => Promise<'ok' | 'active' | 'fail'>;
  spendPoints: (amount: number, reason: string) => Promise<boolean>;
  refreshWallet: () => Promise<void>;
  shopReason: 'lesson' | null;
  shopOpen: boolean;
  openShop: (reason?: 'lesson') => void;
  closeShop: () => void;
  knownWords: Word[];
  knownIds: Set<number>;
  setKnownWords: React.Dispatch<React.SetStateAction<Word[]>>;
  unknownWords: Word[];
  setUnknownWords: React.Dispatch<React.SetStateAction<Word[]>>;
  missions: Missions;
  setMissions: React.Dispatch<React.SetStateAction<Missions>>;
  claimReward: (missionId: keyof Missions) => Promise<{ xpGained: number } | null>;
  claimReferralReward: (amount: number, unit: string) => Promise<number | null>;
  claimAdReward: (amount: number, unit: string) => Promise<number | null>;
  claimPromotionReward: (amount: number) => Promise<number | null>;
  submitQuizAnswer: (
    wordId: number, answer: string, mode: 'mc' | 'typed',
    usedHint: boolean, sessionStart: boolean,
  ) => Promise<{ correct: boolean; earned: number; combo: number; points: number; m3Current: number; capped: boolean } | null>;
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

// mission_defs 테이블을 아직 적용하지 않은 환경용 폴백. 서버에서 정의를 받으면 대체된다.
const DEFAULT_MISSIONS: Missions = {
  m1: { id: 'm1', title: '앱 출석하기',         reward: 10, current: 0, target: 1, isRewarded: false, sortOrder: 10 },
  m3: { id: 'm3', title: '퀴즈 정답 3회 맞히기', reward: 30, current: 0, target: 3, isRewarded: false, sortOrder: 30 },
};

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  const [points, setPoints]               = useState(0);
  const [xp, setXp]                       = useState(0);
  const [boostUntil, setBoostUntil]       = useState<number | null>(null);
  const [shopOpen, setShopOpen]           = useState(false);
  const [shopReason, setShopReason]       = useState<'lesson' | null>(null);
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
  const missionBaseRef  = useRef<Missions>(DEFAULT_MISSIONS);
  // 진행도 행이 정의보다 먼저 도착하면 모르는 미션 id가 버려진다. 정의가 오면 다시 합치도록 보관.
  const missionRowsRef  = useRef<{ mission_id: string; current: number; is_rewarded: boolean }[]>([]);
  const claimingRef     = useRef<Set<string>>(new Set());
  const boostingRef     = useRef(false);

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

      // 미션 정의는 공개 데이터라 프로필이 없어도 받을 수 있다.
      const { data: defs } = await supabase
        .from('mission_defs')
        .select('mission_id, title, target, reward, sort_order')
        .eq('active', true)
        .order('sort_order');
      if (defs && defs.length > 0) {
        const base: Missions = Object.fromEntries(defs.map(d => [
          d.mission_id,
          { id: d.mission_id, title: d.title, target: d.target, reward: d.reward, current: 0, isRewarded: false, sortOrder: d.sort_order },
        ]));
        missionBaseRef.current = base;
        // load()와 순서가 뒤바뀌어도 정의는 서버 것, 진행도는 이미 받은 것을 유지한다.
        setMissions(prev => Object.fromEntries(Object.entries(base).map(([k, m]) => {
          const row = missionRowsRef.current.find(r => r.mission_id === k);
          return [k, {
            ...m,
            current: Math.max(prev[k]?.current ?? 0, row?.current ?? 0),
            isRewarded: (prev[k]?.isRewarded ?? false) || (row?.is_rewarded ?? false),
          }];
        })));
      }
      } catch (e) {
        console.error('[AppContext] 콘텐츠 로드 실패:', e);
      }
    };
    loadContent();
  }, []);

  // ── 미션 진행도 다시 읽기 ─────────────────────────────────────
  // m2/m4/m5는 서버 트리거·RPC가 올리므로 클라가 스스로 알 수 없다. 시작·슬롯 리셋·단어 저장 뒤·퀴즈 끝에 부른다.
  const refreshMissions = async () => {
    const profileId = profileIdRef.current;
    if (!profileId) return;
    const db = dbRef.current;
    const today = toDateStr(new Date());
    const slot = missionSlot();
    const base = missionBaseRef.current;

    // slot 컬럼이 아직 없는 DB에서도 동작하도록 실패하면 날짜만으로 다시 조회한다.
    let dm = (await db.from('daily_missions')
      .select('mission_id, current, is_rewarded')
      .eq('user_id', profileId).eq('date', today).eq('slot', slot)).data;
    if (!dm) {
      dm = (await db.from('daily_missions')
        .select('mission_id, current, is_rewarded')
        .eq('user_id', profileId).eq('date', today)).data;
    }

    missionRowsRef.current = dm ?? [];
    const merged = { ...base };
    (dm ?? []).forEach(row => {
      const m = merged[row.mission_id];
      if (m) merged[row.mission_id] = {
        ...m,
        current: Math.max(m.current, row.current),
        isRewarded: m.isRewarded || row.is_rewarded,
      };
    });
    setMissions(merged);
  };

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

      try {
      // 1. points — DB값과 로컬값 중 큰 값 유지 (로딩 중 적립 포인트 보존)
      const { data: profile, error: profileErr } = await db
        .from('profiles')
        .select('points, xp, boost_until')
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
      if (profile) {
        setPoints(profile.points);  // 서버 단일 진실원
        setXp(profile.xp ?? 0);
        setBoostUntil(profile.boost_until ? new Date(profile.boost_until).getTime() : null);
      } else if (profileErr) {
        // migration_xp 적용 전에는 xp/boost_until 컬럼이 없어 위 조회가 통째로 실패한다.
        // 포인트만이라도 읽어 앱이 멈추지 않게 한다.
        const { data: basic } = await db.from('profiles').select('points').eq('id', profileId).single();
        if (basic) setPoints(basic.points);
      }

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

      // 3. 현재 슬롯 진행도 (미션 정의는 loadContent에서 이미 받아 둔다)
      await refreshMissions();

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
    await refreshWallet();   // 새 단어 XP(트리거)·50XP 보너스·m2/m5는 이 저장이 끝나야 서버에 생긴다
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
    else await refreshWallet();   // 출석 +3 XP(하루 1회)·m1 서버 진행도 반영
  };

  // ── 앱 진입 시 자동 출석 (세션 1회 래치) ──────────────────────
  useEffect(() => {
    if (!ready || !profileIdRef.current || autoCheckedRef.current) return;
    autoCheckedRef.current = true;
    // 출석은 서버가 하루 1회로 막지만 m1 미션은 8시간 슬롯마다 다시 채워야 하므로 매번 부른다.
    if (!attendanceDates.includes(toDateStr(new Date()))) logClick('checkin_auto');
    checkIn();
  }, [ready]);

  // ── 8시간마다 미션 초기화 (KST 0/8/16시) ──────────────────────
  useEffect(() => {
    if (!ready) return;

    const scheduleReset = () => {
      const t = setTimeout(() => {
        lastMissionDate.current = `${toDateStr(new Date())}#${missionSlot()}`;
        setMissions(missionBaseRef.current);
        checkIn();
        scheduleReset();
      }, msUntilNextSlot() + 1000);

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
      if (knownWords.length === 0) {
        logClick('activation_first_card');
        requestAppReview();
        claimPromotion().then(amount => { if (amount) claimPromotionReward(amount); });
      }
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
  // 성공 여부를 돌려줘 화면이 토스트/햅틱을 결정한다
  const claimReward = async (missionId: keyof Missions): Promise<{ xpGained: number } | null> => {
    const mission = missions[missionId];
    if (mission.current < mission.target || mission.isRewarded) return null;
    if (claimingRef.current.has(missionId)) return null;   // 연타로 RPC 두 번 나가지 않게
    claimingRef.current.add(missionId);
    const today = toDateStr(new Date());
    let res;
    try {
      res = await dbRef.current.rpc('claim_mission_reward', { p_mission_id: missionId, p_date: today });
    } finally { claimingRef.current.delete(missionId); }
    const { data, error } = res;
    if (error || !data) { console.error('[claimReward] 실패:', error); return null; }
    // 서버가 XP 지급 뒤의 최종 잔고를 준다(부스트 배수·50XP 보너스 포함). 옛 서버면 xp가 없어 5로 본다.
    const xpGained = typeof data.xp === 'number' ? Math.max(data.xp - xp, 0) : MISSION_XP;
    setPoints(data.points);
    if (typeof data.xp === 'number') setXp(data.xp); else setXp(x => x + MISSION_XP);
    setMissions(prev => ({ ...prev, [missionId]: { ...prev[missionId], isRewarded: true } }));
    logClick('mission_reward_claim', { mission_id: missionId, reward: mission.reward });
    requestAppReview();
    return { xpGained };
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

  // ── claimPromotionReward — 프로모션(grantPromotionReward), 유저당 1회만 서버가 적립 ──
  const claimPromotionReward = async (amount: number) => {
    const { data, error } = await dbRef.current.rpc('claim_promotion_reward', {
      p_reward_amount: amount,
    });
    if (error || !data) { console.error('[claimPromotionReward] 실패:', error); return null; }
    setPoints(data.points);
    logClick('promotion_reward_claim', { amount: data.credited });
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
    if (typeof data.xp === 'number') setXp(data.xp);
    setMissions(prev => ({ ...prev, m3: { ...prev.m3, current: data.m3_current } }));
    return {
      correct: data.correct, earned: data.earned, combo: data.combo,
      points: data.points, m3Current: data.m3_current, capped: data.capped === true,
    };
  };

  // ── 상점 — 부스트 구매 (서버가 차감·검증) ──────────────────────
  const buyBoost = async (): Promise<'ok' | 'active' | 'fail'> => {
    if (boostingRef.current) return 'fail';   // 연타 가드
    boostingRef.current = true;
    try {
      const { data, error } = await dbRef.current.rpc('buy_boost');
      if (error || !data) {
        console.error('[buyBoost] 실패:', error);
        return error?.message?.includes('boost already active') ? 'active' : 'fail';
      }
      setPoints(data.points);
      setBoostUntil(new Date(data.boost_until).getTime());
      logClick('boost_buy');
      return 'ok';
    } finally { boostingRef.current = false; }
  };

  // ── 포인트 소모 (레슨 시작) — 서버가 잔고를 검증한다 ─────────────
  const spendPoints = async (amount: number, reason: string): Promise<boolean> => {
    if (!profileIdRef.current) { setPoints(p => p - amount); return true; }   // 오프라인 폴백: 로컬만
    const { data, error } = await dbRef.current.rpc('spend_points', { p_amount: amount, p_reason: reason });
    if (error || !data) { console.error('[spendPoints] 실패:', error); return false; }
    setPoints(data.points);
    logClick('points_spend', { reason, amount });
    return true;
  };

  // 서버에서만 생기는 변화(새 단어 XP, 50XP 보너스, 출석 XP, 미션 진행도)를 한 번에 다시 읽는다.
  const refreshWallet = async () => {
    const profileId = profileIdRef.current;
    if (!profileId) return;
    const { data } = await dbRef.current.from('profiles').select('points, xp, boost_until').eq('id', profileId).single();
    if (data) {
      setPoints(data.points);
      setXp(data.xp ?? 0);
      setBoostUntil(data.boost_until ? new Date(data.boost_until).getTime() : null);
    }
    await refreshMissions();
  };

  const openShop = (reason?: 'lesson') => { setShopReason(reason ?? null); setShopOpen(true); };
  const closeShop = () => setShopOpen(false);

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
      xp, boostUntil, buyBoost,
      spendPoints, refreshWallet, shopReason, shopOpen, openShop, closeShop,
      missions, setMissions,
      claimReward,
      claimReferralReward,
      claimAdReward,
      claimPromotionReward,
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
