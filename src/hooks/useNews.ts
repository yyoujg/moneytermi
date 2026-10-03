import { useState, useEffect, useRef } from 'react';
import type { Word } from '../types';

export type NaverNewsItem = { title: string; link: string; description: string; pubDate: string; image?: string; source?: string };

const fetchNews = async (word: string): Promise<NaverNewsItem[]> => {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;
  const response = await fetch(`${supabaseUrl}/functions/v1/naver-news`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${anonKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: word }),
  });
  if (!response.ok) throw new Error(`뉴스 조회 실패: ${response.status}`);
  const data: unknown = await response.json();
  if (!Array.isArray(data)) throw new Error('뉴스 응답 형식 오류');
  return data as NaverNewsItem[];
};

// 현재 단어의 네이버 뉴스 로드(세션 캐시 우선) + 다음 단어 prefetch
export const useNews = (words: Word[], wordIndex: number) => {
  const newsCache = useRef<Map<string, NaverNewsItem[]>>(new Map());
  const [newsItems, setNewsItems] = useState<NaverNewsItem[]>([]);
  const [newsStatus, setNewsStatus] = useState<'loading' | 'empty' | 'error' | 'success'>('loading');
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    if (!words.length) return;
    const currentWord = words[wordIndex];
    if (!currentWord) return;
    let cancelled = false;

    const cached = newsCache.current.get(currentWord.word);
    if (cached) {
      setNewsItems(cached);
      setNewsStatus(cached.length ? 'success' : 'empty');
    } else {
      setNewsItems([]);
      setNewsStatus('loading');
      fetchNews(currentWord.word)
        .then(data => {
          if (cancelled) return;
          newsCache.current.set(currentWord.word, data);
          setNewsItems(data);
          setNewsStatus(data.length ? 'success' : 'empty');
        })
        .catch(() => { if (!cancelled) setNewsStatus('error'); });
    }

    // 다음 단어 prefetch
    const nextWord = words[wordIndex + 1];
    if (nextWord && !newsCache.current.has(nextWord.word)) {
      fetchNews(nextWord.word)
        .then(data => { newsCache.current.set(nextWord.word, data); })
        .catch(() => {});
    }

    return () => { cancelled = true; };
  }, [wordIndex, words, retryKey]);

  return { newsItems, newsStatus, retryNews: () => setRetryKey(key => key + 1) };
};
