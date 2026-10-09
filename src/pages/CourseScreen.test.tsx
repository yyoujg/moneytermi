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
}));

vi.mock('../context/AppContext', () => ({ useAppContext: () => state.ctx }));
vi.mock('../lib/pathProgress', () => ({ loadDoneNodes: vi.fn(() => Promise.resolve(state.doneNodes)) }));
vi.mock('../lib/storage', () => ({
  Storage: {
    getItem: vi.fn(() => Promise.resolve(null)),
    setItem: vi.fn(() => Promise.resolve()),
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

const course = (): Course => ({
  id: 'c1',
  level: '기초',
  title: '경제 기초',
  description: '',
  category: '경제',
  words: [1, 2, 3, 4].map(word),
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

beforeEach(() => {
  HTMLElement.prototype.scrollTo = vi.fn();
  HTMLElement.prototype.scrollIntoView = vi.fn();
  window.matchMedia = vi.fn(() => ({ matches: true } as unknown as MediaQueryList));
  baseContext();
});

describe('CourseScreen energy gates', () => {
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

    expect(spendEnergy).not.toHaveBeenCalled();
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
    expect(container.textContent).toContain('단어 카드');
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

    await clickButtonContaining('핵심 단어 복습하기');

    expect(state.spendEnergy).not.toHaveBeenCalled();
    expect(state.pickRecallWords).toHaveBeenCalledWith({ candidates: [1, 2, 3, 4].map(word), count: 10 });
    expect(container.textContent).toContain('퀴즈 화면');
  });
});
