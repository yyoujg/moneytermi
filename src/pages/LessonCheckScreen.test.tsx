import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { Word } from '../types';
import { lessonChecks } from '../lib/quiz';
import LessonCheckScreen from './LessonCheckScreen';

vi.mock('../lib/feedback', () => ({ feedbackCorrect: vi.fn(), feedbackWrong: vi.fn() }));
vi.mock('../lib/analytics', () => ({ logClick: vi.fn() }));
Object.defineProperty(globalThis, 'IS_REACT_ACT_ENVIRONMENT', { value: true, configurable: true });

const word = (id: number, visuals?: Word['visuals']): Word => ({
  id, word: `용어${id}`, meaning: '뜻', detailedMeaning: '', newsExample: '', hint: '', difficulty: 1, visuals,
});

const check = { type: 'quiz' as const, lessonCheck: true as const, q: '이 상황에서 어떤 변화가 생길까요?', options: ['오른다', '내린다', '같다', '모른다'], answer: 0, explanation: '수요가 늘었으므로 가격이 올라요.' };

let cleanup = () => {};
afterEach(() => cleanup());

const mount = (entry: string | { pathname: string; state: unknown }) => {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);
  act(() => root.render(
    <MemoryRouter initialEntries={[entry]}>
      <Routes>
        <Route path="/lesson-check" element={<LessonCheckScreen />} />
        <Route path="/course" element={<div>코스 화면</div>} />
      </Routes>
    </MemoryRouter>
  ));
  cleanup = () => { act(() => root.unmount()); container.remove(); };
  const click = (label: string) => {
    const button = [...container.querySelectorAll('button')].find(el => el.textContent?.trim().endsWith(label));
    expect(button, `버튼: ${label}`).toBeDefined();
    act(() => button!.dispatchEvent(new MouseEvent('click', { bubbles: true })));
  };
  return { container, click };
};

describe('레슨 이해 확인', () => {
  it('해설이 있는 전용 문항만 용어당 하나 고른다', () => {
    const words = [
      word(1, [{ type: 'quiz', q: '일반 퀴즈', options: ['a'], answer: 0 }, check, { ...check, q: '두 번째' }]),
      word(2, [{ ...check, explanation: '' }]),
      word(3),
    ];
    expect(lessonChecks(words).map(({ word: w, quiz }) => [w.id, quiz.q])).toEqual([[1, check.q]]);
  });

  it('오답 해설을 확인한 뒤 완료하고 틀린 문제를 다시 풀 수 있다', () => {
    const { container, click } = mount({ pathname: '/lesson-check', state: { words: [word(1, [check])], backPath: '/course' } });

    click('내린다');
    expect(container.textContent).toContain('정답: 오른다');
    expect(container.textContent).toContain(check.explanation);
    click('결과 보기');
    expect(container.textContent).toContain('1문제 중 0개 정답');

    click('틀린 문제 다시 풀기');
    click('오른다');
    expect(container.textContent).toContain('맞았어요');
    click('결과 보기');
    expect(container.textContent).toContain('1문제 중 1개 정답');
    click('코스로 돌아가기');
    expect(container.textContent).toContain('코스 화면');
  });

  it('직접 진입해 문제가 없으면 코스로 돌아간다', () => {
    const { container, click } = mount('/lesson-check');
    expect(container.textContent).toContain('확인할 문제가 없어요');
    click('코스로 돌아가기');
    expect(container.textContent).toContain('코스 화면');
  });
});
