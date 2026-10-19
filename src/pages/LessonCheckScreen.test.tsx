import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { Word } from '../types';
import { lessonChecks } from '../lib/quiz';
import { feedbackCorrect, feedbackWrong } from '../lib/feedback';
import { logClick } from '../lib/analytics';
import LessonCheckScreen from './LessonCheckScreen';
import expandedChecks from '../../supabase/content/lesson-checks-20261016.json';
import type { CustomQuiz } from '../lib/quiz';

vi.mock('../lib/feedback', () => ({ feedbackCorrect: vi.fn(), feedbackWrong: vi.fn() }));
vi.mock('../lib/analytics', () => ({ logClick: vi.fn() }));
Object.defineProperty(globalThis, 'IS_REACT_ACT_ENVIRONMENT', { value: true, configurable: true });

const word = (id: number, visuals?: Word['visuals']): Word => ({
  id, word: `용어${id}`, meaning: '뜻', detailedMeaning: '', newsExample: '', hint: '', difficulty: 1, visuals,
});

const check = { type: 'quiz' as const, lessonCheck: true as const, q: '이 상황에서 어떤 변화가 생길까요?', options: ['오른다', '내린다', '같다', '모른다'], answer: 0, explanation: '수요가 늘었으므로 가격이 올라요.' };

let cleanup = () => {};
afterEach(() => { cleanup(); vi.clearAllMocks(); });

const CourseDestination = () => {
  const location = useLocation();
  return <div>코스 화면 {location.pathname}{location.search}</div>;
};

const mount = (entry: string | { pathname: string; state: unknown }) => {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);
  act(() => root.render(
    <MemoryRouter initialEntries={[entry]}>
      <Routes>
        <Route path="/lesson-check" element={<LessonCheckScreen />} />
        <Route path="/course" element={<CourseDestination />} />
      </Routes>
    </MemoryRouter>
  ));
  cleanup = () => { act(() => root.unmount()); container.remove(); };
  const click = (label: string) => {
    const button = [...container.querySelectorAll('button')].find(el => {
      const choiceLabel = el.querySelector('[data-lesson-check-label]')?.textContent;
      const text = (choiceLabel ?? [...el.childNodes].filter(node => node.nodeType === Node.TEXT_NODE).map(node => node.textContent).join('')).replace(/\u00a0/g, ' ').trim();
      return text === label;
    });
    expect(button, `버튼: ${label}`).toBeDefined();
    act(() => button!.dispatchEvent(new MouseEvent('click', { bubbles: true })));
  };
  return { container, click };
};

describe('레슨 이해 확인', () => {
  it('답변 전에는 캐릭터·정답을 노출하지 않고 선택·채점·로그·복귀를 유지한다', () => {
    const { container, click } = mount({ pathname: '/lesson-check', state: { words: [word(1, [check])], backPath: '/course', courseId: 'example-course', nodeId: 'example-node' } });
    expect(container.querySelector('img')).toBeNull();
    expect(container.querySelector('[data-lesson-check-result]')).toBeNull();
    expect(container.querySelectorAll('button[data-own-sfx]')).toHaveLength(4);
    expect(logClick).toHaveBeenCalledWith('lesson_check_start', { course_id: 'example-course', node_id: 'example-node', total: 1 });
    click('내린다');
    expect(feedbackWrong).toHaveBeenCalledTimes(1);
    expect(feedbackCorrect).not.toHaveBeenCalled();
    expect(logClick).toHaveBeenCalledWith('lesson_check_answer', { course_id: 'example-course', node_id: 'example-node', word_id: 1, correct: false, attempt: 1 });
    click('결과 보기');
    expect(logClick).toHaveBeenCalledWith('lesson_check_complete', { course_id: 'example-course', node_id: 'example-node', total: 1, correct: 0, attempt: 1 });
    click('틀린 문제 다시 풀기');
    expect(container.querySelector('img')).toBeNull();
    click('오른다');
    expect(feedbackCorrect).toHaveBeenCalledTimes(1);
    expect(logClick).toHaveBeenCalledWith('lesson_check_answer', { course_id: 'example-course', node_id: 'example-node', word_id: 1, correct: true, attempt: 2 });
    click('결과 보기');
    expect(logClick).toHaveBeenCalledWith('lesson_check_complete', { course_id: 'example-course', node_id: 'example-node', total: 1, correct: 1, attempt: 2 });
    click('다음 학습 선택하기');
    expect(container.textContent).toContain('코스 화면');
  });

  it.each([0, 1, 2, 173, 220])('신규 문항 %i의 정답과 해설을 표시하고 완료한다', index => {
    const entry = expandedChecks[index];
    const quiz = entry.quiz as CustomQuiz;
    const { container, click } = mount({ pathname: '/lesson-check', state: { words: [word(entry.wordId, [quiz])] } });
    expect(container.textContent?.replace(/\u00a0/g, ' ')).toContain(quiz.q);
    click(quiz.options[quiz.answer]);
    expect(container.textContent).toContain('맞았어요');
    expect(container.textContent?.replace(/\u00a0/g, ' ')).toContain(quiz.explanation);
    click('결과 보기');
    expect(container.textContent).toContain('1문제 중 1개 정답');
  });

  it('정답은 O 포즈 수달과 문구, 완료 행동은 기존 주황으로 구분한다', () => {
    const { container, click } = mount({ pathname: '/lesson-check', state: { words: [word(1, [check])] } });
    click('오른다');
    const correct = container.querySelector('[data-lesson-check-result="correct"]');
    expect(correct).toHaveClass('lesson-feedback-answer');
    expect(container.querySelector('.lesson-feedback-character')).toHaveAttribute('src', '/otter/v3/feedback/correct.png');
    expect(container.querySelector('.lesson-feedback-character')).toHaveAttribute('alt', '정답을 알리는 O 포즈 수달');
    expect(container.querySelector('.lesson-feedback-character')).toHaveAttribute('width', '96');
    expect(container.querySelector('.lesson-feedback-character')).toHaveAttribute('height', '96');
    expect(container.querySelector('.lesson-feedback-status-icon')).toBeNull();
    expect(container.querySelector('.lesson-feedback-answer :is(svg, img[data-icon])')).toBeNull();
    expect(container.querySelector('[class*="answer-soft"]')).toBeNull();
    expect(correct).toHaveAttribute('aria-label', '오른다, 정답');
    expect(correct).toHaveTextContent('정답');
    expect(container.querySelector('[data-lesson-check-feedback="correct"]')).toHaveClass('lesson-feedback-card');
    expect(container.querySelector('.lesson-feedback-reason')).toHaveTextContent(check.explanation);
    expect(container.querySelector('[class*="success-"]')).toBeNull();
    click('결과 보기');
    expect(container.querySelector('[data-lesson-check-complete]')).toHaveClass('lesson-complete-screen');
    expect(container.querySelector('.lesson-complete-hero img')).toHaveAttribute('src', '/otter/v3/characters/joy.png');
    expect(container.querySelector('[data-lesson-check-summary]')).toHaveTextContent('정답률 100%');
    expect([...container.querySelectorAll('button')].find(button => button.textContent?.includes('다음 학습 선택하기'))).toHaveAttribute('data-tone', 'primary');
    expect(container.querySelector('[class*="success-"]')).toBeNull();
  });

  it('오답은 X 포즈 수달과 명확한 문구, 중성 내 선택과 정답으로 알려준다', () => {
    const { container, click } = mount({ pathname: '/lesson-check', state: { words: [word(1, [check])] } });
    click('내린다');
    expect(container.querySelector('.lesson-feedback-character')).toHaveAttribute('src', '/otter/v3/feedback/wrong.png');
    expect(container.querySelector('.lesson-feedback-character')).toHaveAttribute('alt', '오답을 알리는 X 포즈 수달');
    expect(container.querySelector('.lesson-feedback-intro h1')).toHaveTextContent('아쉬워요, 오답이에요');
    expect(container.querySelector('[data-lesson-check-result="wrong"]')).toHaveClass('lesson-feedback-my-answer');
    expect(container.querySelector('[class*="danger-"], [class*="answer-soft"], [class*="success-"]')).toBeNull();
    expect(container.querySelector('.lesson-feedback-my-answer :is(svg, img[data-icon])')).toBeNull();
    expect(container.querySelector('[data-lesson-check-result="wrong"]')).toHaveTextContent('내 선택');
    expect(container.querySelector('[data-lesson-check-result="correct"]')).toHaveTextContent('정답');
    expect(container.querySelector('[data-lesson-check-feedback="wrong"]')).toHaveClass('lesson-feedback-card');
    expect(container.querySelectorAll('button[data-own-sfx]')).toHaveLength(0);
    click('다른 보기 확인하기');
    expect(container.querySelectorAll('.lesson-feedback-options li')).toHaveLength(4);
    expect(container.querySelector('.lesson-feedback-options [data-lesson-option-state="wrong"]')).toHaveTextContent('내린다');
    expect(container.querySelectorAll('.lesson-feedback-options button')).toHaveLength(0);
    expect(container.querySelectorAll('.lesson-feedback-options :is(svg, img[data-icon])')).toHaveLength(0);
    expect([...container.querySelectorAll('.lesson-feedback-option-marker')].map(marker => marker.textContent)).toEqual(['1', '2', '3', '4']);
    expect(container.querySelector('.lesson-feedback-options [data-lesson-option-state="correct"]')).toHaveTextContent('정답');
    expect(container.querySelector('.lesson-feedback-options [data-lesson-option-state="wrong"]')).toHaveTextContent('내 선택');
  });

  it('정답 뒤에는 해설을 먼저 보여주고 다른 보기는 펼쳐서 확인한다', () => {
    const { container, click } = mount({ pathname: '/lesson-check', state: { words: [word(1, [check])] } });
    click('오른다');
    expect(container.querySelector('.lesson-feedback-intro h1')).toHaveTextContent('맞았어요!');
    expect(document.activeElement).toBe(container.querySelector('.lesson-feedback-intro h1'));
    expect(container.querySelector('.lesson-feedback-question')).toHaveTextContent(check.q);
    expect(container.querySelector('.lesson-feedback-reason')).toHaveTextContent('이렇게 이해해요');
    expect(container.querySelector('.lesson-feedback-options')).toBeNull();
    expect(container.querySelector('.lesson-feedback-disclosure')).toHaveAttribute('aria-expanded', 'false');
    expect(container.querySelector('.lesson-feedback-disclosure')).not.toHaveAttribute('aria-controls');
    click('다른 보기 확인하기');
    expect(container.querySelector('.lesson-feedback-disclosure')).toHaveAttribute('aria-expanded', 'true');
    const controlledId = container.querySelector('.lesson-feedback-disclosure')!.getAttribute('aria-controls')!;
    expect(document.getElementById(controlledId)).toBe(container.querySelector('.lesson-feedback-options'));
    expect(container.querySelectorAll('.lesson-feedback-options li')).toHaveLength(4);
    click('다른 보기 접기');
    expect(container.querySelector('.lesson-feedback-options')).toBeNull();
    click('결과 보기');
    expect(container.querySelector('.lesson-complete-score-caption')).toHaveTextContent('1문제 중 1개 정답');
    expect(document.activeElement).toBe(container.querySelector('.lesson-complete-hero h1'));
  });

  it('오답이 있으면 재도전을 주행동으로 두고 실제 결과만 표시한다', () => {
    const { container, click } = mount({ pathname: '/lesson-check', state: { words: [word(1, [check])] } });
    click('내린다');
    click('결과 보기');
    expect(container.querySelector('[data-lesson-check-summary]')).toHaveTextContent('1문제 중 0개 정답');
    expect(container.querySelector('[data-lesson-check-summary]')).toHaveTextContent('정답률 0%');
    expect(container.querySelector('.lesson-complete-hero img')).toHaveAttribute('src', '/otter/v3/characters/study.png');
    expect(container.querySelector('.lesson-complete-review')).toHaveTextContent('다시 확인할 문제 1개');
    const buttons = [...container.querySelectorAll('button')];
    expect(buttons.find(button => button.textContent?.includes('틀린 문제 다시 풀기'))).toHaveAttribute('data-tone', 'primary');
    expect(buttons.find(button => button.textContent?.includes('코스로 돌아가기'))).toHaveAttribute('data-tone', 'soft');
    expect(container.textContent).not.toContain('XP');
    expect(container.textContent).not.toContain('포인트');
  });

  it('여러 문제에서도 다음 문제·보기 접힘·실제 점수를 유지한다', () => {
    const second = { ...check, q: '두 번째 상황은?', options: ['확대', '축소'], explanation: '조건에 따라 규모가 확대돼요.' };
    const { container, click } = mount({ pathname: '/lesson-check', state: { words: [word(1, [check]), word(2, [second])] } });
    click('오른다');
    click('다른 보기 확인하기');
    click('다음 문제');
    expect(container.textContent).toContain('두 번째 상황은?');
    expect(container.querySelector('[role="progressbar"]')).toHaveAttribute('aria-valuenow', '2');
    click('축소');
    expect(container.querySelector('.lesson-feedback-options')).toBeNull();
    click('결과 보기');
    expect(container.querySelector('.lesson-complete-score-caption')).toHaveTextContent('2문제 중 1개 정답');
    expect(container.querySelector('[data-lesson-check-summary]')).toHaveTextContent('정답률 50%');
    expect(container.querySelector('[data-lesson-check-summary]')).toHaveAttribute('aria-label', '첫 풀이 결과');
    expect(container.querySelector('.lesson-complete-hero h1')).toHaveTextContent('첫 풀이 완료!');
    click('틀린 문제 다시 풀기');
    expect(container.querySelector('h1')).toHaveTextContent('틀린 문제 재도전 1차');
    expect(container.textContent).toContain('두 번째 상황은?');
    expect(container.querySelector('[role="progressbar"]')).toHaveAttribute('aria-valuemax', '1');
    click('확대');
    click('결과 보기');
    expect(container.querySelector('.lesson-complete-score-caption')).toHaveTextContent('1문제 중 1개 정답');
    expect(container.querySelector('[data-lesson-check-summary]')).toHaveAttribute('aria-label', '틀린 문제 재도전 1차 결과');
    expect(container.querySelector('[data-lesson-check-summary]')).toHaveTextContent('정답률 100%');
    expect(container.querySelector('[data-lesson-check-first-result]')).toHaveTextContent('2문제 중 1개 정답');
    expect(container.querySelector('[data-lesson-check-first-result]')).toHaveTextContent('정답률 50%');
    expect(container.querySelector('.lesson-complete-hero h1')).toHaveTextContent('틀린 문제 재도전 1차 완료!');
  });


  it('재도전을 반복해도 첫 풀이·이전 회차·이번 회차와 분석 시도를 섞지 않는다', () => {
    const { container, click } = mount({ pathname: '/lesson-check', state: {
      words: [word(1, [check]), word(2, [{ ...check, q: '두 번째 상황' }]), word(3, [{ ...check, q: '세 번째 상황' }])],
      courseId: 'course', nodeId: 'node', backPath: '/course?topic=2',
    } });
    click('오른다'); click('다음 문제');
    click('내린다'); click('다음 문제');
    click('내린다'); click('결과 보기');
    expect(container.querySelector('[data-lesson-check-summary]')).toHaveTextContent('3문제 중 1개 정답');
    expect(container.querySelector('[data-lesson-check-summary]')).toHaveTextContent('정답률 33%');
    expect(container.querySelector('[data-lesson-check-first-result]')).toBeNull();

    click('틀린 문제 다시 풀기');
    expect(container.querySelector('h1')).toHaveTextContent('틀린 문제 재도전 1차');
    expect(container.querySelector('[role="progressbar"]')).toHaveAttribute('aria-valuemax', '2');
    expect(container.textContent).toContain('두 번째 상황');
    click('오른다'); click('다음 문제');
    expect(container.textContent).toContain('세 번째 상황');
    click('내린다'); click('결과 보기');
    expect(container.querySelector('[data-lesson-check-first-result]')).toHaveTextContent('3문제 중 1개 정답');
    expect(container.querySelector('[data-lesson-check-summary]')).toHaveAttribute('aria-label', '틀린 문제 재도전 1차 결과');
    expect(container.querySelector('[data-lesson-check-summary]')).toHaveTextContent('2문제 중 1개 정답');
    expect(container.querySelector('[data-lesson-check-summary]')).toHaveTextContent('정답률 50%');
    expect(container.querySelector('.lesson-complete-review')).toHaveTextContent('다시 확인할 문제 1개');

    click('틀린 문제 다시 풀기');
    expect(container.querySelector('h1')).toHaveTextContent('틀린 문제 재도전 2차');
    expect(container.querySelector('[role="progressbar"]')).toHaveAttribute('aria-valuemax', '1');
    expect(container.textContent).toContain('세 번째 상황');
    click('오른다'); click('결과 보기');
    expect(container.querySelector('[data-lesson-check-first-result]')).toHaveTextContent('3문제 중 1개 정답');
    expect(container.querySelector('[data-lesson-check-first-result]')).toHaveTextContent('정답률 33%');
    expect(container.querySelector('[aria-label="이전 재도전 결과"]')).toHaveTextContent('재도전 1차 · 2문제 중 1개 정답 · 정답률 50%');
    expect(container.querySelector('[data-lesson-check-summary]')).toHaveAttribute('aria-label', '틀린 문제 재도전 2차 결과');
    expect(container.querySelector('[data-lesson-check-summary]')).toHaveTextContent('1문제 중 1개 정답');
    expect(container.querySelector('[data-lesson-check-summary]')).toHaveTextContent('정답률 100%');
    expect(container.querySelector('.lesson-complete-review')).toBeNull();
    expect(container.textContent).not.toContain('틀린 문제 다시 풀기');
    expect(container.textContent).not.toContain('XP');
    expect(container.textContent).not.toContain('포인트');
    expect(vi.mocked(logClick).mock.calls.filter(([event]) => event === 'lesson_check_complete').map(([, data]) => data)).toEqual([
      { course_id: 'course', node_id: 'node', total: 3, correct: 1, attempt: 1 },
      { course_id: 'course', node_id: 'node', total: 2, correct: 1, attempt: 2 },
      { course_id: 'course', node_id: 'node', total: 1, correct: 1, attempt: 3 },
    ]);
    expect(vi.mocked(logClick).mock.calls.filter(([event]) => event === 'lesson_check_answer').map(([, data]) => [data?.word_id, data?.correct, data?.attempt])).toEqual([
      [1, true, 1], [2, false, 1], [3, false, 1], [2, true, 2], [3, false, 2], [3, true, 3],
    ]);
    const eventCount = vi.mocked(logClick).mock.calls.length;
    click('다음 학습 선택하기');
    expect(container.textContent).toContain('코스 화면 /course?topic=2');
    expect(logClick).toHaveBeenCalledTimes(eventCount);
  });

  it('첫 풀이에서 모두 맞히면 재도전 결과 없이 다음 학습 선택으로 복귀한다', () => {
    const { container, click } = mount({ pathname: '/lesson-check', state: { words: [word(1, [check])], backPath: '/course?topic=3' } });
    click('오른다'); click('결과 보기');
    expect(container.querySelector('.lesson-complete-hero h1')).toHaveTextContent('첫 풀이 완료!');
    expect(container.querySelector('[data-lesson-check-first-result]')).toBeNull();
    expect(container.querySelector('[aria-label="이전 재도전 결과"]')).toBeNull();
    expect(container.querySelector('[data-lesson-check-summary]')).toHaveTextContent('정답률 100%');
    click('다음 학습 선택하기');
    expect(container.textContent).toContain('코스 화면 /course?topic=3');
  });

  it('오답을 남기고 돌아가도 원래 코스 주제를 유지한다', () => {
    const { container, click } = mount({ pathname: '/lesson-check', state: { words: [word(1, [check])], backPath: '/course?topic=1' } });
    click('내린다'); click('결과 보기'); click('코스로 돌아가기');
    expect(container.textContent).toContain('코스 화면 /course?topic=1');
  });

  it('문제가 없는 레슨도 다음 학습 선택 시 원래 코스 주제로 복귀한다', () => {
    const { container, click } = mount({ pathname: '/lesson-check', state: { words: [word(1)], backPath: '/course?topic=4' } });
    click('다음 학습 선택하기');
    expect(container.textContent).toContain('코스 화면 /course?topic=4');
    expect(logClick).not.toHaveBeenCalled();
  });

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
    expect(container.querySelector('[data-lesson-check-result="correct"]')).toHaveAttribute('aria-label', '오른다, 정답');
    expect(container.textContent).toContain(check.explanation);
    click('결과 보기');
    expect(container.textContent).toContain('1문제 중 0개 정답');

    click('틀린 문제 다시 풀기');
    click('오른다');
    expect(container.textContent).toContain('맞았어요');
    click('결과 보기');
    expect(container.textContent).toContain('1문제 중 1개 정답');
    click('다음 학습 선택하기');
    expect(container.textContent).toContain('코스 화면');
  });

  it('직접 진입해 문제가 없으면 코스로 돌아간다', () => {
    const { container, click } = mount('/lesson-check');
    expect(container.textContent).toContain('자주 마주치는 용어부터 시작해요');
    click('학습 시작하기');
    expect(container.textContent).toContain('코스 화면');
  });

  it('레슨에 이해 확인 문제가 없으면 다음 학습을 안내한다', () => {
    const { container, click } = mount({ pathname: '/lesson-check', state: { words: [word(1)] } });
    expect(container.textContent).toContain('이번 레슨에는 이해 확인 문제가 없어요');
    click('다음 학습 선택하기');
    expect(container.textContent).toContain('코스 화면');
  });
});

it('결과 보기를 연속 눌러도 첫 풀이를 가짜 재도전으로 중복 기록하지 않는다', () => {
 const {container,click}=mount({pathname:'/lesson-check',state:{words:[word(1,[check])]}});click('오른다');
 const button=[...container.querySelectorAll('button')].find(el=>el.textContent?.includes('결과 보기'))!;
 act(()=>{button.click();button.click();});
 expect(container.querySelector('h1')).toHaveTextContent('첫 풀이 완료');
 expect(container.querySelector('[data-lesson-check-first-result]')).toBeNull();
 expect(vi.mocked(logClick).mock.calls.filter(([name])=>name==='lesson_check_complete')).toHaveLength(1);
});
