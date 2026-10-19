export type QuizAnswerResult = {
  correct: boolean;
  earned: number;
  combo: number;
  points: number;
  xp: number;
  m3Current: number;
  capped: boolean;
};

// 한 문제의 저장 재시도에는 같은 키를 쓴다. 다음 문제는 새 키를 만든다.
export const createQuizRequestId = (): string => {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  const bytes = new Uint8Array(16);
  globalThis.crypto.getRandomValues(bytes);
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
};

export const parseQuizAnswerResult = (data: unknown): QuizAnswerResult | null => {
  if (!data || typeof data !== 'object') return null;
  const value = data as Record<string, unknown>;
  if (typeof value.correct !== 'boolean' || typeof value.capped !== 'boolean') return null;
  const counts = ['earned', 'combo', 'points', 'xp', 'm3_current'] as const;
  if (counts.some(key => typeof value[key] !== 'number' || !Number.isSafeInteger(value[key]) || (value[key] as number) < 0)) return null;
  return {
    correct: value.correct,
    earned: value.earned as number,
    combo: value.combo as number,
    points: value.points as number,
    xp: value.xp as number,
    m3Current: value.m3_current as number,
    capped: value.capped,
  };
};

// 응답이 영원히 대기하거나 늦게 도착해 현재 화면을 덮지 않게 한다.
// 서버에서 이미 처리됐을 수 있으므로 호출자는 같은 요청 키로 재시도해야 한다.
export const withStudyRequestTimeout = async <T>(
  request: (signal: AbortSignal) => PromiseLike<T>,
  timeoutMs = 15_000,
): Promise<T> => {
  const controller = new AbortController();
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      Promise.resolve().then(() => request(controller.signal)),
      new Promise<never>((_, reject) => {
        timer = setTimeout(() => {
          controller.abort();
          reject(new Error('학습 기록 저장 응답 시간이 초과됐어요.'));
        }, timeoutMs);
      }),
    ]);
  } finally {
    if (timer !== undefined) clearTimeout(timer);
  }
};
