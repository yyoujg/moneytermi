-- 경제금융용어 800선(한국은행, 2026)으로 단어 전면 교체
--
-- PDF 428페이지에서 색인 765개를 앵커로 본문을 잘라 716개를 확보했다.
-- 본문이 이웃 항목과 뒤섞이던 문제는 색인 파싱 찌꺼기(페이지 표시·항목 병합)가 원인이었고,
-- 이를 정리해 앵커를 728개까지 올린 뒤 길이가 비정상인 12개를 제외했다.
-- PDF가 단어 중간에서 줄을 끊으므로, 줄 끝이 조사·어미가 아니면 공백 없이 이어 붙인다.
--
-- meaning = 본문 첫 문장(110자 초과 시 절단, 약 26%)
-- detailed_meaning = 본문 1200자까지 / hint = 용어 초성 자동 생성
-- news_example = 원문에 없어 빈 문자열 → 빈칸 채우기 퀴즈는 비활성화된다
--
-- ⚠️ 기존 단어를 전부 지우므로 word_progress(학습 진도)도 함께 삭제한다.
--    4개 테이블을 *_backup_20260924로 복사한 뒤 교체하므로 되돌릴 수 있다.
-- 적용: 대시보드 SQL Editor에서 STEP별로 실행.

-- ===== STEP 1 : 백업 =====
-- 백업 테이블은 RLS를 켜고 클라이언트 권한을 회수한다. 정책을 만들지 않으므로
-- anon/authenticated로는 접근할 수 없고 대시보드(service role)에서만 보인다.
-- word_progress_backup에는 전체 사용자의 학습 진도가 들어가므로 특히 중요하다.
DROP TABLE IF EXISTS public.words_backup_20260924;
CREATE TABLE public.words_backup_20260924 AS SELECT * FROM public.words;
ALTER TABLE public.words_backup_20260924 ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.words_backup_20260924 FROM anon, authenticated;
DROP TABLE IF EXISTS public.courses_backup_20260924;
CREATE TABLE public.courses_backup_20260924 AS SELECT * FROM public.courses;
ALTER TABLE public.courses_backup_20260924 ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.courses_backup_20260924 FROM anon, authenticated;
DROP TABLE IF EXISTS public.course_words_backup_20260924;
CREATE TABLE public.course_words_backup_20260924 AS SELECT * FROM public.course_words;
ALTER TABLE public.course_words_backup_20260924 ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.course_words_backup_20260924 FROM anon, authenticated;
DROP TABLE IF EXISTS public.word_progress_backup_20260924;
CREATE TABLE public.word_progress_backup_20260924 AS SELECT * FROM public.word_progress;
ALTER TABLE public.word_progress_backup_20260924 ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.word_progress_backup_20260924 FROM anon, authenticated;
-- 확인: SELECT count(*) FROM public.words_backup_20260924;
-- 확인: SELECT count(*) FROM public.words_backup_20260924;  -- 275
