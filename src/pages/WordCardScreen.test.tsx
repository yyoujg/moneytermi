import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { Word } from '../types';
import WordCardScreen from './WordCardScreen';
import { logClick } from '../lib/analytics';

vi.mock('../context/AppContext', () => ({ useAppContext: () => ({ courses: [], allWords: [], knownWords: [], knownIds: new Set([1]), hydrated: true }) }));
vi.mock('../hooks/useNews', () => ({ useNews: () => ({ newsItems: [], newsStatus: 'ready' }) }));
vi.mock('../components/DailyAlarmPromptCard', () => ({ DailyAlarmPromptCard: () => null }));
vi.mock('../components/StreakCelebration', () => ({ StreakCelebration: () => null }));
vi.mock('../lib/feedback', () => ({ feedbackLearned: vi.fn(), feedbackLessonComplete: vi.fn() }));
vi.mock('../lib/analytics', () => ({ logClick: vi.fn() }));
Object.defineProperty(globalThis, 'IS_REACT_ACT_ENVIRONMENT', { value: true, configurable: true });

let cleanup = () => {};
afterEach(() => cleanup());
const Destination = () => {
  const location = useLocation();
  return <div>{location.pathname} {JSON.stringify(location.state)}</div>;
};
const mount = (visuals: Word['visuals']) => {
  const word: Word = { id: 1, word: '용어', meaning: '뜻', detailedMeaning: '', newsExample: '', hint: '', difficulty: 1, visuals };
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);
  act(() => root.render(<MemoryRouter initialEntries={[{ pathname: '/word-card', state: { words: [word], index: 1, autoAdvance: true, courseId: 'c1', nodeId: 'c1-l0', backPath: '/course?topic=2' } }]}>
    <Routes>
      <Route path="/word-card" element={<WordCardScreen />} />
      <Route path="/lesson-check" element={<Destination />} />
      <Route path="/quiz" element={<Destination />} />
    </Routes>
  </MemoryRouter>));
  cleanup = () => { act(() => root.unmount()); container.remove(); };
  return { container, click: (text: string) => {
    const button = [...container.querySelectorAll('button')].find(button => button.textContent === text)!;
    act(() => button.click());
  } };
};

describe('카드 열람 후 이해 확인', () => {
  it('열람을 능력 습득으로 표현하지 않고 해설이 있는 상황 문제로 연결한다', () => {
    const { container, click } = mount([{ type: 'quiz', lessonCheck: true, q: '어떤 변화가 생길까요?', options: ['증가', '감소'], answer: 0, explanation: '조건이 같을 때 증가해요.' }]);
    expect(container.textContent).toContain('용어를 살펴봤어요');
    expect(container.textContent).not.toContain('이제 할 수 있어요');
    expect(logClick).toHaveBeenCalledWith('lesson_view_complete', { course_id: 'c1', node_id: 'c1-l0', total: 1 });
    click('상황 문제로 이해 확인하기');
    expect(container.textContent).toContain('/lesson-check');
    expect(container.textContent).toContain('c1-l0');
    expect(container.textContent).toContain('/course?topic=2');
  });

  it('상황 문제가 없는 레슨은 용어 확인으로 안내한다', () => {
    const { container, click } = mount([]);
    expect(container.textContent).toContain('상황 적용 문제는 아직 준비 중이에요');
    click('용어 퀴즈로 확인하기');
    expect(container.textContent).toContain('/quiz');
    expect(container.textContent).toContain('lesson_recall');
  });
});
