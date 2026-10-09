import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Word } from '../types';
import QuizScreen from './QuizScreen';

const state = vi.hoisted(() => ({
  recordReview: vi.fn(),
  submitQuizAnswer: vi.fn(),
  refreshWallet: vi.fn(),
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
    allWords: [1, 2].map(id => ({ id, word: `용어${id}`, meaning: `뜻${id}`, detailedMeaning: '', newsExample: '', hint: '', difficulty: 1 })),
    knownWords: [1, 2].map(id => ({ id, word: `용어${id}`, meaning: `뜻${id}`, detailedMeaning: '', newsExample: '', hint: '', difficulty: 1 })),
    courses: [],
    submitQuizAnswer: state.submitQuizAnswer,
    recordReview: state.recordReview,
    refreshWallet: state.refreshWallet,
  }),
}));
vi.mock('../lib/pathProgress', () => ({ markNodeDone: vi.fn() }));
vi.mock('../lib/feedback', () => ({
  feedbackCorrect: vi.fn(),
  feedbackWrong: vi.fn(),
  feedbackQuizComplete: vi.fn(),
  feedbackTierUp: vi.fn(),
}));
vi.mock('../lib/review', async importOriginal => {
  const actual = await importOriginal<typeof import('../lib/review')>();
  return { ...actual };
});
vi.mock('../lib/analytics', () => ({ logClick: vi.fn() }));

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

const mount = async () => {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);
  await act(async () => {
    root.render(
      <MemoryRouter initialEntries={[{ pathname: '/quiz', state: { quizQueue: [word(1), word(2)], reviewMode: true, backPath: '/course' } }]}>
        <Routes>
          <Route path="/quiz" element={<QuizScreen />} />
          <Route path="/course" element={<div>코스 화면</div>} />
        </Routes>
      </MemoryRouter>,
    );
  });
  cleanup = () => { act(() => root.unmount()); container.remove(); };
  const click = async (text: string) => {
    const button = [...container.querySelectorAll('button')].find(el => el.textContent?.includes(text));
    expect(button, `버튼: ${text}`).toBeDefined();
    await act(async () => {
      button!.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });
  };
  return { container, click };
};

beforeEach(() => {
  state.recordReview = vi.fn(() => Promise.resolve());
  state.submitQuizAnswer = vi.fn(() => Promise.resolve({ combo: 1, earned: 0, capped: false }));
  state.refreshWallet = vi.fn(() => Promise.resolve());
});

describe('QuizScreen review SRS', () => {
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
});
