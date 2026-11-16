import { act, type ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Course, Word } from '../types';
import WordCardScreen from './WordCardScreen';
import { logClick } from '../lib/analytics';
import { dismissRelatedWordPreview, dismissWordResources } from '../lib/backEvent';
import { buildCourseContent } from '../lib/courseContent';
import content from '../content/content.json';
import { maskTerm } from '../lib/quiz';
import { wordLessonVisuals } from '../lib/wordLesson';

const mocks = vi.hoisted(() => ({
  courses: [] as Course[], allWords: [] as Word[], knownWords: [] as Word[],
  setKnownWords: vi.fn(), claimPromotionReward: vi.fn(), claimPromotion: vi.fn(),
  useNews: vi.fn(), openExternalUrl: vi.fn(),
}));
vi.mock('../context/AppContext', () => ({ useAppContext: () => ({
  courses: mocks.courses, allWords: mocks.allWords, knownWords: mocks.knownWords, knownIds: new Set([1]), hydrated: true,
  setKnownWords: mocks.setKnownWords, claimPromotionReward: mocks.claimPromotionReward,
}) }));
vi.mock('../lib/promotion', () => ({ claimPromotion: mocks.claimPromotion }));
vi.mock('../lib/external', () => ({ openExternalUrl: mocks.openExternalUrl }));
vi.mock('../hooks/useNews', () => ({ useNews: (...args: unknown[]) => mocks.useNews(...args) }));
vi.mock('@toss/tds-mobile', () => ({ BottomSheet: ({ open, children }: { open: boolean; children: ReactNode }) => open ? <section>{children}</section> : null }));
vi.mock('../components/DailyAlarmPromptCard', () => ({ DailyAlarmPromptCard: () => null }));
vi.mock('../components/StreakCelebration', () => ({ StreakCelebration: () => null }));
vi.mock('../lib/feedback', () => ({ feedbackLearned: vi.fn(), feedbackLessonComplete: vi.fn() }));
vi.mock('../lib/analytics', () => ({ logClick: vi.fn() }));
Object.defineProperty(globalThis, 'IS_REACT_ACT_ENVIRONMENT', { value: true, configurable: true });

// 검사용 문서 환경은 브라우저의 모달 대화상자 메서드를 제공하지 않는다.
Object.defineProperties(HTMLDialogElement.prototype, {
  showModal: { configurable: true, value() { this.open = true; } },
  close: { configurable: true, value() { this.open = false; } },
});
Object.defineProperty(HTMLElement.prototype, 'scrollTo', { configurable: true, value: vi.fn() });
Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', { configurable: true, value: vi.fn() });
let cleanup = () => {};
beforeEach(() => {
  vi.clearAllMocks();
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ json: async () => [] }));
  mocks.claimPromotion.mockResolvedValue(0);
  mocks.courses = [];
  mocks.allWords = [];
  mocks.knownWords = [];
  mocks.useNews.mockReturnValue({ newsItems: [], newsStatus: 'success' });
});
afterEach(() => { cleanup(); vi.restoreAllMocks(); vi.unstubAllGlobals(); vi.useRealTimers(); });
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
      <Route path="/course" element={<Destination />} />
      <Route path="/quiz" element={<Destination />} />
    </Routes>
  </MemoryRouter>));
  cleanup = () => { act(() => root.unmount()); container.remove(); };
  return { container, click: (text: string) => {
    const button = [...container.querySelectorAll('button')].find(button => button.textContent === text)!;
    act(() => button.click());
  } };
};

describe('레슨 완료 후 다음 행동', () => {
  it('추가 문제를 강제하지 않고 코스로 돌아간다', () => {
    const { container, click } = mount([{ type: 'quiz', lessonCheck: true, q: '어떤 변화가 생길까요?', options: ['증가', '감소'], answer: 0, explanation: '조건이 같을 때 증가해요.' }]);
    expect(container.textContent).toContain('오늘 용어, 한 바퀴 끝!');
    expect(container.textContent).not.toContain('이제 할 수 있어요');
    expect(logClick).toHaveBeenCalledWith('lesson_view_complete', { course_id: 'c1', node_id: 'c1-l0', total: 1 });
    expect(container.querySelector('[data-tone="primary"]')).toHaveTextContent('코스로 돌아가기');
    click('코스로 돌아가기');
    expect(container.textContent).toContain('/course');
    expect(container.textContent).toContain('openFocus');
  });

  it('추가 연습을 선택하면 기존 용어 퀴즈로 연결한다', () => {
    const { container, click } = mount([]);
    expect(container.textContent).not.toContain('준비 중');
    click('더 연습하기');
    expect(container.textContent).toContain('/quiz');
    expect(container.textContent).toContain('lesson_recall');
  });

  it('상황 문제가 있는 레슨은 선택형 추가 연습에서 코스 정보를 유지한다', () => {
    const { container, click } = mount([{ type: 'quiz', lessonCheck: true, q: '어떤 변화가 생길까요?', options: ['증가', '감소'], answer: 0, explanation: '조건이 같을 때 증가해요.' }]);
    click('더 연습하기');
    expect(container.textContent).toContain('/lesson-check');
    expect(container.textContent).toContain('c1-l0');
    expect(container.textContent).toContain('/course?topic=2');
  });
});

const makeWord = (id: number, name: string, relatedWords: string[] = []): Word => ({
  id, word: name, meaning: `${name}의 뜻 (${id})`, detailedMeaning: `${name}의 상세 설명이에요.`,
  newsExample: '', hint: '', difficulty: 1, relatedWords,
});

const mountLesson = (autoAdvance = true, example = '', studyWord = makeWord(2, '학습 용어', ['같은 코스', '다른 코스']), initialIndex = 0) => {
  const words = [makeWord(1, '첫 용어'), studyWord, makeWord(3, '같은 코스', ['다른 코스']), makeWord(4, '마지막 용어')];
  words[0].learningExample = example;
  words[1].visuals ??= [
    { type: 'table', title: '학습 용어와 비슷한 개념', columns: ['용어', '뜻'], rows: [['학습 용어', '지금 읽는 뜻'], ['같은 코스', '비슷한 용어의 뜻']] },
    { type: 'table', title: '계산 예시', columns: ['수량', '금액'], rows: [['1개', '100원']] },
  ];
  const otherWord = makeWord(20, '다른 코스', ['학습 용어']);
  mocks.allWords = [...words, otherWord];
  mocks.courses = [
    { id: 'c1', level: '1', title: '학습 코스', description: '', category: '', words },
    { id: 'c2', level: '2', title: '다른 코스', description: '', category: '', words: [...Array.from({ length: 17 }, (_, i) => makeWord(100 + i, `별도 용어${i}`)), otherWord] },
  ];
  const state = { words, index: initialIndex, autoAdvance, courseId: 'c1', courseTitle: '학습 코스', nodeId: 'c1-l0', backPath: '/course?topic=2', backState: { selected: 'c1' } };
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);
  const Probe = () => <output data-location>{JSON.stringify(useLocation())}</output>;
  act(() => root.render(<MemoryRouter initialEntries={[{ pathname: '/word-card', state }]}>
    <Probe />
    <Routes>
      <Route path="/word-card" element={<WordCardScreen />} />
      <Route path="/quiz" element={<Destination />} />
      <Route path="/course" element={<Destination />} />
    </Routes>
  </MemoryRouter>));
  cleanup = () => { act(() => root.unmount()); container.remove(); };
  const normalize = (text: string) => text.replace(/\s+/g, ' ').trim();
  const find = (text: string, scope: ParentNode) => [...scope.querySelectorAll('button')].find(button => normalize(button.getAttribute('aria-label') ?? button.textContent ?? '') === normalize(text));
  const click = (text: string, scope: ParentNode = container) => {
    const button = find(text, scope);
    expect(button, `${text} 버튼`).toBeDefined();
    act(() => { button!.focus(); button!.click(); });
    return button!;
  };
  const advancePage = () => {
    const button = container.querySelector<HTMLButtonElement>('[data-word-next]')!;
    act(() => button.click());
    act(() => vi.advanceTimersByTime(700));
  };
  const reachCheck = () => {
    for (let i = 0; i < 3 && !container.querySelector('.word-quick-check'); i++) advancePage();
  };
  const completeWord = () => {
    if (container.querySelector('.word-complete-screen')) return;
    if (!container.querySelector('[data-study-unit="feedback"]')) {
      reachCheck();
      const option = container.querySelector<HTMLButtonElement>('.word-check-options button:not(:disabled)');
      if (option) act(() => option.click());
      advancePage();
    }
    advancePage();
  };
  const next = () => { completeWord(); click('다음 단어'); };
  const resourcesDialog = () => container.querySelector<HTMLDialogElement>('dialog[data-word-resources-modal]')!;
  const openReferences = () => {
    click('더 알아보기');
  };
  const location = () => container.querySelector('[data-location]')!.textContent;
  const dialog = () => container.querySelector<HTMLDialogElement>('dialog[data-related-word-preview]')!;
  return { container, words, otherWord, click, next, advancePage, reachCheck, completeWord, openReferences, location, dialog, resourcesDialog };
};

describe('단어별 페이지 학습', () => {
  it('뜻·예시·문제·해설을 각각 한 화면에서 보고 완료할 때만 기록한다', () => {
    vi.useFakeTimers();
    const view = mountLesson(true, '학습용 가정: 물건을 비교하는 예시예요.');
    const screen = () => view.container.querySelector('.word-study-screen')!;
    const counter = () => view.container.querySelector('[data-study-page-count]');
    expect(counter()).toHaveTextContent('1/4');
    expect(screen().querySelector('[role="progressbar"]')).toHaveAttribute('aria-valuetext', '1/4 뜻');
    expect(screen().querySelector('.word-study-stepper [data-state="current"]')).toHaveTextContent('뜻');
    expect(screen().querySelector('.quiz-bubble')).toHaveTextContent('첫 용어의 뜻');
    expect(screen().querySelector('.word-meaning-example')).toBeNull();
    expect(screen().querySelector('details')).toBeNull();
    view.advancePage();
    expect(counter()).toHaveTextContent('2/4');
    expect(screen().querySelector('.word-study-stepper [data-state="current"]')).toHaveTextContent('예시');
    expect(screen().querySelectorAll('.word-study-stepper [data-state="done"]')).toHaveLength(1);
    expect(screen()).toHaveTextContent('물건을 비교하는 예시예요.');
    expect(screen().querySelector('.word-meaning-definition')).toBeNull();
    expect(screen().querySelectorAll('[data-study-unit]')).toHaveLength(1);
    view.advancePage();
    expect(counter()).toHaveTextContent('3/4');
    expect(screen().querySelector('[data-word-next]')).toBeDisabled();
    expect(mocks.setKnownWords).not.toHaveBeenCalled();
    const answer = maskTerm(view.words[0].meaning, view.words[0].word);
    view.click(answer);
    view.click('이전');
    act(() => vi.advanceTimersByTime(700));
    expect(counter()).toHaveTextContent('2/4');
    view.advancePage();
    expect(screen().querySelector('[aria-pressed="true"]')).toHaveAttribute('aria-label', answer);
    expect(screen().querySelector('.word-check-feedback')).toBeNull();
    view.advancePage();
    expect(counter()).toHaveTextContent('4/4');
    expect(screen().querySelector('.word-study-stepper [data-state="current"]')).toHaveTextContent('해설');
    expect(screen().querySelectorAll('.word-study-stepper [data-state="done"]')).toHaveLength(3);
    expect(screen().querySelector('.word-check-feedback')).toHaveTextContent('맞았어요!');
    expect(screen().querySelector('.word-check-options')).toBeNull();
    expect(mocks.setKnownWords).not.toHaveBeenCalled();
    view.click('이전');
    act(() => vi.advanceTimersByTime(700));
    expect(screen().querySelector('.word-check-options button')).toBeDisabled();
    view.advancePage();
    expect(screen().querySelector('.word-check-feedback')).toHaveTextContent('맞았어요!');
    view.completeWord();
    expect(mocks.setKnownWords).toHaveBeenCalledTimes(1);
    const update = mocks.setKnownWords.mock.calls[0][0] as (previous: Word[]) => Word[];
    expect(update([])).toEqual([view.words[0]]);
    expect(update([view.words[0]])).toEqual([view.words[0]]);
    expect(view.container.querySelector('.word-complete-screen')).toHaveTextContent('단어 하나 클리어!');
    expect(view.container.querySelector('.word-complete-screen')).not.toHaveTextContent('첫 용어의 뜻');
    view.click('다음 단어');
    expect(counter()).toHaveTextContent('1/4');
    expect(screen().querySelector('.word-meaning-example')).toBeNull();
    expect(screen().querySelector('[role="progressbar"]')).toHaveAttribute('aria-label', `${view.words[1].word} 페이지 진행률`);
    view.reachCheck();
    expect(screen().querySelector('[aria-pressed="true"]')).toBeNull();
    expect(screen().querySelector('.word-check-feedback')).toBeNull();
    expect(screen().querySelector('[data-word-next]')).toBeDisabled();
  });

  it('오답에도 정답과 해설을 보여준 뒤 완료할 수 있다', () => {
    vi.useFakeTimers();
    const word = makeWord(2, '학습 용어');
    word.visuals = [{ type: 'quiz', lessonCheck: true, q: '어떤 변화가 생길까요?', options: ['증가', '감소'], answer: 0, explanation: '조건이 같을 때 증가해요.' }];
    const view = mountLesson(true, '', word);
    view.next();
    vi.clearAllMocks();
    view.reachCheck();
    view.click('감소');
    view.advancePage();
    const feedback = view.container.querySelector('.word-check-feedback');
    expect(feedback).toHaveTextContent('정답 · 증가');
    expect(feedback).toHaveTextContent('조건이 같을 때 증가해요.');
    expect(mocks.setKnownWords).not.toHaveBeenCalled();
    view.completeWord();
    expect(mocks.setKnownWords).toHaveBeenCalledTimes(1);
  });

  it('한 단어를 완료한 뒤 코스로 돌아갈 수 있고 마지막 단어 뒤에는 학습을 마무리한다', () => {
    vi.useFakeTimers();
    const view = mountLesson();
    view.next();
    view.next();
    view.next();
    view.completeWord();
    expect(mocks.setKnownWords).toHaveBeenCalledTimes(4);
    view.click('학습 마무리');
    expect(view.container).toHaveTextContent('오늘 용어, 한 바퀴 끝!');
    expect(logClick).toHaveBeenCalledWith('lesson_view_complete', { course_id: 'c1', node_id: 'c1-l0', total: 4 });
    view.click('코스로 돌아가기');
    expect(view.location()).toContain('/course');
    expect(view.location()).toContain('openFocus');
  });

  it('한 단어만 완료하고 나가면 다른 단어는 기록하지 않는다', () => {
    vi.useFakeTimers();
    const view = mountLesson();
    view.completeWord();
    view.click('코스로 돌아가기');
    expect(mocks.setKnownWords).toHaveBeenCalledTimes(1);
    expect(view.location()).toContain('/course');
    expect(view.location()).toContain('topic=2');
    expect(logClick).not.toHaveBeenCalledWith('lesson_view_complete', expect.anything());
  });
});

describe('관련 용어 읽기 전용 미리보기', () => {
  const allWords = buildCourseContent(content.words, [], []).allWords;
  it.each(allWords)('$word의 자료를 추가 선택 없이 내용 손실 없이 제공한다', word => {
    vi.useFakeTimers();
    const { primary, more } = wordLessonVisuals(word);
    const view = mountLesson(true, '', word, 1);
    const texts: string[] = [];
    const collect = (unit = view.container.querySelector('[data-study-unit]')!) => {
      expect(view.container.querySelectorAll('[data-study-unit]')).toHaveLength(1);
      expect(unit.querySelectorAll('.word-visual-section').length).toBeLessThanOrEqual(1);
      texts.push(unit.textContent ?? '');
    };
    collect();
    const resourceButton = view.container.querySelector('[aria-label="더 알아보기"]');
    if (resourceButton) {
      view.click('더 알아보기');
      view.resourcesDialog().querySelectorAll('[data-resource-unit]').forEach(unit => collect(unit));
      view.click('더 알아보기 닫기');
      expect(view.container.querySelector('[data-study-unit]')).toHaveAttribute('data-study-unit', 'meaning');
    }
    const example = word.learningExample?.replace(/^\s*학습용 가정\s*:\s*/, '').trim();
    if (example) { view.advancePage(); collect(); }
    if (primary) { view.advancePage(); collect(); }
    const normalize = (text: string) => text.replace(/\s+/g, ' ').trim();
    const displayed = normalize(texts.join(' '));
    for (const visual of [primary, ...more]) {
      if (!visual) continue;
      expect(displayed).toContain(normalize(visual.title));
      if (visual.type === 'table') visual.rows.flat().filter(Boolean).forEach(cell => expect(displayed).toContain(normalize(cell)));
      if (visual.type === 'line') visual.series.forEach(series => expect(displayed).toContain(normalize(series.name)));
      if (visual.type === 'flow') visual.steps.forEach(step => expect(displayed).toContain(normalize(step)));
      if ('caption' in visual && visual.caption) expect(displayed).toContain(normalize(visual.caption));
    }
    (word.visuals ?? []).forEach(visual => {
      if (visual.type === 'text') visual.body.split(/\n+/).filter(Boolean).forEach(paragraph => expect(displayed).toContain(normalize(paragraph)));
    });
    if (example) expect(displayed).toContain(normalize(example));
    expect(mocks.setKnownWords).not.toHaveBeenCalled();
  });

  it('모달을 열면 모든 자료를 바로 읽고 닫으면 학습 페이지·스크롤·초점을 유지한다', () => {
    vi.useFakeTimers();
    const view = mountLesson(true, '', undefined, 1);
    view.advancePage();
    expect(view.container.querySelector('[data-study-unit]')).toHaveAttribute('data-study-unit', 'concept');
    expect(view.container.querySelector('[data-study-unit]')).toHaveTextContent('계산 예시');
    expect(view.container.querySelector('[data-study-unit]')).not.toHaveTextContent('학습 용어의 뜻');
    const content = view.container.querySelector<HTMLElement>('.word-study-content')!;
    content.scrollTop = 120;
    const trigger = view.click('더 알아보기');
    expect(view.resourcesDialog()).toHaveAttribute('open');
    expect(view.resourcesDialog()).toHaveAttribute('aria-modal', 'true');
    expect(view.resourcesDialog().querySelector('[data-resource-option]')).toBeNull();
    expect(view.resourcesDialog().querySelector('[data-resource-unit="detail"]')).toHaveTextContent('상세 설명');
    expect(view.resourcesDialog().querySelector('[data-resource-unit="visual-0"]')).toHaveTextContent('비슷한 용어의 뜻');
    expect(view.resourcesDialog().querySelector('[data-resource-unit="related"]')).toHaveTextContent('다른 코스');
    view.resourcesDialog().querySelector<HTMLElement>('.word-resources-body')!.scrollTop = 200;
    expect(view.container.querySelector('[data-study-unit]')).toHaveTextContent('계산 예시');
    view.click('더 알아보기 닫기');
    expect(view.resourcesDialog()).toBeNull();
    expect(content.scrollTop).toBe(120);
    expect(document.activeElement).toBe(trigger);
    expect(mocks.setKnownWords).not.toHaveBeenCalled();
    expect(view.container.querySelector('[data-study-unit]')).toHaveAttribute('data-study-unit', 'concept');
    view.completeWord();
    expect(view.container.querySelector('.word-complete-screen')).not.toHaveTextContent('비슷한 개념');
    expect(view.container.querySelector('.word-complete-screen')).not.toHaveTextContent('계산 예시');
  });

  it('다른 코스 18개 대신 해당 용어만 열고 실제 2/4 위치와 레슨 상태를 유지한다', () => {
    vi.useFakeTimers();
    const view = mountLesson();
    view.next(); // 경로 상태의 index=0과 다른 실제 학습 위치를 재현한다.
    view.openReferences();
    const originalLocation = view.location();
    expect(view.container.querySelector('.word-study-screen [role="progressbar"]')).toHaveAttribute('aria-label', `${view.words[1].word} 페이지 진행률`);
    vi.clearAllMocks();
    const trigger = view.click('다른 코스');
    expect(view.dialog()).toHaveAttribute('open');
    expect(view.dialog()).toHaveAttribute('aria-modal', 'true');
    expect(view.dialog().textContent).toContain('다른 코스 미리보기');
    expect(view.dialog().textContent).toContain('잠깐 구경하는 용어야. 닫으면 보던 곳으로 돌아가!');
    expect(view.dialog().querySelector('h1')?.textContent).toBe('다른 코스');
    expect(view.dialog().textContent).not.toContain('18/18');
    expect(view.dialog().textContent).not.toContain('살펴보기 완료');
    expect(view.location()).toBe(originalLocation);
    expect(view.container.querySelector('.word-study-screen')).toBeInTheDocument();
    view.click('미리보기 닫기', view.dialog());
    expect(view.dialog()).toBeNull();
    expect(document.activeElement).toBe(trigger);
    expect(view.resourcesDialog().querySelector('[data-resource-unit="related"]')).toHaveTextContent('관련 용어');
    expect(view.location()).toBe(originalLocation);
    expect(mocks.setKnownWords).not.toHaveBeenCalled();
    expect(mocks.claimPromotion).not.toHaveBeenCalled();
    expect(mocks.claimPromotionReward).not.toHaveBeenCalled();
    expect(logClick).not.toHaveBeenCalledWith('lesson_view_complete', expect.anything());
    view.click('더 알아보기 닫기');
    view.next();
    expect(view.container.querySelector('.word-study-screen [role="progressbar"]')).toHaveAttribute('aria-label', `${view.words[2].word} 페이지 진행률`);
    expect(mocks.setKnownWords).toHaveBeenCalledTimes(1);
  });

  it('같은 코스와 중첩 용어를 왕복하고 닫아도 원래 학습 위치를 바꾸지 않는다', () => {
    vi.useFakeTimers();
    const view = mountLesson(false);
    view.next();
    view.openReferences();
    const originalLocation = view.location();
    view.click('같은 코스');
    expect(view.dialog().querySelector('h1')?.textContent).toBe('같은 코스');
    view.click('다른 코스', view.dialog());
    expect(view.dialog().querySelector('h1')?.textContent).toBe('다른 코스');
    view.click('학습 용어', view.dialog());
    expect(view.dialog().querySelector('h1')?.textContent).toBe('학습 용어');
    view.click('이전 미리보기', view.dialog());
    expect(view.dialog().querySelector('h1')?.textContent).toBe('다른 코스');
    view.click('이전 미리보기', view.dialog());
    expect(view.dialog().querySelector('h1')?.textContent).toBe('같은 코스');
    expect(view.dialog().textContent).not.toContain('이전 미리보기');
    view.click('다른 코스', view.dialog());
    view.click('미리보기 닫기', view.dialog());
    expect(view.resourcesDialog().querySelector('[data-resource-unit="related"]')).toHaveTextContent('관련 용어');
    expect(view.container.querySelector('.word-study-screen [role="progressbar"]')).toHaveAttribute('aria-label', `${view.words[1].word} 페이지 진행률`);
    expect(view.location()).toBe(originalLocation);
    expect(mocks.setKnownWords).not.toHaveBeenCalled();
  });

  it('미리보기 용어의 상세·뉴스를 지원하고 취소와 배경 클릭으로 닫는다', () => {
    vi.useFakeTimers();
    const view = mountLesson(false);
    view.next();
    view.openReferences();
    mocks.useNews.mockImplementation((words: Word[]) => ({ newsStatus: 'success', newsItems: words[0].id === 20 ? [{ title: '다른 코스 뉴스', description: '', link: 'https://example.com/news', pubDate: '2026-10-16' }] : [] }));
    view.click('다른 코스');
    const detail = view.dialog().querySelector('details')!;
    act(() => detail.querySelector('summary')!.click());
    expect(detail.open).toBe(true);
    expect(detail.textContent).toContain('다른 코스의 상세 설명이에요.');
    expect(mocks.useNews).toHaveBeenCalledWith([view.otherWord], 0);
    const newsButton = [...view.dialog().querySelectorAll('button')].find(button => button.textContent?.includes('다른 코스 뉴스'))!;
    act(() => newsButton.click());
    expect(mocks.openExternalUrl).toHaveBeenCalledWith('https://example.com/news');
    act(() => { expect(dismissRelatedWordPreview()).toBe(true); });
    expect(view.dialog()).toBeNull();
    expect(view.container.querySelector('.word-study-screen [role="progressbar"]')).toHaveAttribute('aria-label', `${view.words[1].word} 페이지 진행률`);
    view.click('같은 코스');
    act(() => view.dialog().click());
    expect(view.dialog()).toBeNull();
    expect(view.resourcesDialog()).toHaveAttribute('open');
  });

  it.each(['닫기', '취소', '배경', '앱 뒤로가기'])('%s로 자료 모달을 닫아도 학습 기록을 변경하지 않는다', method => {
    const view = mountLesson(false);
    const originalLocation = view.location();
    const trigger = view.click('더 알아보기');
    if (method === '닫기') view.click('더 알아보기 닫기');
    else act(() => {
      if (method === '취소') view.resourcesDialog().dispatchEvent(new Event('cancel', { cancelable: true }));
      if (method === '배경') view.resourcesDialog().click();
      if (method === '앱 뒤로가기') expect(dismissWordResources()).toBe(true);
    });
    expect(view.resourcesDialog()).toBeNull();
    expect(document.activeElement).toBe(trigger);
    expect(view.location()).toBe(originalLocation);
    expect(view.container.querySelector('[data-study-unit]')).toHaveAttribute('data-study-unit', 'meaning');
    expect(mocks.setKnownWords).not.toHaveBeenCalled();
    expect(mocks.claimPromotionReward).not.toHaveBeenCalled();
    expect(dismissWordResources()).toBe(false);
  });

  it('출처는 학습 화면에서 분리해 모달 안에 표시한다', () => {
    const word = { ...makeWord(2, '출처 용어'), sources: ['bok800', 'tesat', 'sgsg'] };
    const view = mountLesson(false, '', word, 1);
    expect(view.container.textContent).not.toContain('한국은행 경제금융용어 800선');
    view.click('더 알아보기');
    expect(view.resourcesDialog()).toHaveTextContent('한국은행 경제금융용어 800선');
    expect(view.resourcesDialog()).toHaveTextContent('TESAT');
    expect(view.resourcesDialog()).toHaveTextContent('한경 생글생글 경제 퀴즈');
  });
});

it('중첩 탐색 시 새 제목으로 초점을 옮기고 미리보기 안에서 순환한다', () => {
 vi.useFakeTimers();const view=mountLesson(false);view.next();view.openReferences();view.click('다른 코스');
 const items=[...view.dialog().querySelectorAll<HTMLElement>('button:not([disabled]), summary, a[href], [tabindex="0"]')];
 for(const item of items)vi.spyOn(item,'getClientRects').mockReturnValue([{} as DOMRect] as unknown as DOMRectList);
 const first=items[0],last=items[items.length-1];
 act(()=>{last.focus();last.dispatchEvent(new KeyboardEvent('keydown',{key:'Tab',bubbles:true,cancelable:true}));});expect(document.activeElement).toBe(first);
 act(()=>{first.dispatchEvent(new KeyboardEvent('keydown',{key:'Tab',shiftKey:true,bubbles:true,cancelable:true}));});expect(document.activeElement).toBe(last);
 view.click('학습 용어',view.dialog());expect(document.activeElement).toBe(view.dialog().querySelector('header h2'));
 view.click('미리보기 닫기',view.dialog());expect(view.container.querySelector('.word-study-screen [role="progressbar"]')).toHaveAttribute('aria-label', `${view.words[1].word} 페이지 진행률`);
});
