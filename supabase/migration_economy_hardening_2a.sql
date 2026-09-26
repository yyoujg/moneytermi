-- 포인트·XP 경제 보강 2a/3 — 퀴즈 보상 일일 카운터 테이블만. (Supabase 에디터가 CREATE TABLE을 보면 RLS 자동 추가 기능이 문장을 ;로 쪼개
--  같은 붙여넣기 안의 함수 본문(달러 인용)을 깨뜨린다 → 테이블(2a)과 함수(2b)를 따로 실행한다. 2a → 2b 순서.)

CREATE TABLE IF NOT EXISTS public.quiz_rewards_daily (user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE, date DATE NOT NULL, count INTEGER NOT NULL DEFAULT 0, PRIMARY KEY (user_id, date));
ALTER TABLE public.quiz_rewards_daily ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.quiz_rewards_daily FROM anon, authenticated;

NOTIFY pgrst, 'reload schema';
