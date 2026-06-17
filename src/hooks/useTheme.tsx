import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { Storage } from '../lib/storage';

export type Theme = 'system' | 'light' | 'dark';
const KEY = 'setting_theme';

const prefersDark = () =>
  typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-color-scheme: dark)').matches;

const applyDark = (theme: Theme) => {
  const isDark = theme === 'dark' || (theme === 'system' && prefersDark());
  document.documentElement.classList.toggle('dark', isDark);
};

type ThemeContextValue = { theme: Theme; setTheme: (t: Theme) => void };
const ThemeContext = createContext<ThemeContextValue | null>(null);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [theme, setThemeState] = useState<Theme>('system');

  // 최초: 저장값 로드 후 적용 (없으면 system)
  useEffect(() => {
    let cancelled = false;
    Storage.getItem(KEY)
      .then((v) => {
        const t: Theme = v === 'light' || v === 'dark' ? v : 'system';
        if (cancelled) return;
        setThemeState(t);
        applyDark(t);
      })
      .catch(() => applyDark('system'));
    return () => { cancelled = true; };
  }, []);

  // system 모드일 때 OS 테마 변경 반영
  useEffect(() => {
    if (theme !== 'system' || !window.matchMedia) return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => applyDark('system');
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [theme]);

  const setTheme = useCallback((t: Theme) => {
    setThemeState(t);
    applyDark(t);
    Storage.setItem(KEY, t).catch(() => {});
  }, []);

  return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useTheme = (): ThemeContextValue => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
};
