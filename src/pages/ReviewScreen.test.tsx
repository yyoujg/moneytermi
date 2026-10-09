import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Word } from '../types';
import ReviewScreen from './ReviewScreen';

const state = vi.hoisted(() => ({
  dueQueue: [] as Word[],
  recordReview: vi.fn(),
  submitQuizAnswer: vi.fn(),
  refreshWallet: vi.fn(),
}));

vi.mock('../context/AppContext', () => ({
  useAppContext: () => ({
    points: 0,
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
  return { container, submit };
};

beforeEach(() => {
  vi.useFakeTimers();
  state.recordReview = vi.fn(() => Promise.resolve());
  state.submitQuizAnswer = vi.fn(() => Promise.resolve({ combo: 0, earned: 0, capped: false }));
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

    expect(container.textContent).toContain('오늘 복습 완료');
    expect(state.recordReview).toHaveBeenCalledTimes(1);
  });
});
