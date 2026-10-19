import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Word } from '../types';
import ReviewScreen from './ReviewScreen';
import { feedbackCorrect, feedbackWrong } from '../lib/feedback';
import type { QuizAnswerResult } from '../lib/quizSubmission';

const state = vi.hoisted(() => ({
  points: 0,
  dueQueue: [] as Word[],
  recordReview: vi.fn(),
  submitQuizAnswer: vi.fn(),
  refreshWallet: vi.fn(),
}));

vi.mock('../context/AppContext', () => ({
  useAppContext: () => ({
    points: state.points,
    dueQueue: state.dueQueue,
    knownWords: state.dueQueue,
    submitQuizAnswer: state.submitQuizAnswer,
    recordReview: state.recordReview,
    refreshWallet: state.refreshWallet,
  }),
}));
vi.mock('../lib/feedback', () => ({
  feedbackCorrect: vi.fn(),
  feedbackWrong: vi.fn(),
  feedbackQuizComplete: vi.fn(),
}));
vi.mock('../lib/analytics', () => ({ logClick: vi.fn() }));
vi.mock('../lib/review', async importOriginal => {
  const actual = await importOriginal<typeof import('../lib/review')>();
  return { ...actual, requestAppReview: vi.fn() };
});
vi.mock('../hooks/useSettings', () => ({ useSettings: () => ({ soundOn: false, vibrationOn: false }) }));
vi.mock('../components/DailyAlarmPromptCard', () => ({ DailyAlarmPromptCard: () => null }));
vi.mock('../components/StreakCelebration', () => ({ StreakCelebration: () => null }));

Object.defineProperty(globalThis, 'IS_REACT_ACT_ENVIRONMENT', { value: true, configurable: true });

const word = (id: number): Word => ({
  id,
  word: `용어${id}`,
  meaning: `뜻${id}`,
  detailedMeaning: `상세${id}`,
  newsExample: '',
  hint: `ㅎ${id}`,
  difficulty: 1,
});

let cleanup = () => {};
afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

const mount = async (queue: Word[]) => {
  state.dueQueue = queue;
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);
  await act(async () => {
    root.render(
      <MemoryRouter initialEntries={['/review']}>
        <Routes>
          <Route path="/review" element={<ReviewScreen />} />
          <Route path="/home" element={<div>홈 화면</div>} />
          <Route path="/course" element={<div>코스 화면</div>} />
        </Routes>
      </MemoryRouter>,
    );
  });
  cleanup = () => { act(() => root.unmount()); container.remove(); };
  const input = () => container.querySelector('input') as HTMLInputElement;
  const submit = async (answer: string) => {
    await act(async () => {
      const field = input();
      const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set;
      setter?.call(field, answer);
      field.dispatchEvent(new Event('input', { bubbles: true }));
      field.dispatchEvent(new Event('change', { bubbles: true }));
    });
    const button = [...container.querySelectorAll('button')].find(el => el.textContent?.includes('제출하기'))!;
    await act(async () => {
      button.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });
  };
  const click = async (label: string) => {
    const button = [...container.querySelectorAll('button')].find(el => el.textContent?.includes(label))!;
    await act(async () => { button.click(); });
  };
  return { container, submit, input, click };
};

const receipt = (correct: boolean, overrides: Partial<QuizAnswerResult> = {}): QuizAnswerResult => ({
  correct, combo: correct ? 1 : 0, earned: 0, points: 0, xp: 0, m3Current: 0, capped: false, ...overrides,
});

const deferred = <T,>() => {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((res, rej) => { resolve = res; reject = rej; });
  return { promise, resolve, reject };
};

beforeEach(() => {
  vi.clearAllMocks();
  vi.useFakeTimers();
  state.points = 0;
  state.recordReview = vi.fn(() => Promise.resolve(true));
  state.submitQuizAnswer = vi.fn((id: number, answer: string) => Promise.resolve(receipt(answer === `용어${id}`)));
  state.refreshWallet = vi.fn(() => Promise.resolve());
  vi.spyOn(Math, 'random').mockReturnValue(0.9);
});

describe('ReviewScreen retry spacing', () => {
  it('오답은 다른 문제 뒤에 재출제하고 SRS는 첫 결과만 기록한다', async () => {
    const { container, submit } = await mount([word(1), word(2)]);

    await submit('틀림');
    expect(state.recordReview).toHaveBeenCalledWith(1, false, false);
    await act(async () => { vi.advanceTimersByTime(1000); });
    expect(container.textContent).toContain('복습 2 / 3');

    await submit('용어2');
    await act(async () => { vi.advanceTimersByTime(900); });
    expect(container.textContent).toContain('복습 3 / 3');

    await submit('용어1');
    expect(state.recordReview).toHaveBeenCalledTimes(2);
    expect(state.recordReview).toHaveBeenNthCalledWith(1, 1, false, false);
    expect(state.recordReview).toHaveBeenNthCalledWith(2, 2, true, false);
  });

  it('한 문제만 남았을 때 오답을 무한히 다시 붙이지 않는다', async () => {
    const { container, submit } = await mount([word(1)]);

    await submit('틀림');
    await act(async () => { vi.advanceTimersByTime(1000); });

    expect(container.textContent).toContain('오늘 복습을 마쳤어요');
    expect(container.querySelector('[data-review-total]')).toHaveTextContent('1문제');
    expect(container.querySelector('[data-review-correct]')).toHaveTextContent('0개');
    expect(container.querySelector('section')).toHaveAttribute('aria-label', '첫 시도 1문제 중 0개 정답');
    expect(state.recordReview).toHaveBeenCalledTimes(1);
  });
});


describe('복습 조개 표시', () => {
  it.each([0, 1234])('보유 조개는 실제 잔액 %i개를 그대로 표시한다', async points => {
    state.points = points;
    const { container, submit } = await mount([word(1)]);
    await submit('용어1');
    await act(async () => { vi.advanceTimersByTime(900); });
    expect(container.querySelector('.review-complete-wallet')).toHaveAttribute('aria-label', '보유 조개 ' + points + '개');
    expect(container.querySelector('[data-review-balance]')).toHaveTextContent(points + '개');
    expect(container.textContent).not.toContain('누적 포인트');
  });

  it('정답 보상을 조개 개수로 표시하고 제출 인수를 유지한다', async () => {
    state.submitQuizAnswer.mockResolvedValue(receipt(true, { combo: 3, earned: 28 }));
    const { container, submit } = await mount([word(1)]);
    await submit('용어1');
    expect(container.textContent).toContain('+28개');
    expect(container.textContent).not.toContain('+28P');
    expect(state.submitQuizAnswer).toHaveBeenCalledWith(1, '용어1', 'typed', false, true, expect.any(String));
  });

  it('보상 한도일 때 조개 수치 대신 기존 한도 문구를 유지한다', async () => {
    state.submitQuizAnswer.mockResolvedValue(receipt(true, { capped: true }));
    const { container, submit } = await mount([word(1)]);
    await submit('용어1');
    expect(container.textContent).toContain('오늘 보상 한도에 도달했어요');
    expect(container.textContent).not.toContain('+0개');
  });
});

describe('복습 완료의 기존 이동과 기록', () => {
  it('완료 버튼은 기존 학습 홈으로 이동하고 복습 기록을 다시 만들지 않는다', async () => {
    const { container, submit } = await mount([word(1)]);
    await submit('용어1');
    await act(async () => { vi.advanceTimersByTime(900); });
    const button = [...container.querySelectorAll('button')].find(el => el.textContent === '학습 홈으로')!;
    await act(async () => { button.click(); });
    expect(container).toHaveTextContent('코스 화면');
    expect(state.recordReview).toHaveBeenCalledTimes(1);
    expect(state.refreshWallet).toHaveBeenCalledTimes(1);
  });
});


describe('복습 답안의 확정 저장', () => {
  it('늦은 오답 응답과 SRS 저장 전에는 피드백·재출제·다음 타이머를 시작하지 않는다', async () => {
    const grading = deferred<QuizAnswerResult>();
    const saving = deferred<boolean>();
    state.submitQuizAnswer.mockReturnValue(grading.promise);
    state.recordReview.mockReturnValue(saving.promise);
    const { container, submit } = await mount([word(1), word(2)]);
    await submit('틀림');
    await act(async () => { vi.advanceTimersByTime(5000); });
    expect(container).toHaveTextContent('복습 1 / 2');
    expect(state.recordReview).not.toHaveBeenCalled();
    expect(feedbackWrong).not.toHaveBeenCalled();
    await act(async () => { grading.resolve(receipt(false)); });
    expect(state.recordReview).toHaveBeenCalledWith(1, false, false);
    await act(async () => { vi.advanceTimersByTime(5000); });
    expect(container).toHaveTextContent('복습 1 / 2');
    expect(feedbackWrong).not.toHaveBeenCalled();
    await act(async () => { saving.resolve(true); });
    expect(container).toHaveTextContent('복습 1 / 3');
    expect(feedbackWrong).toHaveBeenCalledTimes(1);
    await act(async () => { vi.advanceTimersByTime(999); });
    expect(container).toHaveTextContent('복습 1 / 3');
    await act(async () => { vi.advanceTimersByTime(1); });
    expect(container).toHaveTextContent('복습 2 / 3');
  });

  it.each(['null', 'reject'])('%s 실패는 답안을 고정한 채 같은 요청 ID로 재시도한다', async failure => {
    if (failure === 'null') state.submitQuizAnswer.mockResolvedValueOnce(null);
    else state.submitQuizAnswer.mockRejectedValueOnce(new Error('통신 실패'));
    const { container, submit, input, click } = await mount([word(1)]);
    await click('초성 힌트');
    await submit('용어1');
    const payload = [...state.submitQuizAnswer.mock.calls[0]];
    expect(payload).toEqual([1, '용어1', 'typed', true, true, expect.any(String)]);
    expect(payload[5]).not.toBe('');
    expect(container.querySelector('[aria-live="polite"]')).toHaveTextContent('답안 저장을 확인하지 못했어요');
    expect(document.activeElement).toHaveTextContent('다시 저장하기');
    expect(input()).toBeDisabled();
    await click('건너뛰기');
    await act(async () => { vi.advanceTimersByTime(5000); });
    expect(container).toHaveTextContent('복습 1 / 1');
    expect(state.recordReview).not.toHaveBeenCalled();
    expect(feedbackCorrect).not.toHaveBeenCalled();
    await click('다시 저장하기');
    expect(state.submitQuizAnswer).toHaveBeenCalledTimes(2);
    expect(state.submitQuizAnswer.mock.calls[1]).toEqual(payload);
    expect(state.recordReview).toHaveBeenCalledWith(1, true, true);
    await act(async () => { vi.advanceTimersByTime(900); });
    expect(container.querySelector('[data-review-correct]')).toHaveTextContent('1개');
  });

  it.each(['false', 'reject'])('SRS %s 실패는 영수증을 재사용하고 첫 성적을 한 번만 확정한다', async failure => {
    if (failure === 'false') state.recordReview.mockResolvedValueOnce(false);
    else state.recordReview.mockRejectedValueOnce(new Error('저장 실패'));
    const { container, submit, input, click } = await mount([word(1)]);
    await submit('용어1');
    expect(container).toHaveTextContent('다시 저장하기');
    expect(input()).toBeDisabled();
    expect(feedbackCorrect).not.toHaveBeenCalled();
    await click('초성 힌트');
    await click('건너뛰기');
    await act(async () => { vi.advanceTimersByTime(5000); });
    expect(container).toHaveTextContent('복습 1 / 1');
    await click('다시 저장하기');
    expect(state.submitQuizAnswer).toHaveBeenCalledTimes(1);
    expect(state.recordReview.mock.calls).toEqual([[1, true, false], [1, true, false]]);
    expect(feedbackCorrect).toHaveBeenCalledTimes(1);
    await act(async () => { vi.advanceTimersByTime(900); });
    expect(container.querySelector('[data-review-correct]')).toHaveTextContent('1개');
  });

  it('저장 중 이중 클릭·엔터·건너뛰기·힌트 변경을 막는다', async () => {
    const grading = deferred<QuizAnswerResult>();
    state.submitQuizAnswer.mockReturnValue(grading.promise);
    const { container, submit, input, click } = await mount([word(1), word(2)]);
    await submit('용어1');
    expect(input()).toBeDisabled();
    expect([...container.querySelectorAll('button')].every(button => button.disabled)).toBe(true);
    await click('저장 중');
    await click('초성 힌트');
    await click('건너뛰기');
    await act(async () => {
      container.querySelector('form')!.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
      container.querySelector('form')!.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    });
    expect(state.submitQuizAnswer).toHaveBeenCalledTimes(1);
    expect(state.submitQuizAnswer.mock.calls[0]).toEqual([1, '용어1', 'typed', false, true, expect.any(String)]);
    expect(container).toHaveTextContent('복습 1 / 2');
    await act(async () => { grading.resolve(receipt(true)); });
    await act(async () => { vi.advanceTimersByTime(900); });
    expect(container).toHaveTextContent('복습 2 / 2');
    expect(document.activeElement).toBe(input());
    state.submitQuizAnswer.mockResolvedValue(receipt(true));
    await submit('용어2');
    expect(state.submitQuizAnswer.mock.calls[1][5]).not.toBe(state.submitQuizAnswer.mock.calls[0][5]);
  });

  it.each([
    { answer: '용어1', correct: false },
    { answer: '틀린 입력', correct: true },
  ])('서버 correct=$correct를 입력 일치 여부보다 우선한다', async ({ answer, correct }) => {
    state.submitQuizAnswer.mockResolvedValue(receipt(correct));
    const { container, submit } = await mount([word(1), word(2)]);
    await submit(answer);
    expect(state.recordReview).toHaveBeenCalledWith(1, correct, false);
    expect(feedbackCorrect).toHaveBeenCalledTimes(correct ? 1 : 0);
    expect(feedbackWrong).toHaveBeenCalledTimes(correct ? 0 : 1);
    expect(container).toHaveTextContent(correct ? '정답! 바로 맞혔어요' : '틀렸어요. 다시 시도해보세요!');
    expect(container).toHaveTextContent(correct ? '복습 1 / 2' : '복습 1 / 3');
    await act(async () => { vi.advanceTimersByTime(correct ? 900 : 1000); });
    state.submitQuizAnswer.mockResolvedValue(receipt(true));
    await submit('용어2');
    await act(async () => { vi.advanceTimersByTime(900); });
    if (!correct) {
      await submit('용어1');
      await act(async () => { vi.advanceTimersByTime(900); });
    }
    expect(container.querySelector('[data-review-correct]')).toHaveTextContent(correct ? '2개' : '1개');
    expect(state.recordReview).toHaveBeenCalledTimes(2);
  });

  it('SRS 실패 뒤 오답 저장 성공도 재출제와 첫 성적을 중복시키지 않는다', async () => {
    state.recordReview.mockResolvedValueOnce(false);
    const { container, submit, click } = await mount([word(1), word(2)]);
    await submit('틀림');
    await click('다시 저장하기');
    expect(container).toHaveTextContent('복습 1 / 3');
    expect(feedbackWrong).toHaveBeenCalledTimes(1);
    await act(async () => { vi.advanceTimersByTime(1000); });
    await submit('용어2');
    await act(async () => { vi.advanceTimersByTime(900); });
    await submit('용어1');
    expect(state.recordReview.mock.calls).toEqual([[1, false, false], [1, false, false], [2, true, false]]);
    await act(async () => { vi.advanceTimersByTime(900); });
    expect(container.querySelector('[data-review-correct]')).toHaveTextContent('1개');
    expect(container.querySelector('[data-review-total]')).toHaveTextContent('2문제');
  });

  it('같은 이벤트 묶음의 연속 제출도 요청을 한 번만 보낸다', async () => {
    const grading = deferred<QuizAnswerResult>();
    state.submitQuizAnswer.mockReturnValue(grading.promise);
    const { container, input } = await mount([word(1)]);
    await act(async () => {
      const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set;
      setter?.call(input(), '용어1');
      input().dispatchEvent(new Event('input', { bubbles: true }));
    });
    await act(async () => {
      const form = container.querySelector('form')!;
      form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
      form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
      [...container.querySelectorAll('button')].find(button => button.textContent === '제출하기')!.click();
    });
    expect(state.submitQuizAnswer).toHaveBeenCalledTimes(1);
    await act(async () => { grading.resolve(receipt(true)); });
    expect(state.recordReview).toHaveBeenCalledTimes(1);
  });

  it('언마운트 시 다음 문제 타이머를 해제한다', async () => {
    const { submit } = await mount([word(1)]);
    await submit('용어1');
    expect(vi.getTimerCount()).toBeGreaterThan(0);
    cleanup();
    cleanup = () => {};
    expect(vi.getTimerCount()).toBe(0);
    await act(async () => { vi.advanceTimersByTime(1000); });
    expect(state.refreshWallet).not.toHaveBeenCalled();
  });
});
