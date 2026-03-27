import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!url || !key) {
  throw new Error('환경변수 누락: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY 를 확인하세요.');
}

// 기본 클라이언트 (Supabase Auth 세션용)
export const supabase = createClient<Database>(url, key);

// 게스트용 클라이언트 — RLS 통과를 위해 x-guest-token 헤더 포함
export const getGuestClient = (guestToken: string) =>
  createClient<Database>(url, key, {
    global: { headers: { 'x-guest-token': guestToken } },
  });
