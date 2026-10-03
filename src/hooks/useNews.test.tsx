import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { Word } from '../types';
import { useNews } from './useNews';

const words: Word[] = [{ id: 94, word: '규모의 경제', meaning: '', detailedMeaning: '', newsExample: '', hint: '', difficulty: 1 }];

const Probe = () => {
  const { newsItems, newsStatus, retryNews } = useNews(words, 0);
  return <div><span>{newsStatus}:{newsItems.length}</span><button onClick={retryNews}>다시 시도</button></div>;
};

let cleanup = () => {};
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

const mount = () => {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);
  act(() => root.render(<Probe />));
  cleanup = () => { act(() => root.unmount()); container.remove(); };
  return container;
};

describe('단어 뉴스 상태', () => {
  it('정상적인 빈 결과를 기사 없음으로 표시한다', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => [] }));
    const container = mount();
    expect(container.textContent).toContain('loading:0');
    await act(async () => { await Promise.resolve(); });
    expect(container.textContent).toContain('empty:0');
  });

  it('조회 실패 후 다시 시도하면 성공 결과를 표시한다', async () => {
    vi.stubGlobal('fetch', vi.fn()
      .mockResolvedValueOnce({ ok: false, status: 502 })
      .mockResolvedValueOnce({ ok: true, json: async () => [{ title: '기사', link: 'https://example.com', description: '', pubDate: '' }] }));
    const container = mount();
    await act(async () => { await Promise.resolve(); });
    expect(container.textContent).toContain('error:0');
    await act(async () => { container.querySelector('button')!.click(); await Promise.resolve(); });
    expect(container.textContent).toContain('success:1');
  });
});
