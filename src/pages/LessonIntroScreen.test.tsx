import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { Word } from '../types';
import { logClick } from '../lib/analytics';
import LessonIntroScreen, { LESSON_INTRO_MS } from './LessonIntroScreen';

vi.mock('../lib/analytics', () => ({ logClick: vi.fn() }));
Object.defineProperty(globalThis, 'IS_REACT_ACT_ENVIRONMENT', { value: true, configurable: true });

const word = (id: number): Word => ({ id, word: `용어${id}`, meaning: '뜻', detailedMeaning: '', newsExample: '', hint: '', difficulty: 1 });

let cleanup = () => {};
afterEach(() => { cleanup(); vi.clearAllMocks(); });

const Destination = () => {
  const location = useLocation();
  return <div data-location>{location.pathname} {JSON.stringify(location.state)}</div>;
};

const mount = (state: unknown) => {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);
  act(() => root.render(
    <MemoryRouter initialEntries={[{ pathname: '/lesson-intro', state }]}>
      <Routes>
        <Route path="/lesson-intro" element={<LessonIntroScreen />} />
        <Route path="/quiz" element={<Destination />} />
        <Route path="/course" element={<Destination />} />
      </Routes>
    </MemoryRouter>
  ));
  cleanup = () => { act(() => root.unmount()); container.remove(); };
  return container;
};

describe('레슨 시작 로딩', () => {
  it('수달 로딩과 새 용어 수를 잠깐 보여준 뒤 다음 단계로 넘어간다', () => {
    vi.useFakeTimers();
    const container = mount({ courseTitle: '경제 기초 개념 1', words: [word(1), word(2)], warmupCount: 3, courseId: 'c1', nodeId: 'c1-l0', next: { pathname: '/quiz', state: { mode: 'lesson_warmup' } } });
    expect(container.querySelector('.loading-screen')).not.toBeNull();
    expect(container).toHaveTextContent('새 용어 2개를 준비하고 있어요');
    expect(container.querySelector('button')).toBeNull();
    expect(container.querySelector('[data-location]')).toBeNull();
    act(() => { vi.advanceTimersByTime(LESSON_INTRO_MS); });
    expect(container.querySelector('[data-location]')).toHaveTextContent('/quiz {"mode":"lesson_warmup"}');
    expect(logClick).toHaveBeenCalledWith('lesson_intro_start', { course_id: 'c1', node_id: 'c1-l0', total: 2 });
    vi.useRealTimers();
  });

  it('상태 없이 열면 코스로 보낸다', () => {
    const container = mount(null);
    expect(container.querySelector('[data-location]')).toHaveTextContent('/course');
  });
});
