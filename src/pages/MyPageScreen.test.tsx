import { act, type ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import MyPageScreen from './MyPageScreen';
import { OTTER_AVATAR_IMAGES, getOtterAvatarPose } from '../lib/otter';

const state = vi.hoisted(() => ({ ctx: {} as Record<string, unknown>, openShop: vi.fn() }));
vi.mock('../context/AppContext', () => ({ useAppContext: () => state.ctx }));
vi.mock('../hooks/useAuth', () => ({ useAuth: () => ({ user: { nickname: '기존 학습자' }, updateNickname: vi.fn() }) }));
vi.mock('../components/mypage/EmojiPickerSheet', () => ({ EmojiPickerSheet: () => null }));
vi.mock('../components/mypage/SettingsSheet', () => ({ SettingsSheet: () => null }));
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
  act(() => root.render(<MyPageScreen />));
  cleanup = () => { act(() => root.unmount()); container.remove(); };
  return container;
};

describe('내 정보의 상점 진입과 정확한 숫자 표시', () => {
  it('조개 영역에 명확한 상점 동작을 추가하고 기존 값을 보존한다', () => {
    const container = mount();
    const entry = container.querySelector<HTMLButtonElement>('[aria-label="보유 조개 180개, 상점 열기"]')!;
    expect(entry).toHaveTextContent('상점');
    expect(entry).toHaveAttribute('type', 'button');
    act(() => entry.click());
    expect(state.openShop).toHaveBeenCalledExactlyOnceWith();
    expect(state.ctx.points).toBe(180);
    expect(state.ctx.xp).toBe(120);
    expect(state.ctx.myEmoji).toBe('🍊');
    expect(container.querySelector('.my-profile-avatar img')).toHaveAttribute('src', OTTER_AVATAR_IMAGES[getOtterAvatarPose('🍊')]);
  });
  it('큰 경험치·조개는 전체 열을 쓰되 숫자를 반올림하거나 자르지 않는다', () => {
    state.ctx.points = 2147483647;
    state.ctx.xp = 1234567;
    const container = mount();
    const wide = [...container.querySelectorAll('.my-page-stat.is-wide')];
    expect(wide).toHaveLength(2);
    expect(wide.map(item => item.querySelector('[data-stat-number]')?.textContent)).toEqual(['1,234,567', '2,147,483,647']);
    expect(container.querySelector('[aria-label="보유 조개 2,147,483,647개, 상점 열기"]')).toBeInTheDocument();
  });
  it('짧은 값은 기존의 두 열 배치를 유지한다', () => {
    const container = mount();
    expect(container.querySelectorAll('.my-page-stat')).toHaveLength(4);
    expect(container.querySelector('.my-page-stat.is-wide')).toBeNull();
    expect([...container.querySelectorAll('[data-stat-number]')].map(item => item.textContent)).toEqual(['2', '0', '120', '180']);
  });
  it('실제 복습 위치와 복습 카드가 나타나는 조건을 안내한다', () => {
    const container = mount();
    const guide = [...container.querySelectorAll('button')].find(button => button.textContent?.includes('앱 사용법'))!;
    act(() => guide.click());
    expect(container).toHaveTextContent('퀘스트의 ‘오늘 다시 볼 용어’');
    expect(container).toHaveTextContent('다시 볼 용어가 있을 때 복습 카드가 나타나요.');
    expect(container).not.toHaveTextContent('홈의 오늘 다시 보기');
  });
});
