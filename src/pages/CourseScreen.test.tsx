import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Course, Word } from '../types';
import CourseScreen from './CourseScreen';

const state = vi.hoisted(() => ({
  ctx: {} as Record<string, unknown>,
  doneNodes: new Set<string>(),
  openShop: vi.fn(),
  retryContent: vi.fn(),
  spendEnergy: vi.fn(),
  spendPoints: vi.fn(),
  claimFirstLesson: vi.fn(),
  pickRecallWords: vi.fn(),
  storage: new Map<string, string>(),
  getItem: vi.fn(),
  setItem: vi.fn(),
}));

vi.mock('../context/AppContext', () => ({ useAppContext: () => state.ctx }));
vi.mock('../lib/pathProgress', () => ({ loadDoneNodes: vi.fn(() => Promise.resolve(state.doneNodes)) }));
vi.mock('../lib/storage', () => ({
  Storage: {
    getItem: (key: string) => state.getItem(key),
    setItem: (key: string, value: string) => state.setItem(key, value),
  },
}));
vi.mock('../lib/feedback', () => ({ feedbackNodeTap: vi.fn() }));
vi.mock('../lib/analytics', () => ({ logClick: vi.fn() }));
vi.mock('../components/AlertModal', () => ({ showModal: vi.fn() }));

Object.defineProperty(globalThis, 'IS_REACT_ACT_ENVIRONMENT', { value: true, configurable: true });

const word = (id: number): Word => ({
  id,
  word: `용어${id}`,
  meaning: '',
  detailedMeaning: '',
  newsExample: '',
  hint: '',
  difficulty: 1,
});

const course = ({ id = 'c1', category = '경제', wordCount = 4, startId = 1 }: {
  id?: string;
  category?: string;
  wordCount?: number;
  startId?: number;
} = {}): Course => ({
  id,
  level: '기초',
  title: '경제 기초',
  description: '',
  category,
  words: Array.from({ length: wordCount }, (_, i) => word(startId + i)),
});

let cleanup = () => {};
afterEach(() => cleanup());

const baseContext = (overrides: Record<string, unknown> = {}) => {
  state.openShop = vi.fn();
  state.retryContent = vi.fn();
  state.spendEnergy = vi.fn(() => Promise.resolve(true));
  state.spendPoints = vi.fn(() => Promise.resolve(true));
  state.claimFirstLesson = vi.fn(() => Promise.resolve('free'));
  state.pickRecallWords = vi.fn(() => []);
  state.doneNodes = new Set<string>();
  state.ctx = {
    hydrated: true,
    contentStatus: 'ready',
    retryContent: state.retryContent,
    knownIds: new Set<number>(),
    viewedIds: overrides.knownIds ?? new Set<number>(),
    dueQueue: [],
    nextReviewDate: null,
    energyMax: 25,
    courses: [course()],
    points: 1000,
    energy: 25,
    spendEnergy: state.spendEnergy,
    spendPoints: state.spendPoints,
    claimFirstLesson: state.claimFirstLesson,
    pickRecallWords: state.pickRecallWords,
    openShop: state.openShop,
    ...overrides,
  };
};

const mount = async (entry = '/course?topic=0') => {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);
  await act(async () => {
    root.render(
      <MemoryRouter initialEntries={[entry]}>
        <Routes>
          <Route path="/course" element={<CourseScreen />} />
          <Route path="/word-card" element={<div>단어 카드</div>} />
          <Route path="/quiz" element={<div>퀴즈 화면</div>} />
        </Routes>
      </MemoryRouter>,
    );
  });
  cleanup = () => { act(() => root.unmount()); container.remove(); };
  const clickButtonContaining = async (text: string) => {
    const button = [...container.querySelectorAll('button')].find(el => el.textContent?.includes(text));
    expect(button, `버튼: ${text}`).toBeDefined();
    await act(async () => {
      button!.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });
  };
  return { container, clickButtonContaining };
};

const flushScrollEffects = async () => {
  await act(async () => {
    await Promise.resolve();
    await new Promise(resolve => setTimeout(resolve, 0));
    await Promise.resolve();
    await new Promise(resolve => setTimeout(resolve, 0));
  });
};

beforeEach(() => {
  HTMLElement.prototype.scrollTo = vi.fn();
  HTMLElement.prototype.scrollIntoView = vi.fn();
  window.matchMedia = vi.fn(() => ({ matches: true } as unknown as MediaQueryList));
  state.storage.clear();
  state.getItem.mockImplementation(async (key: string) => state.storage.get(key) ?? null);
  state.setItem.mockImplementation(async (key: string, value: string) => {
    state.storage.set(key, value);
  });
  baseContext();
});

describe('CourseScreen energy gates', () => {
  it('홈에서 복습과 새 학습을 보여주고 자동 스크롤로 가리지 않는다', async () => {
    baseContext({
      courses: [
        course({ id: 'c1', category: '경제', wordCount: 4, startId: 1 }),
        course({ id: 'c2', category: '금융', wordCount: 8, startId: 5 }),
      ],
      knownIds: new Set([1, 2, 3, 4]),
    });
    const { container } = await mount('/course');
    await flushScrollEffects();

    expect(container.textContent).toContain('오늘 다시 볼 용어 0개');
    expect(container.textContent).toContain('새로운 용어 이어 배우기');
    expect(HTMLElement.prototype.scrollIntoView).not.toHaveBeenCalled();
  });

  it('확인한 용어가 늘어도 일반 성장 모달은 띄우지 않는다', async () => {
    state.storage.set('course_seen_growth_known_count_v1', '1');
    baseContext({ knownIds: new Set([1, 2]) });
    const { container } = await mount('/course');
    await flushScrollEffects();

    expect(container.textContent).not.toContain('눌러서 지금까지 쌓은 기록 보기');
    expect(container.querySelector('[role="dialog"]')).not.toBeInTheDocument();
  });

  it('주제 화면에서 현재 학습 노드로 스크롤한다', async () => {
    baseContext({ courses: [course({ wordCount: 12 })], knownIds: new Set([1, 2, 3, 4]) });
    await mount('/course?topic=0');
    await flushScrollEffects();

    const scrollIntoView = vi.mocked(HTMLElement.prototype.scrollIntoView);
    const target = scrollIntoView.mock.contexts.find(el => (el as HTMLElement).textContent?.includes('용어5부터 시작하기'));
    expect(target).toBeDefined();
  });

  it('레슨 콘텐츠 로드 실패 화면에서 다시 시도를 호출한다', async () => {
    baseContext({ contentStatus: 'error', courses: [] });
    const { container, clickButtonContaining } = await mount('/course');

    expect(container.textContent).toContain('학습 내용을 불러오지 못했어요');
    await clickButtonContaining('다시 시도');

    expect(state.retryContent).toHaveBeenCalledTimes(1);
  });

  it('새 레슨 시작 시 에너지가 부족하면 이동하지 않고 에너지 상점을 연다', async () => {
    const spendEnergy = vi.fn(() => Promise.resolve(false));
    baseContext({ energy: 0, spendEnergy });
    const { container, clickButtonContaining } = await mount();

    await clickButtonContaining('용어1');

    expect(spendEnergy).toHaveBeenCalledWith(1, 'lesson', 'c1-l0:1,2,3,4');
    expect(state.openShop).toHaveBeenCalledWith('energy');
    expect(container.textContent).not.toContain('단어 카드');
  });

  it('연속 탭은 에너지 차감과 이동을 한 번만 실행한다', async () => {
    let resolveSpend!: (value: boolean) => void;
    state.spendEnergy = vi.fn(() => new Promise<boolean>(resolve => { resolveSpend = resolve; }));
    state.ctx = { ...state.ctx, spendEnergy: state.spendEnergy };
    const { container } = await mount();
    const button = [...container.querySelectorAll('button')].find(el => el.textContent?.includes('용어1'))!;

    act(() => {
      button.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      button.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });
    expect(state.spendEnergy).toHaveBeenCalledTimes(1);

    await act(async () => { resolveSpend(true); });
    expect(container.textContent).toContain('단어 카드');
  });

  it('완료 레슨 재진입은 에너지를 다시 쓰지 않는다', async () => {
    baseContext({ knownIds: new Set([1, 2, 3, 4]) });
    const { container, clickButtonContaining } = await mount();

    await clickButtonContaining('용어1');

    expect(state.spendEnergy).not.toHaveBeenCalled();
    expect(state.spendPoints).not.toHaveBeenCalled();
    expect(state.claimFirstLesson).not.toHaveBeenCalled();
    expect(container.textContent).toContain('단어 카드');
  });

  it('포인트가 없어도 다른 주제의 첫 레슨을 시작한다', async () => {
    baseContext({ points: 0, courses: [course({ category: '경제' }), course({ id: 'c2', category: '금융', startId: 5 })] });
    const { container, clickButtonContaining } = await mount('/course?topic=1');
    expect(container.textContent).toContain('코스 1/1');
    expect(container.textContent).not.toContain('코스 2/1');
    await clickButtonContaining('용어5');
    expect(container.textContent).toContain('단어 카드');
    expect(state.spendPoints).not.toHaveBeenCalled();
    expect(state.spendEnergy).toHaveBeenCalledWith(1, 'lesson', 'c2-l0:5,6,7,8');
  });

  it('복습에서 틀렸어도 열람 진도가 있으면 다음 레슨은 잠기지 않는다', async () => {
    baseContext({ courses: [course({ wordCount: 8 })], knownIds: new Set(), viewedIds: new Set([1, 2, 3, 4]) });
    const { container, clickButtonContaining } = await mount();
    expect(container.textContent).toContain('살펴봄');
    await clickButtonContaining('용어5');
    expect(container.textContent).toContain('단어 카드');
  });

  it('홈의 이어 배우기는 마지막으로 시작한 주제로 이동한다', async () => {
    state.storage.set('learning_resume_course_v1', 'c2');
    baseContext({ courses: [course({ category: '경제' }), course({ id: 'c2', category: '금융', startId: 5 })], knownIds: new Set([5]) });
    const { container, clickButtonContaining } = await mount('/course');
    await clickButtonContaining('새로운 용어 이어 배우기');
    expect(container.textContent).toContain('용어5부터 시작하기');
    expect(container.textContent).not.toContain('용어1부터 시작하기');
  });

  it('새 레슨 앞에 과거 용어 인출 문제가 있으면 먼저 퀴즈로 보낸다', async () => {
    state.pickRecallWords = vi.fn(() => [word(9), word(10)]);
    state.ctx = { ...state.ctx, pickRecallWords: state.pickRecallWords };
    const { container, clickButtonContaining } = await mount();

    await clickButtonContaining('용어1');

    expect(state.spendEnergy).toHaveBeenCalledTimes(1);
    expect(state.pickRecallWords).toHaveBeenCalledWith({ excludeIds: [1, 2, 3, 4], count: 3 });
    expect(container.textContent).toContain('퀴즈 화면');
    expect(container.textContent).not.toContain('단어 카드');
  });

  it('코스 복습은 에너지를 쓰지 않고 복습 퀴즈로 간다', async () => {
    baseContext({ knownIds: new Set([1, 2, 3, 4]) });
    const { container, clickButtonContaining } = await mount();

    await clickButtonContaining('배운 용어 다시 연결하기');

    expect(state.spendEnergy).not.toHaveBeenCalled();
    expect(state.pickRecallWords).toHaveBeenCalledWith({ candidates: [1, 2, 3, 4].map(word), count: 10 });
    expect(container.textContent).toContain('퀴즈 화면');
  });
});
