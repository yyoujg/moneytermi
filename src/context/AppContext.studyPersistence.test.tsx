import { act, useLayoutEffect } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AppProvider, useAppContext } from './AppContext';
import { addDays } from '../lib/srs';
import { msUntilNextSlot, toDateStr } from '../lib/date';
import { MISSION_XP } from '../constants';

// 실제 Provider·SRS·응답 검증·타임아웃을 사용한다. 인증/저장소/DB/부수효과만 격리한다.
// 모든 DB 호출은 아래 허용 목록으로만 처리하며 실제 클라이언트는 가져오지 않는다.
const mocks = vi.hoisted(() => ({
  profile: 'user-a' as string | null,
  progress: [] as Record<string, unknown>[],
  profileRead: vi.fn(),
  profileUpdate: vi.fn(),
  profileUpdateEq: vi.fn(),
  profileUpdateSelect: vi.fn(),
  boost: vi.fn(),
  missionClaim: vi.fn(),
  feedback: vi.fn(),
  analytics: vi.fn(),
  upsert: vi.fn(),
  quiz: vi.fn(),
  rpc: vi.fn(),
  signals: [] as AbortSignal[],
  storage: {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
  },
}));

type DbResponse = { data: unknown; error: unknown };

vi.mock('../lib/supabase', () => {
  const query = (table: string) => {
    let columns = '';
    let updatingProfile = false;
    let write: Promise<DbResponse> | undefined;
    const result = (): Promise<DbResponse> => {
      if (write) return write;
      switch (table) {
        case 'words': return Promise.resolve({ data: [1, 2].map(id => ({
          id, word: `용어${id}`, meaning: `뜻${id}`, detailed_meaning: '',
          news_example: '', hint: '', difficulty: 1,
        })), error: null });
        case 'course_words': return Promise.resolve({ data: [], error: null });
        case 'courses': return Promise.resolve({ data: [], error: null });
        case 'mission_defs': return Promise.resolve({ data: [
          { mission_id: 'm1', title: '출석', target: 999, reward: 10, sort_order: 1 },
          { mission_id: 'm3', title: '정답', target: 999, reward: 30, sort_order: 3 },
        ], error: null });
        case 'word_progress': return Promise.resolve({ data: mocks.progress, error: null });
        case 'daily_missions': return Promise.resolve({ data: [], error: null });
        case 'attendance': return Promise.resolve({ data: [], error: null });
        case 'profiles': return columns === 'emoji'
          ? Promise.resolve({ data: { emoji: '' }, error: null })
          : mocks.profileRead();
        default: throw new Error(`허용되지 않은 DB 테이블: ${table}`);
      }
    };
    const builder = {
      select: (value: string) => {
        columns = value;
        if (updatingProfile) mocks.profileUpdateSelect(value);
        return builder;
      },
      eq: (column: string, value: unknown) => {
        if (updatingProfile) mocks.profileUpdateEq(column, value);
        return builder;
      },
      update: (payload: unknown) => {
        if (table !== 'profiles') throw new Error('허용되지 않은 갱신');
        updatingProfile = true;
        write = Promise.resolve().then(() => mocks.profileUpdate(payload));
        return builder;
      },
      order: () => builder,
      range: () => builder,
      limit: () => builder,
      single: () => builder,
      upsert: (payload: unknown, options: unknown) => {
        if (table !== 'word_progress') throw new Error('허용되지 않은 쓰기');
        write = Promise.resolve().then(() => mocks.upsert(payload, options));
        return builder;
      },
      abortSignal: (signal: AbortSignal) => { mocks.signals.push(signal); return builder; },
      then: (resolve: (value: DbResponse) => unknown, reject: (error: unknown) => unknown) => result().then(resolve, reject),
    };
    return builder;
  };
  const db = {
    from: query,
    rpc: (name: string, args?: unknown) => {
      mocks.rpc(name, args);
      if (name === 'checkin') return Promise.resolve({ data: null, error: null });
      if (name === 'buy_boost') return Promise.resolve().then(() => mocks.boost());
      if (name === 'claim_mission_reward') return Promise.resolve().then(() => mocks.missionClaim(args));
      if (name !== 'submit_quiz_answer_once') throw new Error(`허용되지 않은 RPC: ${name}`);
      const promise = Promise.resolve().then(() => mocks.quiz(args));
      return {
        abortSignal: (signal: AbortSignal) => { mocks.signals.push(signal); return promise; },
        then: promise.then.bind(promise),
      };
    },
  };
  return { supabase: db, getGuestClient: () => db };
});
vi.mock('../hooks/useAuth', () => ({ loadStoredProfile: async () => mocks.profile ? { profileId: mocks.profile } : null }));
vi.mock('../hooks/useDebouncedEffect', () => ({ useDebouncedEffect: vi.fn() }));
vi.mock('../lib/storage', () => ({ Storage: mocks.storage }));
vi.mock('../lib/energyRefill', () => ({ runEnergyRefill: async () => 'fail' }));
vi.mock('../lib/promotion', () => ({ claimPromotion: vi.fn() }));
vi.mock('../lib/analytics', () => ({ logClick: mocks.analytics }));
vi.mock('../lib/feedback', () => ({ feedbackClaim: mocks.feedback }));
vi.mock('@apps-in-toss/web-framework', () => ({ requestReview: vi.fn() }));

Object.defineProperty(globalThis, 'IS_REACT_ACT_ENVIRONMENT', { value: true, configurable: true });

type Context = ReturnType<typeof useAppContext>;
let current: Context;
let root: Root | undefined;
let container: HTMLDivElement | undefined;
let network: ReturnType<typeof vi.fn>;

function Probe() {
  const value = useAppContext();
  useLayoutEffect(() => { current = value; }, [value]);
  return null;
}

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason: unknown) => void;
  const promise = new Promise<T>((yes, no) => { resolve = yes; reject = no; });
  return { promise, resolve, reject };
}

async function mount() {
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
  await act(async () => { root!.render(<AppProvider><Probe /></AppProvider>); });
  expect(current.contentStatus).toBe('ready');
  expect(current.hydrated).toBe(true);
}

function localProgress() {
  return {
    due: current.dueQueue.map(word => word.id), next: current.nextReviewDate,
    viewed: [...current.viewedIds], known: [...current.knownIds],
    unknown: current.unknownWords.map(word => word.id),
  };
}

function wallet() {
  return { points: current.points, xp: current.xp, m3: current.missions.m3.current };
}

const valid = (overrides: Record<string, unknown> = {}) => ({
  correct: true, earned: 13, combo: 2, points: 113, xp: 27, m3_current: 2, capped: false,
  ...overrides,
});
const requestId = '10000000-0000-4000-8000-000000000001';

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2026-10-16T03:00:00Z'));
  vi.clearAllMocks();
  mocks.profile = 'user-a';
  mocks.progress = [{ word_id: 1, status: 'known', ease: 2.5, interval_d: 3, reps: 2,
    due_date: addDays(new Date(), -1), last_grade: 2 }];
  mocks.signals.length = 0;
  mocks.profileRead.mockReset().mockResolvedValue({ data: { points: 100, xp: 20, boost_until: null }, error: null });
  mocks.profileUpdate.mockReset().mockResolvedValue({ data: [], error: null });
  mocks.boost.mockReset().mockResolvedValue({ data: null, error: null });
  mocks.missionClaim.mockReset().mockResolvedValue({ data: null, error: null });
  mocks.upsert.mockReset().mockResolvedValue({ data: null, error: null });
  mocks.quiz.mockReset().mockResolvedValue({ data: valid(), error: null });
  mocks.storage.getItem.mockResolvedValue(null);
  mocks.storage.setItem.mockResolvedValue(undefined);
  mocks.storage.removeItem.mockResolvedValue(undefined);
  network = vi.fn(() => { throw new Error('테스트 중 외부 네트워크 금지'); });
  vi.stubGlobal('fetch', network);
  vi.stubGlobal('WebSocket', network);
  vi.stubGlobal('XMLHttpRequest', network);
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(async () => {
  await act(async () => { root?.unmount(); });
  root = undefined;
  container?.remove();
  expect(network).not.toHaveBeenCalled();
  vi.clearAllTimers();
  vi.useRealTimers();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('AppProvider 출석 예약 수명', () => {
  it('첫 슬롯 예약 실행 후 다시 잡힌 예약도 해제 시 취소하여 이후 16시간 동안 출석하지 않는다', async () => {
    await mount();
    const checkins = () => mocks.rpc.mock.calls.filter(([name]) => name === 'checkin');
    expect(checkins()).toHaveLength(1);

    await act(async () => { await vi.advanceTimersByTimeAsync(msUntilNextSlot() + 1000); });
    expect(checkins()).toHaveLength(2);
    expect(vi.getTimerCount()).toBeGreaterThan(0);

    await act(async () => { root!.unmount(); });
    root = undefined;
    expect(vi.getTimerCount()).toBe(0);
    await act(async () => { await vi.advanceTimersByTimeAsync(16 * 60 * 60 * 1000); });
    expect(checkins()).toHaveLength(2);
    expect(vi.getTimerCount()).toBe(0);
  });

  it('초기 자동 출석으로 출석 날짜가 갱신되어도 출석을 중복 호출하지 않는다', async () => {
    await mount();
    expect(current.ready).toBe(true);
    expect(current.attendanceDates).toEqual([toDateStr()]);
    expect(mocks.rpc.mock.calls.filter(([name]) => name === 'checkin')).toHaveLength(1);

    await act(async () => { current.setPoints(points => points + 1); });
    expect(current.attendanceDates).toEqual([toDateStr()]);
    expect(mocks.rpc.mock.calls.filter(([name]) => name === 'checkin')).toHaveLength(1);
  });
});

describe('AppProvider 복습 저장 확정', () => {
  it.each(['DB 오류', '요청 거절'] as const)('%s이면 진도를 유지하고 재시도 성공을 한 번만 반영한다', async failure => {
    await mount();
    expect(current.ready).toBe(true);
    expect(localProgress().due).toEqual([1]);
    const before = localProgress();
    if (failure === 'DB 오류') mocks.upsert.mockResolvedValueOnce({ data: null, error: { message: '저장 실패' } });
    else mocks.upsert.mockRejectedValueOnce(new Error('연결 실패'));
    let saved: boolean | undefined;
    await act(async () => { saved = await current.recordReview(1, true, false); });
    expect(saved).toBe(false);
    expect(localProgress()).toEqual(before);
    await act(async () => { saved = await current.recordReview(1, true, false); });
    expect(saved).toBe(true);
    expect(mocks.upsert).toHaveBeenCalledTimes(2);
    const first = mocks.upsert.mock.calls[0][0];
    expect(mocks.upsert.mock.calls[1][0]).toEqual(first);
    expect(first).toMatchObject({ user_id: 'user-a', word_id: 1, status: 'known',
      reps: 3, interval_d: 8, ease: 2.5, last_grade: 2, due_date: addDays(new Date(), 8) });
    expect(current.dueQueue).toEqual([]);
    expect(current.nextReviewDate).toBe(addDays(new Date(), 8));
    expect([...current.knownIds]).toEqual(before.known);
  });

  it('프로필이 없으면 쓰지 않고 false를 반환하며 로컬 진도를 보존한다', async () => {
    mocks.profile = null;
    await mount();
    const before = localProgress();
    let saved: boolean | undefined;
    await act(async () => { saved = await current.recordReview(1, true, false); });
    expect(saved).toBe(false);
    expect(localProgress()).toEqual(before);
    expect(mocks.upsert).not.toHaveBeenCalled();
  });

  it('DB 응답 전에는 낙관적으로 복습 큐나 다음 일정을 바꾸지 않는다', async () => {
    await mount();
    const before = localProgress();
    const response = deferred<DbResponse>();
    mocks.upsert.mockReturnValueOnce(response.promise);
    let pending!: Promise<boolean>;
    await act(async () => { pending = current.recordReview(1, true, true); });
    expect(localProgress()).toEqual(before);
    let saved: boolean | undefined;
    await act(async () => { response.resolve({ data: null, error: null }); saved = await pending; });
    expect(saved).toBe(true);
    expect(current.dueQueue).toEqual([]);
    expect(mocks.upsert.mock.calls[0][0]).toMatchObject({ last_grade: 1, reps: 3, interval_d: 5, ease: 2.35 });
  });

  it('첫 오답 저장 실패의 같은 결과 재시도는 등급·일정을 이중 누적하지 않는다', async () => {
    await mount();
    mocks.upsert.mockRejectedValueOnce(new Error('응답 유실'));
    let saved: boolean | undefined;
    await act(async () => { saved = await current.recordReview(1, false, false); });
    expect(saved).toBe(false);
    await act(async () => { saved = await current.recordReview(1, false, false); });
    expect(saved).toBe(true);
    expect(mocks.upsert.mock.calls[1]).toEqual(mocks.upsert.mock.calls[0]);
    expect(mocks.upsert.mock.calls[1][0]).toMatchObject({
      ease: 2.3, interval_d: 0, reps: 0, last_grade: 0, status: 'unknown', due_date: addDays(new Date(), 0),
    });
    expect(current.dueQueue.map(word => word.id)).toEqual([1]);
    expect(current.nextReviewDate).toBeNull();
  });

  it('15초 초과면 false이며 늦게 성공해도 진도가 바뀌지 않는다', async () => {
    await mount();
    const before = localProgress();
    const response = deferred<DbResponse>();
    mocks.upsert.mockReturnValueOnce(response.promise);
    let pending!: Promise<boolean>;
    await act(async () => { pending = current.recordReview(1, true, false); });
    const signal = mocks.signals.at(-1)!;
    await act(async () => { await vi.advanceTimersByTimeAsync(15_000); });
    expect(await pending).toBe(false);
    expect(signal.aborted).toBe(true);
    await act(async () => { response.resolve({ data: null, error: null }); });
    expect(localProgress()).toEqual(before);
  });
});

describe('AppProvider 퀴즈 저장 확정', () => {
  it.each([true, false])('새 RPC에 안정된 요청 ID와 6인수를 보내고 서버 정오답(%s)·보상만 반영한다', async correct => {
    await mount();
    const data = valid({ correct, earned: correct ? 13 : 0, combo: correct ? 2 : 0, points: correct ? 113 : 100, xp: 27 });
    mocks.quiz.mockResolvedValue({ data, error: null });
    let result: Awaited<ReturnType<Context['submitQuizAnswer']>> | undefined;
    await act(async () => { result = await current.submitQuizAnswer(1, '서버 채점 대상', 'typed', true, false, requestId); });
    expect(mocks.rpc).toHaveBeenCalledWith('submit_quiz_answer_once', {
      p_word_id: 1, p_answer: '서버 채점 대상', p_mode: 'typed',
      p_used_hint: true, p_session_start: false, p_request_id: requestId,
    });
    expect(result).toEqual({ correct, earned: data.earned, combo: data.combo, points: data.points,
      xp: 27, m3Current: 2, capped: false });
    expect(wallet()).toEqual({ points: data.points, xp: 27, m3: 2 });
    expect(mocks.signals.at(-1)?.aborted).toBe(false);
    expect(mocks.upsert).not.toHaveBeenCalled();
  });

  it('응답 거절 후 같은 요청 ID 재전송은 성공 보상을 한 번만 적용한다', async () => {
    await mount();
    mocks.quiz.mockRejectedValueOnce(new Error('응답 유실'));
    await act(async () => { expect(await current.submitQuizAnswer(1, '용어1', 'mc', false, true, requestId)).toBeNull(); });
    expect(wallet()).toEqual({ points: 100, xp: 20, m3: 0 });
    await act(async () => { await current.submitQuizAnswer(1, '용어1', 'mc', false, true, requestId); });
    await act(async () => { await current.submitQuizAnswer(1, '용어1', 'mc', false, true, requestId); });
    expect(wallet()).toEqual({ points: 113, xp: 27, m3: 2 });
    const calls = mocks.rpc.mock.calls.filter(([name]) => name === 'submit_quiz_answer_once');
    expect(calls).toHaveLength(3);
    expect(calls[1]).toEqual(calls[0]);
    expect(calls[2]).toEqual(calls[0]);
  });

  it('ID 생략 시 새 요청 ID를 생성한다', async () => {
    await mount();
    await act(async () => { await current.submitQuizAnswer(1, '용어1', 'mc', false, true); });
    const args = mocks.rpc.mock.calls.find(([name]) => name === 'submit_quiz_answer_once')![1];
    expect(args.p_request_id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
  });

  it.each([
    ['null', null], ['빈 객체', {}], ['정오답 문자열', valid({ correct: 'true' })],
    ['잘못된 상한 플래그', valid({ capped: 0 })], ['보상 누락', { ...valid(), earned: undefined }],
    ['음수 보상', valid({ earned: -1 })], ['비정상 포인트', valid({ points: NaN })],
    ['문자열 XP', valid({ xp: '99' })], ['소수 콤보', valid({ combo: 1.5 })],
    ['안전 정수 초과', valid({ points: Number.MAX_SAFE_INTEGER + 1 })],
    ['음수 미션 진도', valid({ m3_current: -1 })],
  ])('%s 응답은 null이며 지갑과 미션을 바꾸지 않는다', async (_label, data) => {
    await mount();
    const before = wallet();
    mocks.quiz.mockResolvedValueOnce({ data, error: null });
    await act(async () => { expect(await current.submitQuizAnswer(1, '용어1', 'mc', false, false, requestId)).toBeNull(); });
    expect(wallet()).toEqual(before);
  });

  it.each(['DB 오류', '요청 거절'] as const)('%s면 지갑과 미션을 바꾸지 않는다', async failure => {
    await mount();
    const before = wallet();
    if (failure === 'DB 오류') mocks.quiz.mockResolvedValueOnce({ data: valid(), error: { message: '저장 실패' } });
    else mocks.quiz.mockRejectedValueOnce(new Error('연결 실패'));
    await act(async () => { expect(await current.submitQuizAnswer(1, '용어1', 'mc', false, false, requestId)).toBeNull(); });
    expect(wallet()).toEqual(before);
  });

  it('15초까지 응답이 없으면 null이며 타임아웃 후 늦은 응답도 무시한다', async () => {
    await mount();
    const before = wallet();
    const response = deferred<DbResponse>();
    mocks.quiz.mockReturnValueOnce(response.promise);
    let pending!: ReturnType<Context['submitQuizAnswer']>;
    let settled = false;
    await act(async () => {
      pending = current.submitQuizAnswer(1, '용어1', 'mc', false, false, requestId);
      void pending.then(() => { settled = true; });
    });
    const signal = mocks.signals.at(-1)!;
    await act(async () => { await vi.advanceTimersByTimeAsync(14_999); });
    expect(settled).toBe(false);
    expect(wallet()).toEqual(before);
    await act(async () => { await vi.advanceTimersByTimeAsync(1); });
    expect(await pending).toBeNull();
    expect(signal.aborted).toBe(true);
    await act(async () => { response.resolve({ data: valid(), error: null }); });
    expect(wallet()).toEqual(before);
  });

  it('프로필이 없으면 RPC를 호출하지 않는다', async () => {
    mocks.profile = null;
    await mount();
    await act(async () => { expect(await current.submitQuizAnswer(1, '용어1', 'mc', false, false, requestId)).toBeNull(); });
    expect(mocks.rpc).not.toHaveBeenCalled();
    expect(wallet()).toEqual({ points: 0, xp: 0, m3: 0 });
  });
});

describe('AppProvider 사용자 전환 중 늦은 응답', () => {
  it('초기 프로필 재시도로 사용자가 바뀐 뒤 이전 사용자의 지갑·SRS 응답을 버린다', async () => {
    // 공개 사용자 전환 API가 없어 초기 PGRST116 복구 경로로 같은 Provider의 ref 변경을 검증한다.
    const initialProfile = deferred<DbResponse>();
    mocks.profileRead.mockReturnValueOnce(initialProfile.promise);
    await mount();
    expect(current.ready).toBe(false);
    const quizResponse = deferred<DbResponse>();
    const reviewResponse = deferred<DbResponse>();
    mocks.quiz.mockReturnValueOnce(quizResponse.promise);
    mocks.upsert.mockReturnValueOnce(reviewResponse.promise);
    let quizPending!: ReturnType<Context['submitQuizAnswer']>;
    let reviewPending!: Promise<boolean>;
    await act(async () => {
      quizPending = current.submitQuizAnswer(1, '용어1', 'mc', false, false, requestId);
      reviewPending = current.recordReview(1, true, false);
    });
    mocks.profile = 'user-b';
    mocks.progress = [];
    mocks.profileRead.mockResolvedValue({ data: { points: 700, xp: 80 }, error: null });
    await act(async () => { initialProfile.resolve({ data: null, error: { code: 'PGRST116' } }); });
    await act(async () => { await vi.advanceTimersByTimeAsync(300); });
    expect(current.ready).toBe(true);
    expect(wallet()).toEqual({ points: 700, xp: 80, m3: 0 });
    const before = localProgress();
    let quizResult: unknown;
    let reviewResult: unknown;
    await act(async () => {
      quizResponse.resolve({ data: valid({ points: 999, xp: 999 }), error: null });
      reviewResponse.resolve({ data: null, error: null });
      [quizResult, reviewResult] = await Promise.all([quizPending, reviewPending]);
    });
    expect(quizResult).toBeNull();
    expect(reviewResult).toBe(false);
    expect(wallet()).toEqual({ points: 700, xp: 80, m3: 0 });
    expect(localProgress()).toEqual(before);
  });
});


// 저장 결과 계약 회귀: 실제 AppProvider를 유지하고 외부 DB 허용 목록만 확장한다.
const boostData = () => ({ points: 40, boost_until: '2026-10-16T04:00:00Z' });
const boostWallet = () => ({ points: current.points, xp: current.xp, boostUntil: current.boostUntil });
const rpcCalls = (name: string) => mocks.rpc.mock.calls.filter(([called]) => called === name);

async function completeQuizMission() {
  await act(async () => {
    current.setMissions(prev => ({ ...prev, m3: { ...prev.m3, current: prev.m3.target } }));
  });
}

describe('AppProvider 이모지 저장 결과 계약', () => {
  it('profiles 갱신 행 확인 전에는 기존값을 유지하고 성공 후에만 true와 새 값을 반영한다', async () => {
    await mount();
    const before = current.myEmoji;
    const response = deferred<DbResponse>();
    mocks.profileUpdate.mockReturnValueOnce(response.promise);
    let pending!: ReturnType<Context['updateMyEmoji']>;
    let settled = false;
    await act(async () => {
      pending = current.updateMyEmoji('새 프로필 표시');
      void pending.then(() => { settled = true; });
    });
    expect(settled).toBe(false);
    expect(current.myEmoji).toBe(before);
    expect(mocks.profileUpdate).toHaveBeenCalledExactlyOnceWith({ emoji: '새 프로필 표시' });
    expect(mocks.profileUpdateEq).toHaveBeenCalledExactlyOnceWith('id', 'user-a');
    expect(mocks.profileUpdateSelect).toHaveBeenCalledExactlyOnceWith('id');
    await act(async () => {
      response.resolve({ data: [{ id: 'user-a' }], error: null });
      expect(await pending).toBe(true);
    });
    expect(current.myEmoji).toBe('새 프로필 표시');
  });

  it.each(['DB 오류', '요청 거절', '0행', '응답 누락'] as const)('%s이면 false이고 기존값을 유지하며 재시도할 수 있다', async failure => {
    await mount();
    const before = current.myEmoji;
    if (failure === '요청 거절') mocks.profileUpdate.mockRejectedValueOnce(new Error('연결 실패'));
    else mocks.profileUpdate.mockResolvedValueOnce({
      data: failure === 'DB 오류' ? [{ id: 'user-a' }] : failure === '0행' ? [] : null,
      error: failure === 'DB 오류' ? { message: '갱신 실패' } : null,
    });
    await act(async () => { expect(await current.updateMyEmoji('새 프로필 표시')).toBe(false); });
    expect(current.myEmoji).toBe(before);
    mocks.profileUpdate.mockResolvedValueOnce({ data: [{ id: 'user-a' }], error: null });
    await act(async () => { expect(await current.updateMyEmoji('새 프로필 표시')).toBe(true); });
    expect(current.myEmoji).toBe('새 프로필 표시');
    expect(mocks.profileUpdate).toHaveBeenCalledTimes(2);
  });

  it('프로필이 없으면 false이고 갱신 요청 없이 기존값을 유지한다', async () => {
    mocks.profile = null;
    await mount();
    const before = current.myEmoji;
    await act(async () => { expect(await current.updateMyEmoji('새 프로필 표시')).toBe(false); });
    expect(current.myEmoji).toBe(before);
    expect(mocks.profileUpdate).not.toHaveBeenCalled();
    expect(mocks.profileUpdateEq).not.toHaveBeenCalled();
    expect(mocks.profileUpdateSelect).not.toHaveBeenCalled();
  });
});

describe('AppProvider 부스트 구매 결과 계약', () => {
  it('진행 중 재요청은 pending이며 추가 호출·낙관적 갱신 없이 성공 지갑만 반영한다', async () => {
    await mount();
    const before = boostWallet();
    const response = deferred<DbResponse>();
    mocks.boost.mockReturnValueOnce(response.promise);
    let pending!: ReturnType<Context['buyBoost']>;
    const initialBuy = current.buyBoost;
    await act(async () => { pending = initialBuy(); });
    await act(async () => {
      expect(await current.buyBoost()).toBe('pending');
      expect(await initialBuy()).toBe('pending');
    });
    expect(rpcCalls('buy_boost')).toHaveLength(1);
    expect(boostWallet()).toEqual(before);
    expect(mocks.analytics).not.toHaveBeenCalledWith('boost_buy');
    const data = boostData();
    await act(async () => {
      response.resolve({ data, error: null });
      expect(await pending).toBe('ok');
    });
    expect(boostWallet()).toEqual({ points: data.points, xp: before.xp, boostUntil: Date.parse(data.boost_until) });
    expect(mocks.analytics.mock.calls.filter(([name]) => name === 'boost_buy')).toHaveLength(1);
  });

  it.each([
    ['명시 포인트 부족', 'insufficient points', 'points'],
    ['이미 활성화됨', 'boost already active', 'active'],
    ['일반 서버 오류', 'server unavailable', 'fail'],
    ['통신 오류', 'Failed to fetch', 'fail'],
    ['인증 오류', 'permission denied', 'fail'],
    ['모호한 포인트 오류', 'points service unavailable', 'fail'],
  ] as const)('%s는 %s 오류에서 %s를 반환하고 지갑을 보존한다', async (_label, message, expected) => {
    await mount();
    const before = boostWallet();
    mocks.boost.mockResolvedValueOnce({ data: boostData(), error: { message } });
    await act(async () => { expect(await current.buyBoost()).toBe(expected); });
    expect(boostWallet()).toEqual(before);
    expect(mocks.analytics).not.toHaveBeenCalledWith('boost_buy');
    mocks.boost.mockResolvedValueOnce({ data: boostData(), error: null });
    await act(async () => { expect(await current.buyBoost()).toBe('ok'); });
    expect(rpcCalls('buy_boost')).toHaveLength(2);
  });

  it('요청이 throw되어도 fail이고 지갑을 보존하며 잠금 해제 후 재시도할 수 있다', async () => {
    await mount();
    const before = boostWallet();
    mocks.boost.mockRejectedValueOnce(new Error('insufficient points: 연결 예외는 잔액 부족으로 확정하지 않음'));
    await act(async () => { expect(await current.buyBoost()).toBe('fail'); });
    expect(boostWallet()).toEqual(before);
    mocks.boost.mockResolvedValueOnce({ data: boostData(), error: null });
    await act(async () => { expect(await current.buyBoost()).toBe('ok'); });
    expect(rpcCalls('buy_boost')).toHaveLength(2);
  });

  it.each([
    ['null', null], ['빈 객체', {}], ['문자열', 'ok'],
    ['포인트 누락', { boost_until: boostData().boost_until }],
    ['문자열 포인트', { ...boostData(), points: '40' }],
    ['음수 포인트', { ...boostData(), points: -1 }],
    ['소수 포인트', { ...boostData(), points: 1.5 }],
    ['비정상 포인트', { ...boostData(), points: NaN }],
    ['안전 정수 초과', { ...boostData(), points: Number.MAX_SAFE_INTEGER + 1 }],
    ['만료 시각 누락', { points: 40 }],
    ['잘못된 만료 시각', { ...boostData(), boost_until: 'not-a-date' }],
    ['숫자 만료 시각', { ...boostData(), boost_until: Date.now() }],
  ])('%s 응답은 fail이고 지갑·부스트를 바꾸지 않는다', async (_label, data) => {
    await mount();
    const before = boostWallet();
    mocks.boost.mockResolvedValueOnce({ data, error: null });
    await act(async () => { expect(await current.buyBoost()).toBe('fail'); });
    expect(boostWallet()).toEqual(before);
    expect(mocks.analytics).not.toHaveBeenCalledWith('boost_buy');
  });
});


describe('AppProvider 미션 보상 수령 결과 계약', () => {
  it('미달성·없는 미션은 null이며 수령 중 집합이 비어 있고 RPC를 보내지 않는다', async () => {
    await mount();
    expect(current.claimingMissionIds).toBeInstanceOf(Set);
    expect([...current.claimingMissionIds]).toEqual([]);
    await act(async () => {
      expect(await current.claimReward('m3')).toBeNull();
      expect(await current.claimReward('없는 미션')).toBeNull();
    });
    expect(rpcCalls('claim_mission_reward')).toHaveLength(0);
    expect(current.missionRewards).toEqual([]);
  });

  it('자동 수령 중 수동·효과 재실행은 pending이며 추가 RPC와 중복 축하 없이 성공한다', async () => {
    await mount();
    const before = boostWallet();
    const response = deferred<DbResponse>();
    mocks.missionClaim.mockReturnValueOnce(response.promise);
    await completeQuizMission();
    expect([...current.claimingMissionIds]).toEqual(['m3']);
    const pendingIds = current.claimingMissionIds;
    const initialClaim = current.claimReward;
    expect(current.missions.m3.isRewarded).toBe(false);
    expect(boostWallet()).toEqual(before);
    expect(current.missionRewards).toEqual([]);
    expect(mocks.feedback).not.toHaveBeenCalled();
    await act(async () => {
      expect(await initialClaim('m3')).toBe('pending');
      expect(await current.claimReward('m3')).toBe('pending');
      // missions 의존 효과가 다시 실행되어도 동일 보상은 이미 진행 중이다.
      current.setMissions(prev => ({ ...prev, m1: { ...prev.m1, current: 2 } }));
    });
    expect(rpcCalls('claim_mission_reward')).toHaveLength(1);
    expect(mocks.missionClaim).toHaveBeenCalledExactlyOnceWith({ p_mission_id: 'm3', p_date: toDateStr() });
    expect(current.missionRewards).toEqual([]);
    expect(mocks.feedback).not.toHaveBeenCalled();
    await act(async () => { response.resolve({ data: { points: 130, xp: 37 }, error: null }); });
    expect(boostWallet()).toEqual({ points: 130, xp: 37, boostUntil: before.boostUntil });
    expect(current.missions.m3.isRewarded).toBe(true);
    expect([...current.claimingMissionIds]).toEqual([]);
    expect(current.claimingMissionIds).not.toBe(pendingIds);
    expect([...pendingIds]).toEqual(['m3']);
    expect(current.missionRewards).toEqual([{ points: 30, xp: 17, source: 'mission' }]);
    expect(mocks.feedback).toHaveBeenCalledTimes(1);
    expect(mocks.analytics.mock.calls.filter(([name]) => name === 'mission_reward_claim')).toHaveLength(1);
    await act(async () => { expect(await current.claimReward('m3')).toBeNull(); });
    expect(rpcCalls('claim_mission_reward')).toHaveLength(1);
    expect(mocks.feedback).toHaveBeenCalledTimes(1);
    expect(current.missionRewards).toHaveLength(1);
  });

  it.each(['DB 오류', '요청 거절', '응답 누락'] as const)('자동 수령 %s 뒤 잠금을 해제하고 수동 실패는 null, 수동 재시도는 성공한다', async failure => {
    await mount();
    const before = boostWallet();
    if (failure === '요청 거절') mocks.missionClaim.mockRejectedValue(new Error('연결 실패'));
    else mocks.missionClaim.mockResolvedValue({
      data: failure === 'DB 오류' ? { points: 999, xp: 999 } : null,
      error: failure === 'DB 오류' ? { message: '저장 실패' } : null,
    });
    await completeQuizMission();
    expect(rpcCalls('claim_mission_reward')).toHaveLength(1);
    expect([...current.claimingMissionIds]).toEqual([]);
    expect(current.missions.m3.isRewarded).toBe(false);
    expect(boostWallet()).toEqual(before);
    expect(current.missionRewards).toEqual([]);
    expect(mocks.feedback).not.toHaveBeenCalled();
    await act(async () => { expect(await current.claimReward('m3')).toBeNull(); });
    expect(rpcCalls('claim_mission_reward')).toHaveLength(2);
    expect([...current.claimingMissionIds]).toEqual([]);
    expect(boostWallet()).toEqual(before);
    mocks.missionClaim.mockResolvedValueOnce({ data: { points: 130, xp: 37 }, error: null });
    await act(async () => { expect(await current.claimReward('m3')).toEqual({ xpGained: 17 }); });
    expect(rpcCalls('claim_mission_reward')).toHaveLength(3);
    expect([...current.claimingMissionIds]).toEqual([]);
    expect(current.missions.m3.isRewarded).toBe(true);
    expect(boostWallet()).toEqual({ points: 130, xp: 37, boostUntil: before.boostUntil });
    // 수동 수령은 호출자가 축하를 담당하고 자동 축하 대기열을 중복 추가하지 않는다.
    expect(current.missionRewards).toEqual([]);
    expect(mocks.feedback).not.toHaveBeenCalled();
  });

  it.each([
    ['서버 XP 차이', { points: 130, xp: 37 }, 17, 37],
    ['차이 하한 0', { points: 130, xp: 12 }, 0, 12],
    ['동일 XP', { points: 130, xp: 20 }, 0, 20],
    ['XP 누락의 기존 기본 보상', { points: 130 }, MISSION_XP, 20 + MISSION_XP],
  ])('%s의 기존 지급 공식을 유지한다', async (_label, data, xpGained, finalXp) => {
    mocks.profileRead.mockResolvedValue({ data: { points: 100, xp: 20, boost_until: boostData().boost_until }, error: null });
    await mount();
    const beforeBoost = current.boostUntil;
    // 최초 자동 수령만 실패시켜 다음 호출의 반환값을 수동으로 검사한다.
    mocks.missionClaim.mockResolvedValueOnce({ data: null, error: { message: '아직 서버에 진행도 미반영' } });
    await completeQuizMission();
    mocks.missionClaim.mockResolvedValueOnce({ data, error: null });
    await act(async () => { expect(await current.claimReward('m3')).toEqual({ xpGained }); });
    expect(current.xp).toBe(finalXp);
    expect(current.points).toBe(130);
    expect(current.boostUntil).toBe(beforeBoost);
    expect(current.missions.m3.reward).toBe(30);
    expect(current.missions.m3.isRewarded).toBe(true);
    expect([...current.claimingMissionIds]).toEqual([]);
    expect(rpcCalls('claim_mission_reward')).toHaveLength(2);
  });
});
