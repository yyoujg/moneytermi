import { act, type ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import MyPageScreen from './MyPageScreen';
import { MemoryRouter } from 'react-router-dom';

const state = vi.hoisted(() => ({ ctx: {} as Record<string, unknown>, openShop: vi.fn() }));
vi.mock('../context/AppContext', () => ({ useAppContext: () => state.ctx }));
vi.mock('../hooks/useAuth', () => ({ useAuth: () => ({ user: { nickname: '기존 학습자' }, updateNickname: vi.fn() }) }));
vi.mock('../components/mypage/SettingsSheet', () => ({ SettingsSheet: ({ open }: { open: boolean }) => open ? <section>설정 열림</section> : null }));
vi.mock('../components/mypage/NicknameSheet', () => ({ NicknameSheet: () => null }));
vi.mock('@toss/tds-mobile', () => {
  const ListRow = Object.assign(({ left, contents, right, onClick }: { left?: ReactNode; contents?: ReactNode; right?: ReactNode; onClick?: () => void }) => <button type="button" onClick={onClick}>{left}{contents}{right}</button>, {
    Texts: ({ top, bottom }: { top: ReactNode; bottom: ReactNode }) => <span>{top}{bottom}</span>,
  });
  return { List: ({ children }: { children: ReactNode }) => <div>{children}</div>, ListRow,
    BottomSheet: ({ open, header, children }: { open: boolean; header: ReactNode; children: ReactNode }) => open ? <section>{header}{children}</section> : null };
});

Object.defineProperty(globalThis, 'IS_REACT_ACT_ENVIRONMENT', { value: true, configurable: true });
let cleanup = () => {};
afterEach(() => cleanup());
beforeEach(() => {
  state.openShop.mockReset();
  state.ctx = { points: 180, xp: 120, knownWords: [{ id: 1 }], viewedIds: new Set([1, 2]), attendanceDates: [], myEmoji: '🍊', updateMyEmoji: vi.fn(), openShop: state.openShop };
});
const mount = () => {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);
  act(() => root.render(<MemoryRouter><MyPageScreen /></MemoryRouter>));
  cleanup = () => { act(() => root.unmount()); container.remove(); };
  return container;
};

describe('내 정보의 정확한 숫자 표시', () => {
  it('배지를 접지 않고 가로 스크롤 없이 5열 격자로 모두 보여준다', () => {
    const container = mount();
    expect(container.querySelector('details')).toBeNull();
    const badges = container.querySelector('[aria-label="배지 목록"]');
    expect(badges?.querySelectorAll('li')).toHaveLength(10);
    expect(badges?.querySelectorAll('[data-earned="true"]')).toHaveLength(2);
    expect(badges).toHaveClass('grid', 'grid-cols-5');
    expect(badges).not.toHaveClass('overflow-x-auto');
    expect(container).toHaveTextContent('획득 2 / 10');
  });
  it('설정에 한 번에 진입한다', () => {
    const container = mount();
    const settings = [...container.querySelectorAll('button')].find(button => button.textContent?.includes('앱 설정'))!;
    act(() => settings.click());
    expect(container).toHaveTextContent('설정 열림');
  });
  it('코인 통계와 상점 진입 없이 기존 값을 보존한다', () => {
    const container = mount();
    expect(container.querySelector('.my-page-stats')).not.toHaveTextContent(/코인|상점/);
    expect(container.querySelector('.my-page-stats button')).toBeNull();
    expect(state.openShop).not.toHaveBeenCalled();
    expect(state.ctx.xp).toBe(120);
    expect(container.querySelector('.my-profile-avatar [data-avatar-initial]')).toBeInTheDocument();
    expect(container).not.toHaveTextContent('캐릭터 변경');
  });
  it('큰 경험치는 전체 열을 쓰되 숫자를 반올림하거나 자르지 않는다', () => {
    state.ctx.xp = 1234567;
    const container = mount();
    const wide = [...container.querySelectorAll('.my-page-stat.is-wide')];
    expect(wide).toHaveLength(1);
    expect(wide.map(item => item.querySelector('[data-stat-number]')?.textContent)).toEqual(['1,234,567']);
  });
  it('짧은 값은 살펴본 용어·연속 학습·경험치 세 칸으로 보여준다', () => {
    const container = mount();
    expect(container.querySelectorAll('.my-page-stat')).toHaveLength(3);
    expect(container.querySelector('.my-page-stat.is-wide')).toBeNull();
    expect([...container.querySelectorAll('[data-stat-number]')].map(item => item.textContent)).toEqual(['2', '0', '120']);
  });
  it('실제 복습 위치를 안내하고 규칙 수치는 담당 화면으로 넘긴다', () => {
    const container = mount();
    const guide = [...container.querySelectorAll('button')].find(button => button.textContent?.includes('앱 사용법'))!;
    act(() => guide.click());
    expect(container).toHaveTextContent("퀘스트의 '오늘 다시 볼 용어'");
    expect(container).not.toHaveTextContent('홈의 오늘 다시 보기');
    // XP·에너지 수치는 리그 안내·에너지 시트에만 둔다
    expect(container).not.toHaveTextContent('1시간마다');
    expect(container).not.toHaveTextContent('퀴즈 정답 2');
    expect(container).toHaveTextContent('리그 안내 보기');
  });
});
