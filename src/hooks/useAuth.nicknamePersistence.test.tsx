import { act, StrictMode, useLayoutEffect, useState, type ReactNode } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthProvider, useAuth } from './useAuth';
import { NicknameSheet } from '../components/mypage/NicknameSheet';
import { isDefaultNickname } from '../constants';

// 실제 인증 Provider와 닉네임 Sheet를 사용하고 DB·기기 저장소·브리지만 격리한다.
// 실제 Supabase 모듈은 로드하지 않으며 외부 통신도 차단한다.
const mocks = vi.hoisted(() => ({
  getItem: vi.fn(), setItem: vi.fn(), removeItem: vi.fn(), rpc: vi.fn(),
  getGuestClient: vi.fn(), guestFrom: vi.fn(), defaultFrom: vi.fn(),
  update: vi.fn(), eq: vi.fn(), select: vi.fn(), insert: vi.fn(), single: vi.fn(),
  getAnonymousKey: vi.fn(),
}));
vi.mock('../lib/storage', () => ({ Storage: {
  getItem: mocks.getItem, setItem: mocks.setItem, removeItem: mocks.removeItem,
} }));
vi.mock('../lib/supabase', () => ({
  supabase: { rpc: mocks.rpc, from: mocks.defaultFrom, auth: { signOut: vi.fn() } },
  getGuestClient: mocks.getGuestClient,
}));
vi.mock('@apps-in-toss/web-framework', () => ({
  closeView: vi.fn(), getAnonymousKey: mocks.getAnonymousKey, getSchemeUri: vi.fn(),
}));
vi.mock('@toss/tds-mobile', () => ({
  BottomSheet: ({ open, children, header }: { open: boolean; children: ReactNode; header: ReactNode }) =>
    open ? <section role="dialog">{header}{children}</section> : null,
}));

Object.defineProperty(globalThis, 'IS_REACT_ACT_ENVIRONMENT', { value: true, configurable: true });
const stored = {
  profileId: 'profile-a', guestToken: 'guest-secret', nickname: '새친구',
  isGuest: true, leagueTier: 'silver', tossAnonymousKey: 'saved-toss-key',
};
type Context = ReturnType<typeof useAuth>;
let current: Context;
let root: Root | undefined;
let container: HTMLDivElement;
let network: ReturnType<typeof vi.fn>;
let closed: ReturnType<typeof vi.fn<() => void>>;

function Probe({ sheet }: { sheet?: 'required' | 'optional' }) {
  const auth = useAuth();
  const [open, setOpen] = useState(true);
  useLayoutEffect(() => { current = auth; }, [auth]);
  if (!auth.user || !sheet) return null;
  // App.tsx의 필수 게이트와 동일하게 인증 상태의 기본 닉네임 여부로 표시한다.
  if (sheet === 'required' && !isDefaultNickname(auth.user.nickname)) return null;
  return <NicknameSheet open={open} currentNickname={auth.user.nickname}
    required={sheet === 'required'} onSave={auth.updateNickname}
    onClose={() => { closed(); setOpen(false); }} />;
}

async function mount(sheet?: 'required' | 'optional', strict = false) {
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
  const content = <AuthProvider><Probe sheet={sheet} /></AuthProvider>;
  await act(async () => { root!.render(strict ? <StrictMode>{content}</StrictMode> : content); });
}
async function change(nickname: string) {
  let result: { error: string | null } | undefined;
  await act(async () => { result = await current.updateNickname(nickname); });
  return result!;
}
async function saveInSheet(nickname = '새이름') {
  const input = container.querySelector('input')!;
  await act(async () => {
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!.call(input, nickname);
    input.dispatchEvent(new Event('input', { bubbles: true }));
  });
  const button = container.querySelector<HTMLButtonElement>('.nickname-save')!;
  expect(button.disabled).toBe(false);
  await act(async () => { button.click(); });
}
function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>(yes => { resolve = yes; });
  return { promise, resolve };
}

beforeEach(() => {
  vi.resetAllMocks();
  mocks.getItem.mockResolvedValue(JSON.stringify(stored));
  mocks.setItem.mockResolvedValue(undefined);
  mocks.rpc.mockResolvedValue({ data: false, error: null });
  const builder = { update: mocks.update, eq: mocks.eq, select: mocks.select, insert: mocks.insert, single: mocks.single };
  mocks.select.mockImplementation((columns: string) => columns === 'nickname'
    ? builder : Promise.resolve({ data: [{ id: stored.profileId }], error: null }));
  mocks.single.mockResolvedValue({ data: { nickname: stored.nickname }, error: null });
  mocks.getAnonymousKey.mockResolvedValue(null);
  mocks.update.mockReturnValue(builder);
  mocks.eq.mockReturnValue(builder);
  mocks.insert.mockResolvedValue({ error: new Error('서버 미연결') });
  mocks.guestFrom.mockReturnValue(builder);
  mocks.defaultFrom.mockReturnValue(builder);
  mocks.getGuestClient.mockReturnValue({ from: mocks.guestFrom });
  closed = vi.fn();
  network = vi.fn(() => { throw new Error('검사 중 외부 통신 금지'); });
  vi.stubGlobal('fetch', network);
  vi.stubGlobal('XMLHttpRequest', network);
  vi.stubGlobal('WebSocket', network);
  vi.spyOn(console, 'warn').mockImplementation(() => {});
});
afterEach(async () => {
  await act(async () => { root?.unmount(); });
  root = undefined;
  container?.remove();
  expect(network).not.toHaveBeenCalled();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('서버 확정과 기기 캐시 분리', () => {
  it('서버 성공 후 캐시 쓰기가 실패해도 성공·인증 상태를 유지하고 경고만 남긴다', async () => {
    await mount();
    const error = new Error('기기 저장 공간 부족');
    mocks.setItem.mockRejectedValueOnce(error);
    expect(await change('  새이름  ')).toEqual({ error: null });
    expect(current.user).toEqual({ id: stored.profileId, nickname: '새이름', isGuest: true, leagueTier: 'silver' });
    expect(current.isAuthenticated).toBe(true);
    expect(current.profileId).toBe(stored.profileId);
    expect(current.guestToken).toBe(stored.guestToken);
    expect(console.warn).toHaveBeenCalledWith('닉네임 서버 변경 완료, 기기 캐시 저장 실패:', error);
    expect(mocks.update).toHaveBeenCalledTimes(1);
    expect(mocks.setItem).toHaveBeenCalledTimes(1);
  });

  it('캐시 읽기가 끝나기 전에도 서버 성공을 인증 상태에 반영한다', async () => {
    await mount();
    const cache = deferred<string | null>();
    mocks.getItem.mockReturnValueOnce(cache.promise);
    let pending!: ReturnType<Context['updateNickname']>;
    await act(async () => { pending = current.updateNickname('새이름'); });
    expect(current.user?.nickname).toBe('새이름');
    await act(async () => { cache.resolve(JSON.stringify(stored)); expect(await pending).toEqual({ error: null }); });
  });

  it.each(['읽기 예외', '손상', '없음'])('캐시 %s도 서버 성공을 실패로 되돌리지 않는다', async mode => {
    await mount();
    if (mode === '읽기 예외') mocks.getItem.mockRejectedValueOnce(new Error('읽기 실패'));
    else mocks.getItem.mockResolvedValueOnce(mode === '손상' ? '{' : null);
    expect(await change('새이름')).toEqual({ error: null });
    expect(current.user?.nickname).toBe('새이름');
    expect(mocks.setItem).not.toHaveBeenCalled();
  });

  it('정상 캐시의 인증·리그·토스 키와 추가 필드를 그대로 보존한다', async () => {
    const cached = { ...stored, futureField: 'preserve' };
    mocks.getItem.mockResolvedValue(JSON.stringify(cached));
    await mount();
    expect(await change('새이름')).toEqual({ error: null });
    expect(mocks.setItem).toHaveBeenCalledWith('moneytermi_auth', JSON.stringify({ ...cached, nickname: '새이름' }));
    expect(mocks.rpc).toHaveBeenCalledWith('is_nickname_taken', { p_nickname: '새이름', p_exclude_id: stored.profileId });
    expect(mocks.getGuestClient).toHaveBeenCalledWith(stored.guestToken);
    expect(mocks.guestFrom).toHaveBeenCalledWith('profiles');
    expect(mocks.defaultFrom).not.toHaveBeenCalled();
    expect(mocks.update).toHaveBeenCalledWith({ nickname: '새이름' });
    expect(mocks.eq).toHaveBeenCalledWith('id', stored.profileId);
    expect(mocks.select).toHaveBeenCalledWith('id');
  });

  it('구버전 저장 형식은 기존 변환 규칙을 유지한다', async () => {
    mocks.getItem.mockResolvedValue(JSON.stringify({
      user: { id: stored.profileId, nickname: '새친구', isGuest: true }, _guestToken: stored.guestToken,
    }));
    await mount();
    expect(await change('새이름')).toEqual({ error: null });
    expect(JSON.parse(mocks.setItem.mock.calls[0][1])).toEqual({
      profileId: stored.profileId, guestToken: stored.guestToken,
      nickname: '새이름', isGuest: true, leagueTier: 'bronze',
    });
  });
});

describe('서버·검증 실패는 성공으로 처리하지 않음', () => {
  it.each([
    ['', '닉네임을 입력해주세요'], ['   ', '닉네임을 입력해주세요'],
    ['가나다라마바사아자차카', '닉네임은 10자 이내로 입력해주세요'],
    ['새친구', '현재 닉네임과 동일해요'], [' 예비슈퍼개미 ', '다른 닉네임을 정해주세요'],
  ])('%j 입력을 기존 규칙대로 거절한다', async (nickname, error) => {
    await mount();
    expect(await change(nickname)).toEqual({ error });
    expect(mocks.rpc).not.toHaveBeenCalled();
    expect(mocks.update).not.toHaveBeenCalled();
    expect(mocks.setItem).not.toHaveBeenCalled();
    expect(current.user?.nickname).toBe('새친구');
  });

  it('중복 닉네임은 서버 쓰기 없이 거절한다', async () => {
    await mount();
    mocks.rpc.mockResolvedValueOnce({ data: true, error: null });
    expect(await change('중복이름')).toEqual({ error: '이미 사용 중인 닉네임이에요' });
    expect(mocks.update).not.toHaveBeenCalled();
    expect(mocks.setItem).not.toHaveBeenCalled();
  });

  it.each([
    ['권한 없음·0행', { data: [], error: null }],
    ['서버 오류', { data: null, error: { code: '23505' } }],
    ['데이터 없음', { data: null, error: null }],
  ])('%s이면 인증 상태와 캐시를 변경하지 않는다', async (_label, response) => {
    await mount();
    mocks.select.mockResolvedValueOnce(response);
    expect(await change('새이름')).toEqual({ error: '닉네임 변경에 실패했어요' });
    expect(current.user?.nickname).toBe('새친구');
    expect(mocks.setItem).not.toHaveBeenCalled();
  });

  it('profileId가 없으면 서버와 로컬 모두 갱신하지 않는다', async () => {
    mocks.getItem.mockResolvedValue(JSON.stringify({ ...stored, profileId: null }));
    await mount();
    expect(current.profileId).toBeNull();
    expect(await change('새이름')).toEqual({ error: '닉네임 변경에 실패했어요' });
    expect(current.user?.nickname).toBe('새친구');
    expect(mocks.rpc).not.toHaveBeenCalled();
    expect(mocks.update).not.toHaveBeenCalled();
    expect(mocks.setItem).not.toHaveBeenCalled();
  });

  it('인증 복원 전에는 로컬 성공을 만들지 않는다', async () => {
    const cache = deferred<string | null>();
    mocks.getItem.mockReturnValueOnce(cache.promise);
    await mount();
    expect(current.user).toBeNull();
    expect(await change('새이름')).toEqual({ error: '닉네임 변경에 실패했어요' });
    expect(mocks.update).not.toHaveBeenCalled();
    await act(async () => { cache.resolve(JSON.stringify(stored)); });
  });

  it('오프라인 임시 프로필의 서버 0행 응답은 로컬 성공이 아니다', async () => {
    mocks.getItem.mockResolvedValue(null);
    await mount();
    const before = current.user;
    expect(current.profileId).toBeTruthy();
    mocks.setItem.mockClear();
    mocks.select.mockResolvedValueOnce({ data: [], error: null });
    expect(await change('새이름')).toEqual({ error: '닉네임 변경에 실패했어요' });
    expect(current.user).toEqual(before);
    expect(mocks.setItem).not.toHaveBeenCalled();
  });

  it('게스트 토큰이 없을 때 기본 클라이언트의 0행 결과도 거절한다', async () => {
    mocks.getItem.mockResolvedValue(JSON.stringify({ ...stored, guestToken: null }));
    await mount();
    mocks.select.mockResolvedValueOnce({ data: [], error: null });
    expect(await change('새이름')).toEqual({ error: '닉네임 변경에 실패했어요' });
    expect(mocks.defaultFrom).toHaveBeenCalledWith('profiles');
    expect(mocks.getGuestClient).not.toHaveBeenCalled();
    expect(mocks.setItem).not.toHaveBeenCalled();
  });
});

describe('닉네임 Sheet 회귀', () => {
  it('캐시 저장 거절에도 필수 초기 닉네임 게이트를 해제한다', async () => {
    await mount('required');
    expect(container.querySelector('[role="dialog"]')).not.toBeNull();
    mocks.setItem.mockRejectedValueOnce(new Error('기기 쓰기 실패'));
    await saveInSheet();
    expect(current.user?.nickname).toBe('새이름');
    expect(container.querySelector('[role="dialog"]')).toBeNull();
    expect(container.textContent).not.toContain('닉네임 변경에 실패했어요');
  });

  it('일반 변경도 캐시 실패를 변경 실패로 표시하지 않고 닫는다', async () => {
    await mount('optional');
    mocks.setItem.mockRejectedValueOnce(new Error('기기 쓰기 실패'));
    await saveInSheet();
    expect(closed).toHaveBeenCalledTimes(1);
    expect(container.querySelector('[role="dialog"]')).toBeNull();
  });

  it.each(['0행', '요청 예외', '중복'])('%s이면 필수 게이트를 유지하고 기존 오류를 표시한다', async mode => {
    await mount('required');
    if (mode === '0행') mocks.select.mockResolvedValueOnce({ data: [], error: null });
    if (mode === '요청 예외') mocks.select.mockRejectedValueOnce(new Error('오프라인'));
    if (mode === '중복') mocks.rpc.mockResolvedValueOnce({ data: true, error: null });
    await saveInSheet();
    expect(current.user?.nickname).toBe('새친구');
    expect(container.querySelector('[role="dialog"]')).not.toBeNull();
    expect(container.querySelector('[role="alert"]')?.textContent).toBe(mode === '중복'
      ? '이미 사용 중인 닉네임이에요' : '닉네임 변경에 실패했어요');
    expect(closed).not.toHaveBeenCalled();
    expect(mocks.setItem).not.toHaveBeenCalled();
  });
});

// 저장 프로필은 즉시 표시하되, 서버가 확정한 닉네임을 배경에서 복구한다.
describe('저장 프로필의 닉네임 배경 복구', () => {
  it.each(['저장 게스트', '토스 키 일치'])('%s 경로는 즉시 복원하고 서버 이름을 나중에 보정한다', async path => {
    if (path === '토스 키 일치') {
      vi.stubGlobal('ReactNativeWebView', {});
      mocks.getAnonymousKey.mockResolvedValue({ type: 'HASH', hash: stored.tossAnonymousKey });
    }
    const response = deferred<{ data: { nickname: string }; error: null }>();
    mocks.single.mockReturnValueOnce(response.promise);
    await mount('required');
    // 느린 서버 조회를 기다리지 않고 기존 캐시와 인증 상태로 즉시 이용 가능하다.
    expect(current.user?.nickname).toBe('새친구');
    expect(current.isAuthenticated).toBe(true);
    expect(container.querySelector('[role="dialog"]')).not.toBeNull();
    expect(mocks.rpc).not.toHaveBeenCalled();
    expect(mocks.getGuestClient).toHaveBeenCalledWith(stored.guestToken);
    expect(mocks.select).toHaveBeenCalledWith('nickname');
    expect(mocks.eq).toHaveBeenCalledWith('id', stored.profileId);
    await act(async () => { response.resolve({ data: { nickname: '서버이름' }, error: null }); });
    expect(current.user?.nickname).toBe('서버이름');
    expect(current.profileId).toBe(stored.profileId);
    expect(current.guestToken).toBe(stored.guestToken);
    expect(current.user?.leagueTier).toBe(stored.leagueTier);
    expect(container.querySelector('[role="dialog"]')).toBeNull();
    expect(mocks.setItem).not.toHaveBeenCalled();
    expect(mocks.update).not.toHaveBeenCalled();
    expect(mocks.insert).not.toHaveBeenCalled();
  });

  it('캐시 쓰기 실패 후 재실행하면 보존된 옛 캐시 대신 서버의 변경된 이름으로 복구한다', async () => {
    await mount();
    mocks.setItem.mockRejectedValueOnce(new Error('캐시 쓰기 실패'));
    expect(await change('새이름')).toEqual({ error: null });
    // 저장소는 여전히 새친구를 반환한다. 다음 부팅에서도 서버 보정은 반드시 실행된다.
    await act(async () => { root!.unmount(); });
    root = undefined;
    container.remove();
    mocks.single.mockResolvedValue({ data: { nickname: '새이름' }, error: null });
    mocks.setItem.mockClear();
    await mount('required');
    expect(current.user?.nickname).toBe('새이름');
    expect(current.isAuthenticated).toBe(true);
    expect(container.querySelector('[role="dialog"]')).toBeNull();
    expect(mocks.single).toHaveBeenCalledTimes(2);
    expect(mocks.update).toHaveBeenCalledTimes(1);
    expect(mocks.setItem).not.toHaveBeenCalled();
  });

  it.each(['오프라인 예외', '권한 오류', '행 없음', '이름 형식 오류'])(
    '배경 조회가 %s이면 캐시 인증과 필수 게이트를 유지한다', async mode => {
      if (mode === '오프라인 예외') mocks.single.mockRejectedValueOnce(new Error('연결 없음'));
      if (mode === '권한 오류') mocks.single.mockResolvedValueOnce({ data: null, error: { code: '42501' } });
      if (mode === '행 없음') mocks.single.mockResolvedValueOnce({ data: null, error: null });
      if (mode === '이름 형식 오류') mocks.single.mockResolvedValueOnce({ data: { nickname: 123 }, error: null });
      await mount('required');
      expect(current.user?.nickname).toBe('새친구');
      expect(current.isAuthenticated).toBe(true);
      expect(container.querySelector('[role="dialog"]')).not.toBeNull();
      expect(mocks.setItem).not.toHaveBeenCalled();
      expect(mocks.update).not.toHaveBeenCalled();
      expect(mocks.insert).not.toHaveBeenCalled();
    },
  );

  it('수동 변경 성공 뒤 도착한 옛 이름은 캐시 쓰기 실패 여부와 무관하게 무시한다', async () => {
    const response = deferred<{ data: { nickname: string }; error: null }>();
    mocks.single.mockReturnValueOnce(response.promise);
    await mount('required');
    mocks.setItem.mockRejectedValueOnce(new Error('캐시 쓰기 실패'));
    expect(await change('최신이름')).toEqual({ error: null });
    await act(async () => { response.resolve({ data: { nickname: '새친구' }, error: null }); });
    expect(current.user?.nickname).toBe('최신이름');
    expect(container.querySelector('[role="dialog"]')).toBeNull();
    expect(mocks.update).toHaveBeenCalledTimes(1);
  });

  it('수동 변경이 서버에서 실패한 경우에는 배경 서버 이름 보정을 허용한다', async () => {
    const response = deferred<{ data: { nickname: string }; error: null }>();
    mocks.single.mockReturnValueOnce(response.promise);
    await mount();
    mocks.select.mockResolvedValueOnce({ data: [], error: null });
    expect(await change('실패이름')).toEqual({ error: '닉네임 변경에 실패했어요' });
    await act(async () => { response.resolve({ data: { nickname: '기존서버이름' }, error: null }); });
    expect(current.user?.nickname).toBe('기존서버이름');
    expect(mocks.setItem).not.toHaveBeenCalled();
  });

  it('다른 프로필을 복원한 뒤 도착한 이전 프로필의 응답은 무시한다', async () => {
    const oldResponse = deferred<{ data: { nickname: string }; error: null }>();
    // 개발용 StrictMode의 초기화 재실행으로 같은 Provider에서 복원이 겹치는 경로를 검증한다.
    mocks.getItem.mockResolvedValueOnce(JSON.stringify(stored))
      .mockResolvedValueOnce(JSON.stringify({ ...stored, profileId: 'profile-b', guestToken: 'token-b', nickname: '다른캐시' }));
    mocks.single.mockReturnValueOnce(oldResponse.promise)
      .mockResolvedValueOnce({ data: { nickname: '다른서버이름' }, error: null });
    await mount(undefined, true);
    expect(current.profileId).toBe('profile-b');
    expect(current.user?.nickname).toBe('다른서버이름');
    await act(async () => { oldResponse.resolve({ data: { nickname: '이전서버이름' }, error: null }); });
    expect(current.profileId).toBe('profile-b');
    expect(current.user?.nickname).toBe('다른서버이름');
    expect(current.guestToken).toBe('token-b');
    expect(mocks.setItem).not.toHaveBeenCalled();
  });
});
