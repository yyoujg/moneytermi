import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { achievementImageLines, canShareAchievementImage, createAchievementImage, shareAchievementImage, streakShareCard } from './achievementImage';

const bridge = vi.hoisted(() => ({ supported: vi.fn(() => false), save: vi.fn() }));
vi.mock('@apps-in-toss/web-framework', () => ({ File: { saveBase64: Object.assign(bridge.save, { isSupported: bridge.supported }) } }));
const image = { dataUrl: 'data:image/png;base64,aGVsbG8=', file: new File(['hello'], 'record.png', { type: 'image/png' }) };
beforeEach(() => { vi.clearAllMocks(); bridge.supported.mockReturnValue(false); bridge.save.mockResolvedValue(undefined); });
afterEach(() => { vi.restoreAllMocks(); vi.unstubAllGlobals(); });

describe('달성 이미지 전달', () => {
  it('토스에서는 실제 PNG의 Base64와 파일 이름을 네이티브로 전달한다', async () => {
    bridge.supported.mockReturnValue(true);
    expect(canShareAchievementImage(image)).toBe(true);
    expect(await shareAchievementImage(image)).toBe('shared');
    expect(bridge.save).toHaveBeenCalledWith({ data: 'aGVsbG8=', fileName: 'record.png', mimeType: 'image/png' });
  });
  it('파일 공유 지원 브라우저는 PNG 파일 자체를 클릭 직후 전달한다', async () => {
    const share = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal('navigator', { share, canShare: vi.fn(() => true) });
    const pending = shareAchievementImage(image);
    expect(share).toHaveBeenCalledWith({ files: [image.file] });
    expect(await pending).toBe('shared');
    expect(bridge.save).not.toHaveBeenCalled();
  });
  it('공유 취소는 다운로드나 다른 공유 창을 자동으로 열지 않는다', async () => {
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
    vi.stubGlobal('navigator', { share: vi.fn().mockRejectedValue(new DOMException('cancelled', 'AbortError')), canShare: () => true });
    expect(await shareAchievementImage(image)).toBe('cancelled');
    expect(click).not.toHaveBeenCalled();
    expect(bridge.save).not.toHaveBeenCalled();
  });
  it('공유 미지원 환경은 PNG 다운로드로 제공한다', async () => {
    vi.stubGlobal('navigator', { share: undefined });
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
    expect(canShareAchievementImage(image)).toBe(false);
    expect(await shareAchievementImage(image)).toBe('downloaded');
    const downloaded = click.mock.instances[0] as HTMLAnchorElement;
    expect(downloaded.download).toBe('record.png');
    expect(downloaded.href).toBe(image.dataUrl);
    expect(downloaded.isConnected).toBe(false);
  });
  it('토스 환경 상수가 없는 일반 브라우저에서도 이미지 저장이 열린다', async () => {
    bridge.supported.mockImplementationOnce(() => { throw new TypeError('operationalEnvironment'); }).mockImplementationOnce(() => { throw new TypeError('operationalEnvironment'); });
    vi.stubGlobal('navigator', { share: undefined });
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
    expect(canShareAchievementImage(image)).toBe(false);
    expect(await shareAchievementImage(image)).toBe('downloaded');
    expect(click).toHaveBeenCalledOnce();
  });
  it('실패를 성공으로 처리하지 않고 재시도할 수 있게 전달한다', async () => {
    bridge.supported.mockReturnValue(true);
    bridge.save.mockRejectedValue(new Error('device unavailable'));
    await expect(shareAchievementImage(image)).rejects.toThrow('device unavailable');
  });
});

describe('공유 카드 내용과 PNG 생성', () => {
  it('공유 데이터는 실제 연속 일수를 사용하며 미래 날짜는 출석으로 만들지 않는다', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-11-17T01:00:00Z'));
    const card = streakShareCard(2, ['2026-11-16', '2026-11-17']);
    expect(card.value).toBe('2');
    expect(card.week?.map(day => day.attended)).toEqual([true, true, false, false, false, false, false]);
    vi.useRealTimers();
  });
  it('종류별 세로 템플릿 위에 실제 값을 1080x1920 PNG로 쓴다', async () => {
    const fillText = vi.fn();
    const drawImage = vi.fn();
    const ctx = { measureText: (text: string) => ({ width: text.length * 35 }), fillText, fillRect: vi.fn(), drawImage, set font(_: string) {}, set fillStyle(_: string) {}, set globalAlpha(_: number) {}, set textBaseline(_: string) {} };
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(ctx as unknown as CanvasRenderingContext2D);
    vi.spyOn(HTMLCanvasElement.prototype, 'toDataURL').mockReturnValue(image.dataUrl);
    let size = [0, 0];
    vi.spyOn(HTMLCanvasElement.prototype, 'toBlob').mockImplementation(function (this: HTMLCanvasElement, callback) {
      size = [this.width, this.height];
      callback(new Blob(['png'], { type: 'image/png' }));
    });
    let src = '';
    vi.stubGlobal('Image', class { set src(value: string) { src = value; } decode() { return Promise.resolve(); } });
    Object.defineProperty(document, 'fonts', { configurable: true, value: { ready: Promise.resolve() } });
    const result = await createAchievementImage({ kind: 'quest', title: '퀘스트 클리어!', value: '+17', unit: 'XP 획득', description: '경제 용어 5개 학습' });
    expect(src).toBe('/share/quest.jpg');
    expect(size).toEqual([1080, 1920]);
    expect(result.file.name).toMatch(/^moneytermi-quest-.*\.png$/);
    expect(fillText).toHaveBeenCalledWith('오늘의 미션 완료', 66, expect.any(Number), 948);
    expect(fillText).toHaveBeenCalledWith('경제 용어 5개 학습 · +17 XP', 66, expect.any(Number), 948);
  });
  it('종류마다 템플릿 라벨과 값 줄을 실제 기록으로 만든다', () => {
    expect(achievementImageLines(streakShareCard(7, []))).toEqual(['연속 학습 기록', '7일 연속 출석']);
    expect(achievementImageLines({ kind: 'league', title: '', value: '꼼꼼이', unit: '', description: '' })).toEqual(['이번 주 리그', '꼼꼼이 리그로 승급']);
    expect(achievementImageLines({ kind: 'badge', title: '', value: '2', unit: '', description: '첫 단어 · 3일 연속' })).toEqual(['첫 단어 · 3일 연속', '새 배지 2개']);
    expect(achievementImageLines({ kind: 'quiz', title: '', value: '90%', unit: '', description: '퀴즈 10문제 중 9문제 정답' })).toEqual(['오늘의 퀴즈', '퀴즈 10문제 중 9문제 정답']);
  });
});
