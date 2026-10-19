import { act, type ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Course, Word } from '../types';
import WordCardScreen from './WordCardScreen';
import { logClick } from '../lib/analytics';
import { dismissRelatedWordPreview } from '../lib/backEvent';

const mocks = vi.hoisted(() => ({
  courses: [] as Course[], allWords: [] as Word[],
  setKnownWords: vi.fn(), claimPromotionReward: vi.fn(), claimPromotion: vi.fn(),
  useNews: vi.fn(), openExternalUrl: vi.fn(),
}));
vi.mock('../context/AppContext', () => ({ useAppContext: () => ({
  courses: mocks.courses, allWords: mocks.allWords, knownWords: [], knownIds: new Set([1]), hydrated: true,
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
let cleanup = () => {};
beforeEach(() => {
  vi.clearAllMocks();
  mocks.claimPromotion.mockResolvedValue(0);
  mocks.courses = [];
  mocks.allWords = [];
  mocks.useNews.mockReturnValue({ newsItems: [], newsStatus: 'success' });
});
afterEach(() => { cleanup(); vi.restoreAllMocks(); vi.useRealTimers(); });
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

const makeWord = (id: number, name: string, relatedWords: string[] = []): Word => ({
  id, word: name, meaning: `${name}의 뜻`, detailedMeaning: `${name}의 상세 설명이에요.`,
  newsExample: '', hint: '', difficulty: 1, relatedWords,
});

const mountLesson = (autoAdvance = true) => {
  const words = [makeWord(1, '첫 용어'), makeWord(2, '학습 용어', ['같은 코스', '다른 코스']), makeWord(3, '같은 코스', ['다른 코스']), makeWord(4, '마지막 용어')];
  const otherWord = makeWord(20, '다른 코스', ['학습 용어']);
  mocks.allWords = [...words, otherWord];
  mocks.courses = [
    { id: 'c1', level: '1', title: '학습 코스', description: '', category: '', words },
    { id: 'c2', level: '2', title: '다른 코스', description: '', category: '', words: [...Array.from({ length: 17 }, (_, i) => makeWord(100 + i, `별도 용어${i}`)), otherWord] },
  ];
  const state = { words, index: 0, autoAdvance, courseId: 'c1', courseTitle: '학습 코스', nodeId: 'c1-l0', backPath: '/course?topic=2', backState: { selected: 'c1' } };
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
  const click = (text: string, scope: ParentNode = container) => {
    const button = [...scope.querySelectorAll('button')].find(button => button.textContent?.replace(/^\d+\s*/, '').trim() === text);
    expect(button, `${text} 버튼`).toBeDefined();
    act(() => { button!.focus(); button!.click(); });
    return button!;
  };
  const next = () => { click('다음'); act(() => vi.advanceTimersByTime(700)); };
  const location = () => container.querySelector('[data-location]')!.textContent;
  const dialog = () => container.querySelector('dialog')!;
  return { container, words, otherWord, click, next, location, dialog };
};

describe('관련 용어 읽기 전용 미리보기', () => {
  it('다른 코스 18개 대신 해당 용어만 열고 실제 2/4 위치와 레슨 상태를 유지한다', () => {
    vi.useFakeTimers();
    const view = mountLesson();
    view.next(); // 경로 상태의 index=0과 다른 실제 학습 위치를 재현한다.
    const originalLocation = view.location();
    expect(view.container.textContent).toContain('2/4');
    vi.clearAllMocks();
    const trigger = view.click('다른 코스');
    expect(view.dialog()).toHaveAttribute('open');
    expect(view.dialog()).toHaveAttribute('aria-modal', 'true');
    expect(view.dialog().textContent).toContain('다른 코스 미리보기');
    expect(view.dialog().textContent).toContain('읽기 전용');
    expect(view.dialog().querySelector('h1')?.textContent).toBe('다른 코스');
    expect(view.dialog().textContent).not.toContain('18/18');
    expect(view.dialog().textContent).not.toContain('살펴보기 완료');
    expect(view.location()).toBe(originalLocation);
    expect(view.container.querySelector('[role="progressbar"]')).toHaveAttribute('aria-valuenow', '2');
    view.click('미리보기 닫기', view.dialog());
    expect(view.container.querySelector('dialog')).toBeNull();
    expect(document.activeElement).toBe(trigger);
    expect(view.container.querySelector('h1')?.textContent).toBe('학습 용어');
    expect(view.location()).toBe(originalLocation);
    expect(mocks.setKnownWords).not.toHaveBeenCalled();
    expect(mocks.claimPromotion).not.toHaveBeenCalled();
    expect(mocks.claimPromotionReward).not.toHaveBeenCalled();
    expect(logClick).not.toHaveBeenCalledWith('lesson_view_complete', expect.anything());
    view.next();
    expect(view.container.textContent).toContain('3/4');
    expect(mocks.setKnownWords).toHaveBeenCalledTimes(1);
  });

  it('같은 코스와 중첩 용어를 왕복하고 닫아도 원래 학습 위치를 바꾸지 않는다', () => {
    vi.useFakeTimers();
    const view = mountLesson(false);
    view.next();
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
    expect(view.container.querySelector('h1')?.textContent).toBe('학습 용어');
    expect(view.container.textContent).toContain('2/4');
    expect(view.location()).toBe(originalLocation);
    expect(mocks.setKnownWords).not.toHaveBeenCalled();
  });

  it('미리보기 용어의 상세·뉴스를 지원하고 취소와 배경 클릭으로 닫는다', () => {
    vi.useFakeTimers();
    const view = mountLesson(false);
    view.next();
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
    expect(view.container.querySelector('dialog')).toBeNull();
    expect(view.container.textContent).toContain('2/4');
    view.click('같은 코스');
    act(() => view.dialog().click());
    expect(view.container.querySelector('dialog')).toBeNull();
  });
});

it('중첩 탐색 시 새 제목으로 초점을 옮기고 미리보기 안에서 순환한다', () => {
 vi.useFakeTimers();const view=mountLesson(false);view.next();view.click('다른 코스');
 const items=[...view.dialog().querySelectorAll<HTMLElement>('button:not([disabled]), summary, a[href], [tabindex="0"]')];
 for(const item of items)vi.spyOn(item,'getClientRects').mockReturnValue([{} as DOMRect] as unknown as DOMRectList);
 const first=items[0],last=items[items.length-1];
 act(()=>{last.focus();last.dispatchEvent(new KeyboardEvent('keydown',{key:'Tab',bubbles:true,cancelable:true}));});expect(document.activeElement).toBe(first);
 act(()=>{first.dispatchEvent(new KeyboardEvent('keydown',{key:'Tab',shiftKey:true,bubbles:true,cancelable:true}));});expect(document.activeElement).toBe(last);
 view.click('학습 용어',view.dialog());expect(document.activeElement).toBe(view.dialog().querySelector('header h2'));
 view.click('미리보기 닫기',view.dialog());expect(view.container.textContent).toContain('2/4');
});
