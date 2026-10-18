import { act, type ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Word } from '../types';
import QuizScreen from './QuizScreen';
import HomeScreen from './HomeScreen';
import { LeagueRules } from '../components/LeagueRules';
import { MISSION_XP } from '../constants';
import { logClick } from '../lib/analytics';

const state = vi.hoisted(() => ({
  claimReward: vi.fn(),
  recordReview: vi.fn(),
  submitQuizAnswer: vi.fn(),
  refreshWallet: vi.fn(),
  shareTossLink: vi.fn(),
}));

vi.mock('../lib/quiz', () => ({
  pickQuizType: vi.fn(() => 'meaning-to-term'),
  buildQuizItem: vi.fn((_type: string, currentWord: Word) => ({
    promptLabel: '뜻을 보고 용어를 고르세요',
    promptMain: currentWord.meaning,
    options: [
      { label: currentWord.word, answer: currentWord.word, isCorrect: true },
      { label: '오답', answer: '오답', isCorrect: false },
    ],
  })),
}));
vi.mock('../context/AppContext', () => ({
  useAppContext: () => ({
    xp: 0,
    hydrated: true,
    unknownWords: [],
    attendanceDates: [],
    dueQueue: [],
    myEmoji: '',
    claimReward: state.claimReward,
    missions: { m1: { id: 'm1', title: '테스트 미션', current: 1, target: 1, reward: 37, isRewarded: false, sortOrder: 1 } },
    allWords: [1, 2].map(id => ({ id, word: `용어${id}`, meaning: `뜻${id}`, detailedMeaning: '', newsExample: '', hint: '', difficulty: 1 })),
    knownWords: [1, 2].map(id => ({ id, word: `용어${id}`, meaning: `뜻${id}`, detailedMeaning: '', newsExample: '', hint: '', difficulty: 1 })),
    courses: [],
    submitQuizAnswer: state.submitQuizAnswer,
    recordReview: state.recordReview,
    refreshWallet: state.refreshWallet,
  }),
}));
// 숫자 애니메이션은 제외하고 화면에 전달된 서버 보상 합계를 검증한다.
vi.mock('../hooks/useCountUp', () => ({ useCountUp: (value: number) => value }));
vi.mock('../hooks/useAuth', () => ({ useAuth: () => ({ user: null }) }));
vi.mock('../lib/pathProgress', () => ({ markNodeDone: vi.fn() }));
vi.mock('../lib/feedback', () => ({
  feedbackClaim: vi.fn(),
  feedbackError: vi.fn(),
  feedbackCorrect: vi.fn(),
  feedbackWrong: vi.fn(),
  feedbackQuizComplete: vi.fn(),
  feedbackTierUp: vi.fn(),
}));
vi.mock('../lib/review', async importOriginal => {
  const actual = await importOriginal<typeof import('../lib/review')>();
  return { ...actual };
});
vi.mock('../lib/analytics', () => ({ logClick: vi.fn() }));
vi.mock('../lib/share', () => ({ shareTossLink: (...args: unknown[]) => state.shareTossLink(...args) }));

Object.defineProperty(globalThis, 'IS_REACT_ACT_ENVIRONMENT', { value: true, configurable: true });

function word(id: number): Word {
  return {
    id,
    word: `용어${id}`,
    meaning: `뜻${id}`,
    detailedMeaning: '',
    newsExample: '',
    hint: '',
    difficulty: 1,
  };
}

let cleanup = () => {};
afterEach(() => cleanup());

const mount = async (extraState: Record<string, unknown> = {}, screen: ReactNode = <QuizScreen />) => {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);
  await act(async () => {
    root.render(
      <MemoryRouter initialEntries={[{ pathname: '/quiz', state: { quizQueue: [word(1), word(2)], reviewMode: true, backPath: '/course', ...extraState } }]}>
        <Routes>
          <Route path="/quiz" element={screen} />
          <Route path="/course" element={<div>코스 화면</div>} />
        </Routes>
      </MemoryRouter>,
    );
  });
  cleanup = () => { act(() => root.unmount()); container.remove(); };
  const click = async (text: string) => {
    const button = [...container.querySelectorAll('button')].find(el => el.textContent?.includes(text));
    expect(button, `버튼: ${text}`).toBeDefined();
    await act(async () => {
      button!.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });
  };
  return { container, click };
};

beforeEach(() => {
  state.claimReward = vi.fn(() => Promise.resolve({ xpGained: MISSION_XP }));
  state.recordReview = vi.fn(() => Promise.resolve());
  state.submitQuizAnswer = vi.fn(() => Promise.resolve({ combo: 1, earned: 0, capped: false }));
  state.refreshWallet = vi.fn(() => Promise.resolve());
  state.shareTossLink = vi.fn(() => Promise.resolve());
});

describe('QuizScreen review SRS', () => {
  it('재시도 정답을 첫 시도 성과에 합치지 않고 복습 종류를 기록한다', async () => {
    const { container, click } = await mount({ mode: 'lesson_warmup', lessonId: 'c1-l0', courseId: 'c1' });
    await click('오답');
    await click('다음 문제');
    await click('용어2');
    await click('다음 문제');
    await click('용어1');
    await click('결과 보기');
    expect(container.textContent).toContain('50%');
    expect(logClick).toHaveBeenCalledWith('quiz_complete', expect.objectContaining({ mode: 'lesson_warmup', total: 2, correct: 1, attempts: 3, node_id: 'c1-l0', course_id: 'c1' }));
  });
  it('첫 오답만 SRS에 기록하고 재정답은 같은 세션에서 다시 성공 기록하지 않는다', async () => {
    const { click } = await mount();

    await click('오답');
    await click('다음 문제');
    await click('용어2');
    await click('다음 문제');
    await click('용어1');

    expect(state.recordReview).toHaveBeenCalledTimes(2);
    expect(state.recordReview).toHaveBeenNthCalledWith(1, 1, false, false);
    expect(state.recordReview).toHaveBeenNthCalledWith(2, 2, true, false);
  });

  it('조개와 공통 입체 그림을 항목명 왼쪽에 두고 수치·복귀는 유지한다', async () => {
    const { container, click } = await mount();
    await click('용어1');
    await click('다음 문제');
    await click('용어2');
    await click('결과 보기');
    const summary = container.querySelector('[aria-label="퀴즈 결과 요약"]');
    expect(summary).not.toBeNull();
    const icons = [...summary!.querySelectorAll('.quiz-result-icon')];
    expect(icons).toHaveLength(4);
    for (const [index, label] of ['모은 조개', '획득 XP', '첫 시도 정답률', '최고 연속 정답'].entries()) {
      const icon = icons[index];
      expect(icon).toHaveAttribute('width', '18');
      expect(icon).toHaveAttribute('height', '18');
      if (index === 0) {
        expect(icon).toHaveAttribute('src', '/otter/v3/items/shell.png');
      } else {
        expect(icon).toHaveAttribute('src', ['/otter/v3/icons/trophy.png', '/otter/v3/icons/target.png', '/otter/v3/icons/flame.png'][index - 1]);
        expect(icon).not.toHaveAttribute('stroke-width');
        expect(icon).not.toHaveAttribute('fill');
      }
      expect(icon).toHaveAttribute('aria-hidden', 'true');
      expect(icon.parentElement).toHaveTextContent(label);
      expect(icon.parentElement?.nextElementSibling).toHaveTextContent(['+0개', '+0', '100%', '1연속'][index]);
    }
    expect(container.querySelectorAll('.quiz-result-icon')).toHaveLength(5);
    expect([...container.querySelectorAll('.quiz-result-icon')].at(-1)?.closest('.rounded-full')).toBeNull();
    await click('주제로 돌아가기');
    expect(container.textContent).toContain('코스 화면');
  });

  it('완료 화면에서 퀴즈 성과를 공유한다', async () => {
    const { click } = await mount();

    await click('용어1');
    await click('다음 문제');
    await click('용어2');
    await click('결과 보기');
    await click('친구에게 공유');

    expect(state.shareTossLink).toHaveBeenCalledWith(
      'intoss://moneytermi/course',
      expect.stringContaining('머니터미에서 퀴즈 2문제 100% 달성!'),
    );
    expect(state.shareTossLink.mock.calls[0][1]).toContain('오늘 확인한 용어: 용어1 · 용어2.');
  });
});


describe('조개 표시와 보상 값 유지', () => {
  it.each([3, 4])('%i연속의 고정 보너스는 조개 5개이고 서버 보상 값은 그대로 표시한다', async combo => {
    state.submitQuizAnswer.mockResolvedValue({ combo, earned: 15, capped: false });
    const { container, click } = await mount();
    await click('용어1');
    expect(container.textContent).toContain(combo + '연속! 조개 5개 보너스');
    expect(container.querySelector('.anim-reward-rise')).toHaveTextContent('+15개');
    expect(container.querySelector('.quiz-feedback-sheet')).toHaveTextContent('+15개');
    expect(state.submitQuizAnswer).toHaveBeenCalledWith(1, '용어1', 'mc', false, true);
    await click('다음 문제');
    await click('용어2');
    await click('결과 보기');
    expect(container.querySelector('[aria-label="퀴즈 결과 요약"]')).toHaveTextContent('+30개');
  });

  it('5연속 배수 보너스와 보상 한도 조건을 유지한다', async () => {
    state.submitQuizAnswer.mockResolvedValue({ combo: 5, earned: 0, capped: true });
    const { container, click } = await mount();
    await click('용어1');
    expect(container.textContent).toContain('5연속! x2 보너스');
    expect(container.textContent).toContain('한도 도달');
    expect(container.querySelector('.anim-reward-rise')).toBeNull();
    expect(container.textContent).not.toContain('조개 5개 보너스');
  });

  it('홈 미션 보상은 조개 개수로 표시하고 XP와 지급 인수는 유지한다', async () => {
    const { container, click } = await mount({}, <HomeScreen />);
    expect(container.textContent).toContain('+37개');
    expect(container.textContent).toContain('+' + MISSION_XP + ' XP');
    expect(container.textContent).not.toContain('+37P');
    await click('받기');
    expect(state.claimReward).toHaveBeenCalledWith('m1');
    expect(container.querySelector('[role="dialog"]')).toHaveTextContent('+37개');
  });

  it('리그 안내는 레슨 조개 차감 대신 에너지와 부스트 선택 사용을 설명한다', async () => {
    const { container } = await mount({}, <LeagueRules />);
    expect(container.textContent).toContain('에너지 모두 충전(600개)');
    expect(container.textContent).toContain('XP 2배 부스트(300개 · 30분)에 선택해서 써요');
    expect(container.textContent).toContain('레슨 시작에는 조개가 필요 없어요');
    expect(container.textContent).toContain('XP 50마다 조개 50개');
    expect(container.textContent).toContain('학습·퀴즈를 새로 시작할 때 1씩 써요');
    expect(container.textContent).not.toMatch(/포인트|10P|50P|300P/);
  });
});
