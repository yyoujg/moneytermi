import { act, type ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Word } from '../types';
import QuizScreen from './QuizScreen';
import HomeScreen from './HomeScreen';
import { LeagueRules } from '../components/LeagueRules';
import { MISSION_XP } from '../constants';
import { logClick } from '../lib/analytics';
import { shouldScheduleRetry } from '../lib/review';
import type { QuizAnswerResult } from '../lib/quizSubmission';

const state = vi.hoisted(() => ({
  claimReward: vi.fn(),
  recordReview: vi.fn(),
  submitQuizAnswer: vi.fn(),
  refreshWallet: vi.fn(),
  shareTossLink: vi.fn(),
}));

vi.mock('../lib/quiz', () => ({
  pickQuizType: vi.fn(() => 'meaning-to-term'),
  buildQuizItem: vi.fn((_type: string, currentWord: Word) => ({
    promptLabel: '뜻을 보고 용어를 고르세요',
    promptMain: currentWord.meaning,
    options: [
      { label: currentWord.word, answer: currentWord.word, isCorrect: true },
      { label: '오답', answer: '오답', isCorrect: false },
    ],
  })),
}));
vi.mock('../context/AppContext', () => ({
  useAppContext: () => ({
    xp: 0,
    hydrated: true,
    unknownWords: [],
    attendanceDates: [],
    dueQueue: [],
    myEmoji: '',
    claimReward: state.claimReward,
    missions: { m1: { id: 'm1', title: '테스트 미션', current: 1, target: 1, reward: 37, isRewarded: false, sortOrder: 1 } },
    allWords: [1, 2].map(id => ({ id, word: `용어${id}`, meaning: `뜻${id}`, detailedMeaning: '', newsExample: '', hint: '', difficulty: 1 })),
    knownWords: [1, 2].map(id => ({ id, word: `용어${id}`, meaning: `뜻${id}`, detailedMeaning: '', newsExample: '', hint: '', difficulty: 1 })),
    courses: [],
    submitQuizAnswer: state.submitQuizAnswer,
    recordReview: state.recordReview,
    refreshWallet: state.refreshWallet,
  }),
}));
// 숫자 애니메이션은 제외하고 화면에 전달된 서버 보상 합계를 검증한다.
vi.mock('../hooks/useCountUp', () => ({ useCountUp: (value: number) => value }));
vi.mock('../hooks/useAuth', () => ({ useAuth: () => ({ user: null }) }));
vi.mock('../lib/pathProgress', () => ({ markNodeDone: vi.fn() }));
vi.mock('../lib/feedback', () => ({
  feedbackClaim: vi.fn(),
  feedbackError: vi.fn(),
  feedbackCorrect: vi.fn(),
  feedbackWrong: vi.fn(),
  feedbackQuizComplete: vi.fn(),
  feedbackTierUp: vi.fn(),
}));
vi.mock('../lib/review', async importOriginal => {
  const actual = await importOriginal<typeof import('../lib/review')>();
  return { ...actual, shouldScheduleRetry: vi.fn(actual.shouldScheduleRetry) };
});
vi.mock('../lib/analytics', () => ({ logClick: vi.fn() }));
vi.mock('../lib/share', () => ({ shareTossLink: (...args: unknown[]) => state.shareTossLink(...args) }));

Object.defineProperty(globalThis, 'IS_REACT_ACT_ENVIRONMENT', { value: true, configurable: true });

function word(id: number): Word {
  return {
    id,
    word: `용어${id}`,
    meaning: `뜻${id}`,
    detailedMeaning: '',
    newsExample: '',
    hint: '',
    difficulty: 1,
  };
}

let cleanup = () => {};
afterEach(() => cleanup());

const mount = async (extraState: Record<string, unknown> = {}, screen: ReactNode = <QuizScreen />) => {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);
  await act(async () => {
    root.render(
      <MemoryRouter initialEntries={[{ pathname: '/quiz', state: { quizQueue: [word(1), word(2)], reviewMode: true, backPath: '/course', ...extraState } }]}>
        <Routes>
          <Route path="/quiz" element={screen} />
          <Route path="/course" element={<div>코스 화면</div>} />
        </Routes>
      </MemoryRouter>,
    );
  });
  cleanup = () => { act(() => root.unmount()); container.remove(); };
  const click = async (text: string) => {
    const button = [...container.querySelectorAll('button')].find(el => el.textContent?.includes(text));
    expect(button, `버튼: ${text}`).toBeDefined();
    const isOption = button!.classList.contains('quiz-option');
    await act(async () => {
      button!.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });
    // 기존 채점 후 흐름 검사는 선택과 확정을 함께 진행한다. 선택 단계는 아래 choose로 별도 검사한다.
    if (isOption) {
      const confirm = [...container.querySelectorAll('button')].find(el => el.textContent === '정답 확인')!;
      await act(async () => { confirm.click(); });
    }
  };
  const choose = async (text: string) => {
    const button = [...container.querySelectorAll<HTMLButtonElement>('.quiz-option')].find(el => el.textContent?.includes(text))!;
    await act(async () => { button.click(); });
  };
  return { container, click, choose };
};

const quizResult = (overrides: Partial<QuizAnswerResult> = {}): QuizAnswerResult => ({ correct: true, combo: 1, earned: 0, capped: false, points: 0, xp: 0, m3Current: 0, ...overrides });

beforeEach(() => {
  vi.clearAllMocks();
  state.claimReward = vi.fn(() => Promise.resolve({ xpGained: MISSION_XP }));
  state.recordReview = vi.fn(() => Promise.resolve(true));
  state.submitQuizAnswer = vi.fn((id: number, answer: string) => Promise.resolve(quizResult({ correct: answer === `용어${id}`, combo: answer === `용어${id}` ? 1 : 0 })));
  state.refreshWallet = vi.fn(() => Promise.resolve());
  state.shareTossLink = vi.fn(() => Promise.resolve());
});

describe('QuizScreen review SRS', () => {
  it('재시도 정답을 첫 시도 성과에 합치지 않고 복습 종류를 기록한다', async () => {
    const { container, click } = await mount({ mode: 'lesson_warmup', lessonId: 'c1-l0', courseId: 'c1' });
    await click('오답');
    await click('다음 문제');
    await click('용어2');
    await click('다음 문제');
    await click('용어1');
    await click('결과 보기');
    expect(container.textContent).toContain('50%');
    expect(logClick).toHaveBeenCalledWith('quiz_complete', expect.objectContaining({ mode: 'lesson_warmup', total: 2, correct: 1, attempts: 3, node_id: 'c1-l0', course_id: 'c1' }));
  });
  it('첫 오답만 SRS에 기록하고 재정답은 같은 세션에서 다시 성공 기록하지 않는다', async () => {
    const { click } = await mount();

    await click('오답');
    await click('다음 문제');
    await click('용어2');
    await click('다음 문제');
    await click('용어1');

    expect(state.recordReview).toHaveBeenCalledTimes(2);
    expect(state.recordReview).toHaveBeenNthCalledWith(1, 1, false, false);
    expect(state.recordReview).toHaveBeenNthCalledWith(2, 2, true, false);
  });

  it('조개와 공통 입체 그림을 항목명 왼쪽에 두고 수치·복귀는 유지한다', async () => {
    const { container, click } = await mount();
    await click('용어1');
    await click('다음 문제');
    await click('용어2');
    await click('결과 보기');
    const summary = container.querySelector('[aria-label="퀴즈 결과 요약"]');
    expect(summary).not.toBeNull();
    const icons = [...summary!.querySelectorAll('.quiz-result-icon')];
    expect(icons).toHaveLength(4);
    for (const [index, label] of ['모은 조개', '획득 XP', '첫 시도 정답률', '최고 연속 정답'].entries()) {
      const icon = icons[index];
      expect(icon).toHaveAttribute('width', '18');
      expect(icon).toHaveAttribute('height', '18');
      if (index === 0) {
        expect(icon).toHaveAttribute('src', '/otter/v3/items/shell.png');
      } else {
        expect(icon).toHaveAttribute('src', ['/otter/v3/icons/trophy.png', '/otter/v3/icons/target.png', '/otter/v3/icons/flame.png'][index - 1]);
        expect(icon).not.toHaveAttribute('stroke-width');
        expect(icon).not.toHaveAttribute('fill');
      }
      expect(icon).toHaveAttribute('aria-hidden', 'true');
      expect(icon.parentElement).toHaveTextContent(label);
      expect(icon.parentElement?.nextElementSibling).toHaveTextContent(['+0개', '+0', '100%', '1연속'][index]);
    }
    expect(container.querySelectorAll('.quiz-result-icon')).toHaveLength(5);
    expect([...container.querySelectorAll('.quiz-result-icon')].at(-1)?.closest('.rounded-full')).toBeNull();
    await click('주제로 돌아가기');
    expect(container.textContent).toContain('코스 화면');
  });

  it('완료 화면에서 퀴즈 성과를 공유한다', async () => {
    const { click } = await mount();

    await click('용어1');
    await click('다음 문제');
    await click('용어2');
    await click('결과 보기');
    await click('친구에게 공유');

    expect(state.shareTossLink).toHaveBeenCalledWith(
      'intoss://moneytermi/course',
      expect.stringContaining('머니터미에서 퀴즈 2문제 100% 달성!'),
    );
    expect(state.shareTossLink.mock.calls[0][1]).toContain('오늘 확인한 용어: 용어1 · 용어2.');
  });
});


describe('조개 표시와 보상 값 유지', () => {
  it.each([3, 4])('%i연속의 고정 보너스는 조개 5개이고 서버 보상 값은 그대로 표시한다', async combo => {
    state.submitQuizAnswer.mockResolvedValue(quizResult({ combo, earned: 15 }));
    const { container, click } = await mount();
    await click('용어1');
    expect(container.textContent).toContain(combo + '연속! 조개 5개 보너스');
    expect(container.querySelector('.anim-reward-rise')).toHaveTextContent('+15개');
    expect(container.querySelector('.quiz-feedback-sheet')).toHaveTextContent('+15개');
    expect(state.submitQuizAnswer).toHaveBeenCalledWith(1, '용어1', 'mc', false, true, expect.any(String));
    await click('다음 문제');
    await click('용어2');
    await click('결과 보기');
    expect(container.querySelector('[aria-label="퀴즈 결과 요약"]')).toHaveTextContent('+30개');
  });

  it('5연속 배수 보너스와 보상 한도 조건을 유지한다', async () => {
    state.submitQuizAnswer.mockResolvedValue(quizResult({ combo: 5, capped: true }));
    const { container, click } = await mount();
    await click('용어1');
    expect(container.textContent).toContain('5연속! x2 보너스');
    expect(container.textContent).toContain('한도 도달');
    expect(container.querySelector('.anim-reward-rise')).toBeNull();
    expect(container.textContent).not.toContain('조개 5개 보너스');
  });

  it('홈 미션 보상은 조개 개수로 표시하고 XP와 지급 인수는 유지한다', async () => {
    const { container, click } = await mount({}, <HomeScreen />);
    expect(container.textContent).toContain('+37개');
    expect(container.textContent).toContain('+' + MISSION_XP + ' XP');
    expect(container.textContent).not.toContain('+37P');
    await click('받기');
    expect(state.claimReward).toHaveBeenCalledWith('m1');
    expect(container.querySelector('[role="dialog"]')).toHaveTextContent('+37개');
  });

  it('리그 안내는 레슨 조개 차감 대신 에너지와 부스트 선택 사용을 설명한다', async () => {
    const { container } = await mount({}, <LeagueRules />);
    expect(container.textContent).toContain('에너지 모두 충전(600개)');
    expect(container.textContent).toContain('XP 2배 부스트(300개 · 30분)에 선택해서 써요');
    expect(container.textContent).toContain('레슨 시작에는 조개가 필요 없어요');
    expect(container.textContent).toContain('XP 50마다 조개 50개');
    expect(container.textContent).toContain('학습·퀴즈를 새로 시작할 때 1씩 써요');
    expect(container.textContent).not.toMatch(/포인트|10P|50P|300P/);
  });
});

describe('선택 후 정답 확인과 답안 전송 순서', () => {
  it('보기 선택만으로 채점하지 않고 확정 전 답을 바꿀 수 있다', async () => {
    const { container, choose, click } = await mount();
    await choose('오답');
    expect(state.submitQuizAnswer).not.toHaveBeenCalled();
    expect(state.recordReview).not.toHaveBeenCalled();
    expect(container.querySelector('[aria-pressed="true"]')).toHaveTextContent('오답');
    await choose('용어1');
    expect(state.submitQuizAnswer).not.toHaveBeenCalled();
    await click('정답 확인');
    expect(state.submitQuizAnswer).toHaveBeenCalledWith(1, '용어1', 'mc', false, true, expect.any(String));
    expect(state.submitQuizAnswer).toHaveBeenCalledTimes(1);
  });
  it('오답 뒤에도 모든 보기를 보존하고 정답과 내 답을 구분한다', async () => {
    const { container, click } = await mount();
    await click('오답');
    const options = [...container.querySelectorAll<HTMLButtonElement>('.quiz-option')];
    expect(options).toHaveLength(2);
    expect(options.every(option => option.disabled)).toBe(true);
    expect(options.find(option => option.textContent?.includes('용어1'))).toHaveTextContent('정답');
    expect(options.find(option => option.textContent?.includes('오답'))).toHaveTextContent('내 답');
  });
  it('서버 답안을 기다리는 동안 다음 문제와 중복 제출을 막는다', async () => {
    let resolve!: (value: QuizAnswerResult) => void;
    state.submitQuizAnswer.mockImplementationOnce(() => new Promise(done => { resolve = done; }));
    const { container, click } = await mount();
    await click('용어1');
    const next = [...container.querySelectorAll<HTMLButtonElement>('button')].find(button => button.textContent === '답안 확인 중...')!;
    expect(next).toBeDisabled();
    expect(state.recordReview).not.toHaveBeenCalled();
    expect(shouldScheduleRetry).not.toHaveBeenCalled();
    expect(vi.mocked(logClick).mock.calls.filter(([event]) => event === 'quiz_answer' || event === 'quiz_complete')).toEqual([]);
    expect(container.querySelector('.quiz-answer-feedback')).toBeNull();
    expect(container.querySelector('.anim-reward-rise')).toBeNull();
    expect([...container.querySelectorAll<HTMLButtonElement>('.quiz-option')].every(option => option.disabled)).toBe(true);
    await act(async () => { next.click(); });
    expect(container).toHaveTextContent('뜻1');
    expect(state.submitQuizAnswer).toHaveBeenCalledTimes(1);
    await act(async () => { resolve(quizResult({ combo: 1, earned: 10 })); });
    await click('다음 문제');
    expect(container).toHaveTextContent('뜻2');
  });
  it('전송 오류에 보상을 만들어내지 않고 같은 답안으로 재시도한다', async () => {
    state.submitQuizAnswer.mockRejectedValueOnce(new Error('연결 끊김'));
    const { container, click } = await mount();
    await click('용어1');
    expect(container.querySelector('[role="alert"]')).toHaveTextContent('답안 전송을 확인하지 못했어요.');
    expect(container).not.toHaveTextContent('+10개');
    expect(container).toHaveTextContent('뜻1');
    expect(state.recordReview).not.toHaveBeenCalled();
    const first = [...state.submitQuizAnswer.mock.calls[0]];
    expect(first).toEqual([1, '용어1', 'mc', false, true, expect.any(String)]);
    expect(first[5]).not.toBe('');
    expect([...container.querySelectorAll<HTMLButtonElement>('.quiz-option')].every(option => option.disabled)).toBe(true);
    await act(async () => { container.querySelectorAll<HTMLButtonElement>('.quiz-option')[1].click(); });
    expect(container.querySelector('[aria-pressed="true"]')).toHaveTextContent('용어1');
    expect(state.submitQuizAnswer).toHaveBeenCalledTimes(1);
    await click('다시 저장하기');
    expect(state.submitQuizAnswer.mock.calls[1]).toEqual(first);
    await click('다음 문제');
    expect(container).toHaveTextContent('뜻2');
  });
});

describe('선택 정보와 문제 전환', () => {
  it('확정 전에는 정답 여부에 따라 선택 색이나 표시가 달라지지 않는다', async () => {
    const { container, choose } = await mount();
    await choose('오답');
    const wrongClass = container.querySelector('.quiz-option[aria-pressed="true"]')!.className;
    const wrongMarker = container.querySelector('.quiz-option[aria-pressed="true"] > span')!.className;
    await choose('용어1');
    expect(container.querySelector('.quiz-option[aria-pressed="true"]')).toHaveClass(wrongClass);
    expect(container.querySelector('.quiz-option[aria-pressed="true"] > span')!.className).toBe(wrongMarker);
    expect(state.submitQuizAnswer).not.toHaveBeenCalled();
  });
  it('같은 단어가 연속되어도 문제 맨 위와 제목으로 초점을 옮긴다', async () => {
    const { container, click } = await mount({ quizQueue: [word(1), word(1)] });
    await click('오답');
    const content = container.querySelector<HTMLDivElement>('.quiz-question-content')!;
    content.scrollTop = 100;
    await click('다음 문제');
    expect(content.scrollTop).toBe(0);
    expect(document.activeElement).toBe(container.querySelector('.quiz-prompt-main'));
    expect(container.querySelector('.quiz-confirm-footer button')).toBeDisabled();
  });
  it('응답이 없으면 전송 안내를 표시하고 지급액을 추정하지 않는다', async () => {
    state.submitQuizAnswer.mockResolvedValueOnce(null);
    const { container, click } = await mount();
    await click('용어1');
    expect(container.querySelector('[role="alert"]')).toHaveTextContent('답안 전송을 확인하지 못했어요.');
    expect(container.querySelector('.quiz-answer-reward')).toBeNull();
    expect(state.recordReview).not.toHaveBeenCalled();
    expect(container.querySelector('.quiz-confirm-footer button')).toHaveTextContent('다시 저장하기');
    expect([...container.querySelectorAll<HTMLButtonElement>('.quiz-option')].every(button => button.disabled)).toBe(true);
    const firstPayload = [...state.submitQuizAnswer.mock.calls[0]];
    expect(firstPayload).toEqual([1, '용어1', 'mc', false, true, expect.any(String)]);
    expect(firstPayload[5]).not.toBe('');
    await act(async () => { container.querySelectorAll<HTMLButtonElement>('.quiz-option')[1].click(); });
    expect(container.querySelector('[aria-pressed="true"]')).toHaveTextContent('용어1');
    expect(state.submitQuizAnswer).toHaveBeenCalledTimes(1);
    await click('다시 저장하기');
    expect(state.submitQuizAnswer).toHaveBeenCalledTimes(2);
    expect(state.submitQuizAnswer.mock.calls[1]).toEqual(firstPayload);
    await click('다음 문제');
    expect(container).toHaveTextContent('뜻2');
  });
});


describe('서버 채점과 저장 확정 회귀', () => {
  it('로컬 정답을 서버가 오답으로 채점하면 오답 복습·재출제·50%로 확정하고 오래된 정답은 숨긴다', async () => {
    state.submitQuizAnswer.mockResolvedValueOnce(quizResult({ correct: false, combo: 0 }));
    const { container, click } = await mount();
    await click('용어1');
    expect(state.recordReview).toHaveBeenNthCalledWith(1, 1, false, false);
    expect(container.querySelector('[role="alert"]')).toHaveTextContent('문제 정보와 서버 채점이 달라 정답 표시를 생략했어요.');
    expect(container.querySelector('.quiz-answer-feedback')).toHaveAttribute('data-correct', 'false');
    expect(container.querySelector('.quiz-answer-result')).toBeNull();
    expect(container.querySelector('.quiz-answer-explanation')).toBeNull();
    for (const option of container.querySelectorAll('.quiz-option')) {
      expect(option.className).not.toMatch(/success|danger|anim-choice-lock/);
      expect(option.querySelector('svg')).toBeNull();
      expect(option).not.toHaveTextContent('정답');
    }
    await click('다음 문제');
    await click('용어2');
    await click('다음 문제');
    expect(container.querySelector('.quiz-prompt-main')).toHaveTextContent('뜻1');
    await click('용어1');
    await click('결과 보기');
    expect(container.querySelector('[aria-label="퀴즈 결과 요약"]')).toHaveTextContent('50%');
    expect(logClick).toHaveBeenCalledWith('quiz_complete', expect.objectContaining({ total: 2, correct: 1, attempts: 3 }));
    expect(state.recordReview).toHaveBeenCalledTimes(2);
  });

  it('로컬 오답을 서버가 정답으로 채점하면 정답 복습·보상·100%로 확정하고 재출제하지 않는다', async () => {
    state.submitQuizAnswer.mockResolvedValueOnce(quizResult({ correct: true, earned: 17, combo: 2 }));
    const { container, click } = await mount();
    await click('오답');
    expect(state.recordReview).toHaveBeenNthCalledWith(1, 1, true, false);
    expect(container.querySelector('.quiz-answer-feedback')).toHaveAttribute('data-correct', 'true');
    expect(container.querySelector('.quiz-answer-reward')).toHaveTextContent('+17개');
    expect(shouldScheduleRetry).not.toHaveBeenCalled();
    expect(logClick).toHaveBeenCalledWith('quiz_answer', expect.objectContaining({ word_id: 1, correct: true, first_attempt: true }));
    await click('다음 문제');
    await click('용어2');
    await click('결과 보기');
    expect(container.querySelector('[aria-label="퀴즈 결과 요약"]')).toHaveTextContent('100%');
    expect(container.querySelector('[aria-label="퀴즈 결과 요약"]')).toHaveTextContent('+17개');
    expect(state.submitQuizAnswer).toHaveBeenCalledTimes(2);
    expect(logClick).toHaveBeenCalledWith('quiz_complete', expect.objectContaining({ total: 2, correct: 2, attempts: 2 }));
  });

  it.each(['false', 'reject'] as const)('복습 저장 %s 뒤 성공하면 원격 영수증을 재사용하고 첫 오답을 그대로 저장한다', async failure => {
    state.submitQuizAnswer.mockResolvedValueOnce(quizResult({ correct: false, combo: 0 }));
    if (failure === 'false') state.recordReview.mockResolvedValueOnce(false);
    else state.recordReview.mockRejectedValueOnce(new Error('복습 저장 실패'));
    const { container, click } = await mount();
    await click('오답');
    const originalPayload = [...state.submitQuizAnswer.mock.calls[0]];
    expect(originalPayload).toEqual([1, '오답', 'mc', false, true, expect.any(String)]);
    expect(state.recordReview).toHaveBeenNthCalledWith(1, 1, false, false);
    expect(container.querySelector('.quiz-confirm-footer button')).toHaveTextContent('다시 저장하기');
    expect(container.querySelector('.quiz-answer-feedback')).toBeNull();
    expect(shouldScheduleRetry).not.toHaveBeenCalled();
    expect(vi.mocked(logClick).mock.calls.filter(([event]) => event === 'quiz_answer')).toEqual([]);
    await act(async () => { container.querySelector<HTMLButtonElement>('.quiz-option')!.click(); });
    expect(container.querySelector('[aria-pressed="true"]')).toHaveTextContent('오답');
    await click('다시 저장하기');
    expect(state.submitQuizAnswer).toHaveBeenCalledTimes(1);
    expect(state.submitQuizAnswer.mock.calls[0]).toEqual(originalPayload);
    expect(state.recordReview).toHaveBeenNthCalledWith(2, 1, false, false);
    expect(container.querySelector('.quiz-answer-feedback')).toHaveAttribute('data-correct', 'false');
    expect(shouldScheduleRetry).toHaveBeenCalledTimes(1);
    expect(vi.mocked(logClick).mock.calls.filter(([event]) => event === 'quiz_answer')).toHaveLength(1);
    await click('다음 문제');
    await click('용어2');
    await click('다음 문제');
    await click('용어1');
    await click('결과 보기');
    expect(container.querySelector('[aria-label="퀴즈 결과 요약"]')).toHaveTextContent('50%');
    expect(state.recordReview.mock.calls.filter(([id]) => id === 1)).toEqual([[1, false, false], [1, false, false]]);
  });

  it('서버 영수증이 도착해도 복습 저장이 늦으면 다음 문제와 성과 확정을 막는다', async () => {
    let finishReview!: (saved: boolean) => void;
    state.recordReview.mockImplementationOnce(() => new Promise<boolean>(done => { finishReview = done; }));
    const { container, click } = await mount();
    await click('용어1');
    expect(state.submitQuizAnswer).toHaveBeenCalledTimes(1);
    expect(state.recordReview).toHaveBeenCalledWith(1, true, false);
    const pending = container.querySelector<HTMLButtonElement>('.quiz-confirm-footer button')!;
    expect(pending).toHaveTextContent('답안 확인 중...');
    expect(pending).toBeDisabled();
    expect(container.querySelector('.quiz-answer-feedback')).toBeNull();
    expect(shouldScheduleRetry).not.toHaveBeenCalled();
    expect(vi.mocked(logClick).mock.calls.filter(([event]) => event === 'quiz_answer')).toEqual([]);
    await act(async () => { pending.click(); pending.click(); });
    expect(container.querySelector('.quiz-prompt-main')).toHaveTextContent('뜻1');
    expect(state.submitQuizAnswer).toHaveBeenCalledTimes(1);
    expect(state.recordReview).toHaveBeenCalledTimes(1);
    await act(async () => { finishReview(true); });
    expect(container.querySelector('.quiz-answer-feedback')).toHaveAttribute('data-correct', 'true');
    await click('다음 문제');
    expect(container.querySelector('.quiz-prompt-main')).toHaveTextContent('뜻2');
  });

  it('다음 문제를 같은 순간 두 번 눌러도 미응답 문제를 건너뛰지 않는다', async () => {
    const { container, click } = await mount({ quizQueue: [word(1), word(2), word(3)] });
    for (const id of [1, 2]) {
      await click('용어' + id);
      const next = [...container.querySelectorAll<HTMLButtonElement>('button')].find(button => button.textContent === '다음 문제')!;
      await act(async () => {
        next.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        next.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      });
      expect(container.querySelector('.quiz-prompt-main')).toHaveTextContent('뜻' + (id + 1));
      expect(container.querySelector('.quiz-confirm-footer button')).toBeDisabled();
      expect(state.submitQuizAnswer).toHaveBeenCalledTimes(id);
    }
    await click('용어3');
    await click('결과 보기');
    expect(container.querySelector('[aria-label="퀴즈 결과 요약"]')).toHaveTextContent('100%');
    expect(logClick).toHaveBeenCalledWith('quiz_complete', expect.objectContaining({ total: 3, correct: 3, attempts: 3 }));
  });

  it('다른 문제와 같은 단어 재출제에는 각각 새로운 요청 식별자를 발급한다', async () => {
    const { click } = await mount();
    await click('오답');
    await click('다음 문제');
    await click('용어2');
    await click('다음 문제');
    await click('용어1');
    expect(state.submitQuizAnswer.mock.calls).toEqual([
      [1, '오답', 'mc', false, true, expect.any(String)],
      [2, '용어2', 'mc', false, false, expect.any(String)],
      [1, '용어1', 'mc', false, false, expect.any(String)],
    ]);
    const ids = state.submitQuizAnswer.mock.calls.map(call => call[5]);
    expect(ids.every(id => typeof id === 'string' && id.length > 0)).toBe(true);
    expect(new Set(ids).size).toBe(3);
  });
});


describe('작은 화면 저장 실패 안내', () => {
  it('안내 영역이 커져도 선택한 답을 가리지 않도록 읽기 위치를 맞춘다', async () => {
    state.submitQuizAnswer.mockResolvedValueOnce(null);
    const { container, choose, click } = await mount();
    await choose('용어1');
    const selected = container.querySelector<HTMLButtonElement>('.quiz-option[aria-pressed="true"]')!;
    const scrollIntoView = vi.fn();
    selected.scrollIntoView = scrollIntoView;
    await click('정답 확인');
    expect(scrollIntoView).toHaveBeenCalledWith({ block: 'nearest' });
    expect(container.querySelector('.quiz-selection-guide')).toHaveTextContent('선택한 답안 그대로 다시 저장할 수 있어요.');
    expect(container.querySelector('.quiz-confirm-footer button')).toHaveTextContent('다시 저장하기');
  });
});
