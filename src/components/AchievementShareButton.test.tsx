import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AchievementShareButton } from './AchievementShareButton';
import { createAchievementImage, saveAchievementImage, shareAchievementImage } from '../lib/achievementImage';
import { shareTossLink } from '../lib/share';
import { dismissAchievementShare } from '../lib/backEvent';

vi.mock('../lib/achievementImage', () => ({ createAchievementImage: vi.fn(), saveAchievementImage: vi.fn(), shareAchievementImage: vi.fn() }));
vi.mock('../lib/share', () => ({ shareTossLink: vi.fn(() => Promise.resolve()), achievementShareMessage: () => '퀘스트 메시지' }));
vi.mock('../lib/analytics', () => ({ logClick: vi.fn() }));
Object.defineProperty(globalThis, 'IS_REACT_ACT_ENVIRONMENT', { value: true, configurable: true });
let cleanup = () => {};
beforeEach(() => {
  vi.clearAllMocks();
  HTMLDialogElement.prototype.showModal = function () { this.setAttribute('open', ''); };
  HTMLDialogElement.prototype.close = function () { this.removeAttribute('open'); };
});
afterEach(() => cleanup());
const mount = () => {
  const container = document.createElement('div'); document.body.appendChild(container);
  const root = createRoot(container);
  const parentClick = vi.fn(); const parentKey = vi.fn();
  act(() => root.render(<div onClick={parentClick} onKeyDown={parentKey}><AchievementShareButton card={{ kind: 'quest', title: '퀘스트 클리어!', value: '+17', unit: 'XP 획득', description: '단어 3개 배우기' }} /></div>));
  cleanup = () => { act(() => root.unmount()); container.remove(); };
  return { button: container.querySelector('button')!, parentClick, parentKey };
};
const prepared = { dataUrl: 'data:image/png;base64,aGVsbG8=', file: new File(['png'], 'card.png', { type: 'image/png' }) };

describe('이미지 공유 미리보기', () => {
  it('이미지가 준비되기 전 저장·공유를 막고, 저장과 공유를 따로 할 수 있다', async () => {
    let resolve!: (value: typeof prepared) => void;
    vi.mocked(createAchievementImage).mockReturnValue(new Promise(done => { resolve = done; }));
    vi.mocked(saveAchievementImage).mockResolvedValue('downloaded');
    vi.mocked(shareAchievementImage).mockResolvedValue('unsupported');
    const { button, parentClick, parentKey } = mount();
    button.focus();
    await act(async () => button.click());
    const dialog = document.querySelector('dialog')!;
    const [save, share] = dialog.querySelectorAll<HTMLButtonElement>('.achievement-share-actions .action-button');
    expect(save).toBeDisabled();
    expect(share).toBeDisabled();
    await act(async () => resolve(prepared));
    expect(dialog.querySelector('img')).toHaveAttribute('src', prepared.dataUrl);
    expect(save).toHaveTextContent('이미지 저장');
    expect(share).toHaveTextContent('공유하기');
    parentClick.mockClear();
    await act(async () => save.click());
    expect(saveAchievementImage).toHaveBeenCalledWith(prepared);
    expect(dialog).toHaveTextContent('이미지를 다운로드했어요');
    // 파일 공유가 안 되는 환경(토스 포함)은 종류별 링크 공유로 대신한다
    await act(async () => share.click());
    expect(shareAchievementImage).toHaveBeenCalledWith(prepared, '퀘스트 메시지');
    expect(shareTossLink).toHaveBeenCalledWith('quest', '퀘스트 메시지');
    expect(parentClick).not.toHaveBeenCalled();
    act(() => share.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })));
    expect(parentKey).not.toHaveBeenCalled();
    act(() => { expect(dismissAchievementShare()).toBe(true); });
    expect(document.querySelector('dialog')).toBeNull();
    expect(button).toHaveFocus();
  });
  it('친구에게 공유는 공유 시트가 뜨는 동안 다시 눌러도 한 번만 연다', async () => {
    let done!: () => void;
    vi.mocked(shareTossLink).mockReturnValueOnce(new Promise<void>(resolve => { done = resolve; }));
    mount();
    const link = [...document.querySelectorAll<HTMLButtonElement>('.achievement-share-trigger')].find(b => b.textContent === '친구에게 공유')!;
    act(() => { link.click(); link.click(); });
    expect(shareTossLink).toHaveBeenCalledTimes(1);
    await act(async () => done());
    act(() => link.click());
    expect(shareTossLink).toHaveBeenCalledTimes(2);
  });
  it('낮은 버전 토스 앱에서 저장하면 업데이트 안내를 보여준다', async () => {
    vi.mocked(createAchievementImage).mockResolvedValue(prepared);
    vi.mocked(saveAchievementImage).mockResolvedValue('unsupported');
    const { button } = mount();
    await act(async () => button.click());
    const save = document.querySelector<HTMLButtonElement>('dialog .achievement-share-actions .action-button')!;
    await act(async () => save.click());
    expect(document.querySelector('[role="alert"]')).toHaveTextContent('토스 앱을 업데이트해 주세요');
    expect(document.querySelector('dialog')).not.toHaveTextContent('저장했어요');
  });
  it('생성 오류를 안내하고 다시 만들 수 있다', async () => {
    vi.mocked(createAchievementImage).mockRejectedValueOnce(new Error('image failed')).mockResolvedValueOnce(prepared);
    const { button } = mount();
    await act(async () => button.click());
    expect(document.querySelector('[role="alert"]')).toHaveTextContent('이미지를 만들지 못했어요');
    await act(async () => document.querySelector<HTMLButtonElement>('dialog .action-button')!.click());
    expect(document.querySelector('dialog img')).toHaveAttribute('src', prepared.dataUrl);
    expect(document.querySelector('[role="alert"]')).toBeNull();
  });
  it('중복 공유를 막고 공유 실패 후 다시 시도할 수 있다', async () => {
    vi.mocked(createAchievementImage).mockResolvedValue(prepared);
    let reject!: (error: Error) => void;
    vi.mocked(shareAchievementImage).mockReturnValueOnce(new Promise((_resolve, fail) => { reject = fail; })).mockResolvedValueOnce('cancelled');
    const { button } = mount();
    await act(async () => button.click());
    const action = document.querySelectorAll<HTMLButtonElement>('dialog .achievement-share-actions .action-button')[1];
    act(() => { action.click(); action.click(); });
    expect(shareAchievementImage).toHaveBeenCalledTimes(1);
    expect(action).toBeDisabled();
    expect(shareTossLink).not.toHaveBeenCalled();
    await act(async () => reject(new Error('share failed')));
    expect(document.querySelector('[role="alert"]')).toHaveTextContent('처리하지 못했어요');
    expect(action).toBeEnabled();
    await act(async () => action.click());
    expect(document.querySelector('[role="alert"]')).toBeNull();
    expect(document.querySelector('dialog')).toBeInTheDocument();
  });
});
