import { afterEach, describe, expect, it, vi } from 'vitest';
import { createQuizRequestId, parseQuizAnswerResult, withStudyRequestTimeout } from './quizSubmission';

const response = { correct: true, earned: 10, combo: 1, points: 20, xp: 2, m3_current: 1, capped: false };

afterEach(() => { vi.useRealTimers(); vi.unstubAllGlobals(); });

describe('답안 요청 식별자', () => {
  it('서로 다른 요청에 서로 다른 표준 식별자를 만든다', () => {
    const first = createQuizRequestId();
    expect(first).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
    expect(createQuizRequestId()).not.toBe(first);
  });
  it('표준 생성 함수가 없는 환경에서도 안전한 난수로 형식을 유지한다', () => {
    vi.stubGlobal('crypto', { getRandomValues: (bytes: Uint8Array) => { bytes.fill(255); return bytes; } });
    expect(createQuizRequestId()).toBe('ffffffff-ffff-4fff-bfff-ffffffffffff');
  });
});

describe('서버 채점 응답 검증', () => {
  it('서버의 정오답과 지급값을 그대로 전달한다', () => {
    expect(parseQuizAnswerResult(response)).toEqual({ correct: true, earned: 10, combo: 1, points: 20, xp: 2, m3Current: 1, capped: false });
    expect(parseQuizAnswerResult({ ...response, correct: false, earned: 0, combo: 0 })).toMatchObject({ correct: false, earned: 0, combo: 0 });
  });
  it.each([null, {}, { ...response, correct: undefined }, { ...response, correct: 'true' }, { ...response, capped: undefined },
    { ...response, earned: -1 }, { ...response, points: NaN }, { ...response, xp: Infinity }, { ...response, combo: 1.5 },
    { ...response, m3_current: '1' }, { ...response, points: Number.MAX_SAFE_INTEGER + 1 },
  ])('누락·비정상 응답으로 성적이나 보상을 확정하지 않는다: %j', data => {
    expect(parseQuizAnswerResult(data)).toBeNull();
  });
});

describe('학습 저장 제한 시간', () => {
  it('성공 응답은 전달하고 대기 타이머를 정리한다', async () => {
    vi.useFakeTimers();
    expect(await withStudyRequestTimeout(() => Promise.resolve(response))).toBe(response);
    expect(vi.getTimerCount()).toBe(0);
  });
  it('실패도 전달하고 대기 타이머를 정리한다', async () => {
    vi.useFakeTimers();
    await expect(withStudyRequestTimeout(() => Promise.reject(new Error('연결 끊김')))).rejects.toThrow('연결 끊김');
    expect(vi.getTimerCount()).toBe(0);
  });
  it('전송이 멈추면 중단 신호와 오류를 반환하며 늦은 성공은 반영하지 않는다', async () => {
    vi.useFakeTimers();
    let signal: AbortSignal | undefined;
    let resolve!: (value: typeof response) => void;
    const request = withStudyRequestTimeout(value => { signal = value; return new Promise<typeof response>(done => { resolve = done; }); }, 100);
    const rejected = expect(request).rejects.toThrow('응답 시간이 초과');
    await vi.advanceTimersByTimeAsync(100);
    await rejected;
    expect(signal?.aborted).toBe(true);
    resolve(response);
    await Promise.resolve();
    expect(vi.getTimerCount()).toBe(0);
  });
  it('동기 예외도 대기 타이머를 남기지 않는다', async () => {
    vi.useFakeTimers();
    await expect(withStudyRequestTimeout(() => { throw new Error('요청 생성 실패'); })).rejects.toThrow('요청 생성 실패');
    expect(vi.getTimerCount()).toBe(0);
  });
});
