import { Storage as AitStorage } from '@apps-in-toss/web-framework';

const isTossApp = () => !!(window as Window & { ReactNativeWebView?: unknown }).ReactNativeWebView;

export const Storage = {
  async getItem(key: string): Promise<string | null> {
    if (isTossApp()) return AitStorage.getItem(key);
    return localStorage.getItem(key);
  },
  async setItem(key: string, value: string): Promise<void> {
    if (isTossApp()) return AitStorage.setItem(key, value);
    localStorage.setItem(key, value);
  },
  async removeItem(key: string): Promise<void> {
    if (isTossApp()) return AitStorage.removeItem(key);
    localStorage.removeItem(key);
  },
};
