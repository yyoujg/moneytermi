import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { Word } from '../types';
import { logClick } from '../lib/analytics';
import LessonIntroScreen from './LessonIntroScreen';

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

describe('레슨 미리보기', () => {
  it('배울 용어와 진행 순서를 보여주고 시작하면 다음 단계로 넘어간다', () => {
    const container = mount({ courseTitle: '경제 기초 개념 1', words: [word(1), word(2)], warmupCount: 3, courseId: 'c1', nodeId: 'c1-l0', next: { pathname: '/quiz', state: { mode: 'lesson_warmup' } } });
    expect(container).toHaveTextContent('경제 기초 개념 1');
    expect(container).toHaveTextContent('새 용어 2개를 배워요');
    expect([...container.querySelectorAll('ul li')].map(li => li.textContent)).toEqual(['용어1', '용어2']);
    expect([...container.querySelectorAll('.lesson-intro-step .type-item-title')].map(el => el.textContent)).toEqual(['가볍게 다시 보기', '용어 살펴보기', '용어 퀴즈로 확인']);
    expect(container).toHaveTextContent('지난 용어 3개');
    expect(container.querySelector('[aria-label*="돌아가기"]')).toBeNull();
    act(() => [...container.querySelectorAll('button')].find(b => b.textContent === '시작하기')!.click());
    expect(container.querySelector('[data-location]')).toHaveTextContent('/quiz {"mode":"lesson_warmup"}');
    expect(logClick).toHaveBeenCalledWith('lesson_intro_start', { course_id: 'c1', node_id: 'c1-l0', total: 2 });
  });

  it('복습 단계가 없으면 용어 살펴보기부터 시작한다', () => {
    const container = mount({ words: [word(1)], next: { pathname: '/quiz', state: null } });
    expect([...container.querySelectorAll('.lesson-intro-step-number')].map(el => el.textContent)).toEqual(['1', '2']);
    expect(container.querySelector('.lesson-intro-step .type-item-title')).toHaveTextContent('용어 살펴보기');
  });

  it('상태 없이 열면 코스로 보낸다', () => {
    const container = mount(null);
    expect(container.querySelector('[data-location]')).toHaveTextContent('/course');
  });
});
