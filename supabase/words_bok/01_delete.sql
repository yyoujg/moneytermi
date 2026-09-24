-- ⚠️ 여기서부터 되돌릴 수 없다. 00_backup.sql이 끝난 뒤 실행할 것.
-- ===== STEP 2 : 기존 데이터 삭제 =====
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS sort_order INTEGER NOT NULL DEFAULT 0;
DELETE FROM public.word_progress;
DELETE FROM public.course_words;
DELETE FROM public.courses;
DELETE FROM public.words;
