import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Course, Word } from '../types';
import CourseScreen from './CourseScreen';
import HomeScreen from './HomeScreen';
import LessonIntroScreen from './LessonIntroScreen';
import { MISSION_XP } from '../constants';
import { showModal } from '../components/AlertModal';
import { logClick } from '../lib/analytics';

const state = vi.hoisted(() => ({
  ctx: {} as Record<string, unknown>,
  rpc: vi.fn(),
  guestClient: vi.fn(),
  guestToken: null as string | null,
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
vi.mock('../lib/feedback', () => ({ feedbackNodeTap: vi.fn(), feedbackClaim: vi.fn(), feedbackError: vi.fn() }));
vi.mock('../lib/analytics', () => ({ logClick: vi.fn() }));
vi.mock('../components/AlertModal', () => ({ showModal: vi.fn() }));
vi.mock('../hooks/useAuth', () => ({ useAuth: () => ({ user: { nickname: '테스트' }, guestToken: state.guestToken }) }));
vi.mock('../lib/supabase', () => ({ supabase: { rpc: (...args: unknown[]) => state.rpc(...args) }, getGuestClient: (token: string) => state.guestClient(token) }));
vi.mock('../components/PointCelebration', () => ({ PointCelebration: () => <div>미션 보상 축하</div> }));

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
    xp: 0,
    attendanceDates: [],
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

const Location = () => <output data-location>{useLocation().pathname}</output>;
const mount = async (entry = '/course?topic=0') => {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);
  await act(async () => {
    root.render(
      <MemoryRouter initialEntries={[entry]}>
        <Location />
        <Routes>
          <Route path="/course" element={<CourseScreen key="home" />} />
          <Route path="/course/topics" element={<CourseScreen key="catalog" />} />
          <Route path="/lesson-intro" element={<LessonIntroScreen />} />
          <Route path="/word-card" element={<div>단어 카드</div>} />
          <Route path="/quiz" element={<div>퀴즈 화면</div>} />
          <Route path="/review" element={<div>복습 화면</div>} />
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
  state.guestToken = null;
  state.rpc.mockReset().mockResolvedValue({ data: { rank: 3, total: 13, points: 120 }, error: null });
  state.guestClient.mockReset().mockReturnValue({ rpc: state.rpc });
  vi.mocked(logClick).mockClear();
});

describe('CourseScreen energy gates', () => {
  it.each(['/course', '/course?topic=0'])('학습 전 에너지 잔량을 표시하고 충전 방법을 연다: %s', async entry => {
    baseContext({ energy: 7, energyMax: 25 });
    const { container } = await mount(entry);
    const button = container.querySelector<HTMLButtonElement>('[aria-label="학습 에너지 7/25, 충전 방법 보기"]')!;
    expect(button).toHaveTextContent('에너지 7/25');
    expect(button).toHaveTextContent('충전 방법');
    await act(async () => button.click());
    expect(state.openShop).toHaveBeenCalledExactlyOnceWith('energy');
    expect(state.spendEnergy).not.toHaveBeenCalled();
    expect(state.spendPoints).not.toHaveBeenCalled();
    expect(state.ctx.energy).toBe(7);
    expect(state.ctx.points).toBe(1000);
  });

  it('홈에서 추천 학습과 주제를 보여주고 자동 스크롤로 가리지 않는다', async () => {
    baseContext({
      courses: [
        course({ id: 'c1', category: '경제', wordCount: 4, startId: 1 }),
        course({ id: 'c2', category: '금융', wordCount: 8, startId: 5 }),
      ],
      knownIds: new Set([1, 2, 3, 4]),
    });
    const { container } = await mount('/course');
    await flushScrollEffects();

    expect(container.querySelector('.course-home-tools')).toBeNull();
    expect(container.textContent).toContain('이어 배우기');
    expect(HTMLElement.prototype.scrollIntoView).not.toHaveBeenCalled();
  });

  it('더보기는 현재 학습을 별도 주제 목록 페이지로 전환한다', async () => {
    baseContext({ courses: [course(), course({ id: 'c2', category: '금융', startId: 5 })] });
    const { container, clickButtonContaining } = await mount('/course');
    const hero = container.querySelector('.course-home-hero');
    expect(hero).toHaveAttribute('aria-label', '오늘 할 학습');
    expect(hero?.querySelectorAll('button')).toHaveLength(1);
    // 히어로 그림은 말풍선과 함께 쓰는 장식 캐릭터 하나뿐이다
    expect(hero?.querySelectorAll('img')).toHaveLength(1);
    expect(hero?.querySelector('img')).toHaveAttribute('aria-hidden', 'true');
    expect(hero?.querySelector('.course-home-bubble')).toHaveTextContent('오늘 첫 용어부터 같이 봐요');
    // 아무 용어도 보지 않았으면 다음 학습까지의 진행은 0이고, 어느 레슨의 용어가 몇 개 남았는지 알려준다
    expect(hero?.querySelector('[aria-label="다음 학습까지 진행률"]')).toHaveAttribute('aria-valuenow', '0');
    expect(hero?.querySelector('.course-home-level-label')).toHaveTextContent(/^'.+' 레슨 용어 \d+개 남았어요$/);
    const primary = hero?.querySelector('.course-home-primary');
    expect(primary).toHaveClass('w-full');
    expect(primary?.querySelector('img[data-icon]')).toBeNull();
    // 히어로 버튼은 글자만 둔다
    expect(primary?.querySelector('svg')).toBeNull();
    expect(container.querySelector('[role="tablist"]')).toBeNull();
    expect(container.querySelector('.course-home-catalog')).toBeNull();
    await clickButtonContaining('더보기');
    expect(container.querySelector('[data-location]')).toHaveTextContent('/course/topics');
    expect(container.querySelector('.course-home-hero')).toBeNull();
    expect(container.querySelector('.course-home-more')).toBeNull();
    expect(container.querySelectorAll('[role="tab"]')).toHaveLength(5);
    expect(document.activeElement).toBe(container.querySelector('#course-catalog-title'));
    expect(container.querySelectorAll('.course-home-topic')).toHaveLength(2);
    expect(container.querySelector('.course-topic-index')).toBeNull();
    for (const button of container.querySelectorAll('.course-home-topic')) {
      expect(button).toHaveAttribute('aria-label', expect.stringMatching(/^(기초|중급) .+ 주제 열기$/));
      expect(button.querySelector('.course-home-topic-icon')).toBeInTheDocument();
      expect(button.querySelector('.course-home-topic-heading > svg')).toHaveAttribute('fill', 'currentColor');
      // 주제 행은 제목과 메타 한 줄만 둔다. 진행률은 메타 글자(0/31개)로 충분하다.
      expect(button.querySelector('[role=progressbar]')).toHaveAttribute('aria-valuenow', '0');
      expect(button.querySelector('.course-home-topic-description')).toBeNull();
    }
    expect(container.querySelector('[aria-label="홈으로 돌아가기"]')).toBeNull();
  });

  it.each(['중급', '잘못된 난이도'])('목록 페이지를 직접 열 때 URL의 난이도를 반영한다: %s', async level => {
    baseContext({ courses: [course(), { ...course({ id: 'c2', category: '금융', startId: 5 }), level: '중급' }] });
    const { container } = await mount(`/course/topics?level=${encodeURIComponent(level)}`);
    expect(container.querySelector('.course-home-hero')).toBeNull();
    expect(container.querySelector('[role="tab"][aria-selected="true"]')).toHaveTextContent(level === '중급' ? '중급' : '전체');
    expect(container.querySelectorAll('.course-home-topic')).toHaveLength(level === '중급' ? 1 : 2);
  });

  it('중급 탭과 전체 탭이 목록을 바꾸고 원래 주제 인덱스로 연다', async () => {
    const advanced = { ...course({ id: 'c2', category: '금융', startId: 5 }), level: '중급' } as Course;
    baseContext({ courses: [course(), advanced] });
    const { container, clickButtonContaining } = await mount('/course');
    await clickButtonContaining('더보기');
    const filters = [...container.querySelectorAll<HTMLButtonElement>('[role="tab"]')];
    expect(filters.map(button => button.textContent?.trim())).toEqual(['전체', '기초', '중급', '고급', '심화']);
    const intermediate = filters.find(button => button.textContent?.trim() === '중급');
    expect(intermediate).toBeDefined();
    await act(async () => intermediate!.click());
    expect(intermediate).toHaveAttribute('aria-selected', 'true');
    expect(container.querySelector('[role="tabpanel"]')).toHaveAttribute('aria-labelledby', intermediate!.id);
    expect(container.querySelectorAll('.course-home-topic')).toHaveLength(1);
    expect(container.querySelector('.course-home-topic')).toHaveAttribute('aria-label', '중급 금융 주제 열기');
    await act(async () => filters.find(button => button.textContent?.trim() === '전체')!.click());
    expect(container.querySelectorAll('.course-home-topic')).toHaveLength(2);
    await act(async () => intermediate!.click());
    const topic = [...container.querySelectorAll<HTMLButtonElement>('.course-home-topic')].find(button => button.getAttribute('aria-label') === '중급 금융 주제 열기');
    await act(async () => topic!.click());
    expect(container.textContent).toContain('용어5 외 3개');
    expect(container.textContent).not.toContain('용어1 외 3개');
  });

  it('키보드로 난이도를 이동하고 빈 난이도도 안내한다', async () => {
    baseContext({ courses: [course()] });
    const { container, clickButtonContaining } = await mount('/course');
    await clickButtonContaining('더보기');
    const tabs = [...container.querySelectorAll<HTMLButtonElement>('[role="tab"]')];
    const press = async (index: number, key: string) => {
      await act(async () => tabs[index].dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true })));
    };
    await press(0, 'ArrowRight');
    expect(document.activeElement).toBe(tabs[1]);
    expect(tabs[1]).toHaveAttribute('aria-selected', 'true');
    expect(tabs.filter(tab => tab.tabIndex === 0)).toEqual([tabs[1]]);
    await press(1, 'End');
    expect(document.activeElement).toBe(tabs[4]);
    expect(container.querySelector('[role="tabpanel"]')).toHaveTextContent('이 난이도의 학습을 준비하고 있어요.');
    await press(4, 'ArrowRight');
    expect(document.activeElement).toBe(tabs[0]);
    await press(0, 'ArrowLeft');
    expect(document.activeElement).toBe(tabs[4]);
    await press(4, 'Home');
    expect(document.activeElement).toBe(tabs[0]);
    expect(container.querySelectorAll('.course-home-topic')).toHaveLength(1);
  });

  it.each([0, 3])('복습할 용어가 %d개여도 복습·에너지 요약을 표시하지 않는다', async count => {
    baseContext({ dueQueue: Array.from({ length: count }, (_, index) => word(index + 1)) });
    const { container } = await mount('/course');
    expect(container.querySelector('.course-home-tools')).toBeNull();
    expect(container.querySelector('[aria-label="에너지 충전 안내"]')).toBeNull();
    expect(container.textContent).not.toContain('복습할 용어 없음');
    expect(container.textContent).not.toContain('충전·사용 안내');
    expect(container.querySelector('.course-home-hero')).toBeInTheDocument();
    expect(container.querySelector('.course-home-catalog')).toBeNull();
    expect(container.querySelector('.course-home-more')).toBeInTheDocument();
    expect(state.openShop).not.toHaveBeenCalled();
    expect(state.spendEnergy).not.toHaveBeenCalled();
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
    const target = scrollIntoView.mock.contexts.find(el => (el as HTMLElement).textContent?.includes('용어5 외 3개'));
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
    const { container, clickButtonContaining } = await mount();
    const button = [...container.querySelectorAll('button')].find(el => el.textContent?.includes('용어1'))!;

    act(() => {
      button.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      button.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });
    expect(state.spendEnergy).toHaveBeenCalledTimes(1);

    await act(async () => { resolveSpend(true); });
    expect(container.querySelector('[data-location]')).toHaveTextContent('/lesson-intro');
    await clickButtonContaining('시작하기');
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
    await clickButtonContaining('시작하기');
    expect(container.textContent).toContain('단어 카드');
    expect(state.spendPoints).not.toHaveBeenCalled();
    expect(state.spendEnergy).toHaveBeenCalledWith(1, 'lesson', 'c2-l0:5,6,7,8');
  });

  it('복습에서 틀렸어도 열람 진도가 있으면 다음 레슨은 잠기지 않는다', async () => {
    baseContext({ courses: [course({ wordCount: 8 })], knownIds: new Set(), viewedIds: new Set([1, 2, 3, 4]) });
    const { container, clickButtonContaining } = await mount();
    expect(container.textContent).toContain('완료');
    await clickButtonContaining('용어5');
    await clickButtonContaining('시작하기');
    expect(container.textContent).toContain('단어 카드');
  });

  it('홈의 이어 배우기는 마지막으로 시작한 주제로 이동한다', async () => {
    state.storage.set('learning_resume_course_v1', 'c2');
    baseContext({ courses: [course({ category: '경제' }), course({ id: 'c2', category: '금융', startId: 5 })], knownIds: new Set([5]) });
    const { container, clickButtonContaining } = await mount('/course');
    await clickButtonContaining('이어 배우기');
    expect(container.textContent).toContain('용어5 외 3개');
    expect(container.textContent).not.toContain('용어1 외 3개');
  });

  it('새 레슨 앞에 과거 용어 인출 문제가 있으면 먼저 퀴즈로 보낸다', async () => {
    state.pickRecallWords = vi.fn(() => [word(9), word(10)]);
    state.ctx = { ...state.ctx, pickRecallWords: state.pickRecallWords };
    const { container, clickButtonContaining } = await mount();

    await clickButtonContaining('용어1');

    expect(state.spendEnergy).toHaveBeenCalledTimes(1);
    expect(state.pickRecallWords).toHaveBeenCalledWith({ excludeIds: [1, 2, 3, 4], count: 3 });
    // 처음 여는 레슨은 미리보기에서 인출 단계까지 안내한 뒤 퀴즈로 보낸다
    expect(container.textContent).toContain('가볍게 다시 보기');
    expect(container.textContent).toContain('지난 용어 2개');
    await clickButtonContaining('시작하기');
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

describe('학습 주제의 역할 아이콘', () => {
  it('현재 단계는 아이콘 상자나 배지 대신 짧은 상태 문구로 구분한다', async () => {
    const { container } = await mount();
    const current = container.querySelector('.course-node-current');
    expect(current).toBeInTheDocument();
    expect(current).not.toHaveClass('border-brand-200');
    expect(current?.querySelector('[data-learning-icon]')?.parentElement).not.toHaveClass('bg-[var(--color-brand-soft)]');
    expect(current?.querySelector('[data-learning-status]')).toHaveTextContent('시작 가능');
    expect(current?.querySelector('[data-learning-status]')).not.toHaveClass('rounded-full');
    expect(current?.textContent).not.toContain('지금 할 일');
    expect(current?.querySelector('.bg-brand-500')).toBeNull();
    expect(current?.querySelector('[data-learning-action]')).toHaveAttribute('aria-hidden', 'true');
  });

  it('살펴본 용어가 있는 레슨은 진행 중으로 표시하고 학습 동작을 유지한다', async () => {
    baseContext({ knownIds: new Set([1]) });
    const { container, clickButtonContaining } = await mount();
    expect(container.querySelector('.course-node-current [data-learning-status]')).toHaveTextContent('진행 중');
    await clickButtonContaining('용어1');
    await clickButtonContaining('시작하기');
    expect(container.textContent).toContain('단어 카드');
    expect(state.spendEnergy).toHaveBeenCalledWith(1, 'lesson', 'c1-l0:1,2,3,4');
  });

  it('학습·퀴즈는 번호와 역할 그림, 복습은 번호 없이 배지로 구분한다', async () => {
    const { container } = await mount();
    const icons = [...container.querySelectorAll('[data-learning-icon]')];
    expect(icons.map(icon => icon.getAttribute('data-learning-icon'))).toEqual(['lesson', 'quiz']);
    for (const icon of icons) {
      expect(icon).toHaveAttribute('width', '16');
      expect(icon).toHaveAttribute('aria-hidden', 'true');
    }
    expect(container.querySelector('[data-review-badge]')).toHaveTextContent('· 선택');
    const markers = [...container.querySelectorAll('.course-step-marker')];
    const review = markers.find(m => m.getAttribute('data-step-kind') === 'review')!;
    expect(review.textContent).toBe('');
    expect(review.querySelector('[data-icon="RotateCcw"]')).toBeInTheDocument();
  });

  it('잠긴 단계도 역할을 표시하며 잠금과 학습 동작은 유지한다', async () => {
    const { container } = await mount();
    const locked = [...container.querySelectorAll<HTMLButtonElement>('button[data-node-id]:disabled')];
    expect(locked).toHaveLength(2);
    expect(locked[0].querySelector('[data-learning-icon="quiz"]')).toBeInTheDocument();
    expect(locked[1].querySelector('[data-review-badge]')).toBeInTheDocument();
    for (const button of locked) {
      expect(button.textContent).toContain('잠김');
      expect(button.querySelector('[data-icon="LockKeyhole"]')).toBeNull();
    }
    expect(container.querySelector('[data-icon="Clock3"]')).toBeNull();
    expect(state.spendEnergy).not.toHaveBeenCalled();
  });
});


describe('퀘스트의 미션 동작', () => {
  const mountHome = async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);
    const root = createRoot(container);
    await act(async () => {
      root.render(<MemoryRouter initialEntries={['/']}><Routes><Route path="/" element={<HomeScreen />} /><Route path="/course" element={<div>학습 목록</div>} /><Route path="/review" element={<div>복습 화면</div>} /></Routes></MemoryRouter>);
    });
    cleanup = () => { act(() => root.unmount()); container.remove(); };
    return container;
  };

  it('오늘의 미션만 모두 표시하고 보상과 진행률을 유지한다', async () => {
    const claimReward = vi.fn(async () => ({ xpGained: MISSION_XP }));
    baseContext({
      xp: 0, knownWords: [word(1)], unknownWords: [], attendanceDates: [], myEmoji: '🦦', claimReward,
      missions: {
        attendance: { id: 'attendance', title: '오늘 출석하기', reward: 3, current: 1, target: 1, isRewarded: true, sortOrder: 0 },
        quiz: { id: 'quiz', title: '퀴즈 풀기', reward: 5, current: 3, target: 2, isRewarded: false, sortOrder: 1 },
        lesson: { id: 'lesson', title: '용어 학습하기', reward: 7, current: 1, target: 3, isRewarded: false, sortOrder: 2 },
      },
    });
    const container = await mountHome();
    const card = container.querySelector('.home-missions');
    expect(card).toHaveAttribute('aria-labelledby', 'home-missions-heading');
    expect(card?.querySelector('h2')).toHaveTextContent('오늘의 미션');
    expect(container.querySelector('.home-mission-heading')).toHaveTextContent('오늘의 미션');
    expect(container.querySelectorAll('.home-mission-row')).toHaveLength(3);
    expect(container.querySelector('.home-attendance, .home-mission-more, .home-review-entry')).toBeNull();
    const rows = [...container.querySelectorAll('.home-mission-row')];
    // 받을 수 있는 미션 → 진행 중 → 완료 순서(직렬 위치 효과)
    expect(rows.map(row => row.querySelector('.home-mission-title')?.textContent?.trim())).toEqual(['퀴즈 풀기', '용어 학습하기', '오늘 출석하기']);
    // 미션 카드에는 보상 XP 선형 아이콘 하나만 둔다
    expect(rows.every(row => row.querySelector('.home-mission-top img') === null && row.querySelectorAll('.home-mission-top svg').length === 1)).toBe(true);
    expect(rows[0].querySelector('.home-mission-reward svg')).toHaveAttribute('data-icon', 'Xp');
    expect(rows[1].querySelector('.home-mission-count')).toHaveTextContent('1/3');
    expect(rows[1].querySelector('.home-mission-reward')).toHaveTextContent('+' + MISSION_XP + ' XP');
    expect(rows[1]).not.toHaveTextContent('코인');
    expect(rows[0].querySelector('[role=progressbar]')).toHaveAttribute('aria-valuenow', '2');
    expect(rows[0].querySelector('[role=progressbar]')?.children).toHaveLength(2);
    expect(rows[2].querySelector('button')).toBeNull();
    expect(rows[2].querySelector('[data-state=claimed]')).toHaveTextContent('완료');
    await act(async () => rows[0].querySelector<HTMLButtonElement>('button')!.click());
    expect(claimReward).toHaveBeenCalledExactlyOnceWith('quiz');
    expect(container).toHaveTextContent('미션 보상 축하');
  });

  it('출석이나 복습이 있어도 퀘스트에는 미션만 표시한다', async () => {
    baseContext({ attendanceDates: ['2026-10-28'], dueQueue: [word(1)], missions: { m: { id: 'm', title: '학습하기', current: 0, target: 1, reward: 5, isRewarded: false, sortOrder: 1 } }, claimReward: vi.fn() });
    const container = await mountHome();
    expect(container.querySelectorAll('.home-mission-row')).toHaveLength(1);
    expect(container).not.toHaveTextContent('출석 기록');
    expect(container).not.toHaveTextContent('다시 볼 용어');
    expect(container.querySelector('.home-mission-more')).toBeNull();
    expect(logClick).not.toHaveBeenCalledWith('review_prompt_view', expect.anything());
  });

  it('자동 적립 중인 미션 버튼은 잠그고 진행 상태를 표시한다', async () => {
    const claimReward=vi.fn();baseContext({xp:0,knownWords:[word(1)],unknownWords:[],attendanceDates:[],myEmoji:'🍊',claimReward,claimingMissionIds:new Set(['m3']),missions:{m3:{id:'m3',title:'퀴즈 정답',reward:30,current:3,target:3,isRewarded:false,sortOrder:1}}});
    const container=await mountHome();const button=container.querySelector<HTMLButtonElement>('[data-state="pending"]')!;
    expect(button).toBeDisabled();expect(button).toHaveTextContent('적립 중');act(()=>button.click());expect(claimReward).not.toHaveBeenCalled();
  });
  it('동시에 진행 중인 적립 응답을 실패나 중복 성공으로 안내하지 않는다', async () => {
    vi.mocked(showModal).mockClear();const claimReward=vi.fn().mockResolvedValue('pending');baseContext({xp:0,knownWords:[word(1)],unknownWords:[],attendanceDates:[],myEmoji:'🍊',claimReward,missions:{m3:{id:'m3',title:'퀴즈 정답',reward:30,current:3,target:3,isRewarded:false,sortOrder:1}}});
    const container=await mountHome();await act(async()=>{container.querySelector<HTMLButtonElement>('[data-state="ready"]')!.click();});
    expect(showModal).not.toHaveBeenCalled();expect(container).not.toHaveTextContent('미션 보상 축하');
  });

});


describe('홈으로 옮긴 학습 현황', () => {
  it('홈에서 출석과 복습을 보여주고 주간 순위는 리그로 넘긴다', async () => {
    baseContext({ attendanceDates: ['2026-10-28'], dueQueue: [word(1)], xp: 3569 });
    const { container } = await mount('/course');
    // 연속 학습은 홈 맨 위 카드에서 이번 주 칸과 함께 보여준다
    expect(container.querySelector('.home-streak-card')).toHaveTextContent('연속 학습');
    expect(container.querySelectorAll('.home-streak-card .week-strip-day')).toHaveLength(7);
    expect(container.querySelector('.course-home-hero [aria-label="다음 학습까지 진행률"]')).toBeInTheDocument();
    expect(container.querySelector('.course-home-tier-chip')).toHaveTextContent('Lv.4 재테크러');
    // 주간 순위는 리그 화면에서만 보여주므로 홈은 순위를 조회하지 않는다
    expect(container.querySelector('[aria-labelledby="home-weekly-rank"]')).toBeNull();
    expect(container.querySelectorAll('[role="progressbar"]')).toHaveLength(1);
    expect(state.rpc).not.toHaveBeenCalled();
    expect(logClick).toHaveBeenCalledWith('review_prompt_view', { count: 1 });
    await act(async () => container.querySelector<HTMLButtonElement>('[aria-label="오늘 다시 볼 용어 1개 복습 시작"]')!.click());
    expect(container).toHaveTextContent('복습 화면');
    expect(logClick).toHaveBeenCalledWith('review_start', { count: 1, source: 'home' });
  });

  it('복습할 용어가 없으면 복습 진입을 숨긴다', async () => {
    const { container } = await mount('/course');
    expect(container.querySelector('.home-review-entry')).toBeNull();
    expect(container.querySelector('.course-home-hero [aria-label="다음 학습까지 진행률"]')).toBeInTheDocument();
  });

  it.each(['/course/topics', '/course?topic=0'])('%s에는 홈 요약을 반복하지 않는다', async entry => {
    const { container } = await mount(entry);
    expect(container.querySelector('.course-home-overview')).toBeNull();
    expect(state.rpc).not.toHaveBeenCalled();
  });
});
