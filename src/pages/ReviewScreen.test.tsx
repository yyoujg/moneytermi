import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { Word } from '../types';
import { useAppContext } from '../context/AppContext';
import ReviewScreen from './ReviewScreen';
import { toDateStr } from '../lib/date';

vi.mock('../context/AppContext', () => ({ useAppContext: vi.fn() }));
vi.mock('../hooks/useSettings', () => ({ useSettings: () => ({ soundOn: false, vibrationOn: false }) }));
vi.mock('../lib/review', () => ({ requestAppReview: vi.fn() }));
vi.mock('../lib/analytics', () => ({ logClick: vi.fn() }));
vi.mock('../lib/feedback', () => ({ feedbackCorrect: vi.fn(), feedbackWrong: vi.fn(), feedbackQuizComplete: vi.fn() }));

const word: Word = { id: 1, word: '단리', meaning: '원금에만 이자가 붙는 방식', detailedMeaning: '원금에만 이자가 붙어요.', newsExample: '', hint: 'ㄷㄹ', difficulty: 1 };

const setContext = (dueQueue: Word[], knownWords: Word[], nextReviewDate: string | null = null) => {
  vi.mocked(useAppContext).mockReturnValue({
    hydrated: true, points: 0, dueQueue, knownWords, nextReviewDate,
    submitQuizAnswer: vi.fn(), recordReview: vi.fn(), refreshWallet: vi.fn(),
  } as unknown as ReturnType<typeof useAppContext>);
};

let cleanup = () => {};
afterEach(() => { cleanup(); localStorage.clear(); vi.clearAllMocks(); });

const mount = async () => {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);
  await act(async () => root.render(
    <MemoryRouter initialEntries={['/review']}>
      <Routes><Route path="/review" element={<ReviewScreen />} /><Route path="/course" element={<div>코스 화면</div>} /></Routes>
    </MemoryRouter>
  ));
  cleanup = () => { act(() => root.unmount()); container.remove(); };
  return container;
};

describe('복습 시작 상태', () => {
  it('복습할 단어 수를 먼저 보여주고 시작하면 문제를 연다', async () => {
    setContext([word], [word]);
    const container = await mount();
    expect(container.textContent).toContain('오늘 복습할 단어');
    expect(container.textContent).toContain('1개');
    act(() => container.querySelector('button')!.click());
    expect(container.textContent).toContain('뜻을 보고 용어를 맞혀보세요');
  });

  it('학습 전에는 첫 레슨을 안내한다', async () => {
    setContext([], []);
    const container = await mount();
    expect(container.textContent).toContain('단어를 먼저 배워보세요');
    const button = [...container.querySelectorAll('button')].find(el => el.textContent?.includes('첫 레슨 시작하기'))!;
    act(() => button.click());
    expect(container.textContent).toContain('코스 화면');
  });

  it('복습 예정일 대기와 오늘 완료를 구분한다', async () => {
    setContext([], [word], '2026-10-01');
    let container = await mount();
    expect(container.textContent).toContain('지금 복습할 단어가 없어요');
    expect(container.textContent).toContain('다음 복습 예정');
    cleanup();
    localStorage.setItem('review_completed_date', toDateStr(new Date()));
    container = await mount();
    expect(container.textContent).toContain('오늘 복습을 마쳤어요');
  });
});
