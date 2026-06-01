import { useState, useEffect, useRef } from 'react';
import type { Word } from '../types';

export type NaverNewsItem = { title: string; link: string; description: string; pubDate: string };

const fetchNews = (word: string): Promise<NaverNewsItem[]> => {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;
  return fetch(`${supabaseUrl}/functions/v1/naver-news`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${anonKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: word }),
  })
    .then(res => res.json())
    .then(data => Array.isArray(data) ? data : [])
    .catch(() => []);
};

// 현재 단어의 네이버 뉴스 로드(세션 캐시 우선) + 다음 단어 prefetch
export const useNews = (words: Word[], wordIndex: number) => {
  const newsCache = useRef<Map<string, NaverNewsItem[]>>(new Map());
  const [newsItems, setNewsItems] = useState<NaverNewsItem[]>([]);
  const [newsLoading, setNewsLoading] = useState(false);

  useEffect(() => {
    if (!words.length) return;
    const currentWord = words[wordIndex];
    if (!currentWord) return;
    let cancelled = false;

    const cached = newsCache.current.get(currentWord.word);
    if (cached) {
      setNewsItems(cached);
      setNewsLoading(false);
    } else {
      setNewsItems([]);
      setNewsLoading(true);
      fetchNews(currentWord.word).then(data => {
        if (!cancelled) {
          newsCache.current.set(currentWord.word, data);
          setNewsItems(data);
          setNewsLoading(false);
        }
      });
    }

    // 다음 단어 prefetch
    const nextWord = words[wordIndex + 1];
    if (nextWord && !newsCache.current.has(nextWord.word)) {
      fetchNews(nextWord.word).then(data => {
        newsCache.current.set(nextWord.word, data);
      });
    }

    return () => { cancelled = true; };
  }, [wordIndex, words]);

  return { newsItems, newsLoading };
};
