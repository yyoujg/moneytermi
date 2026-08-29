-- ============================================================
-- 긴급 수정: 신규 게스트 진입 전체 차단 버그
-- 운영 DB에 즉시 실행. schema.sql 재실행 금지.
-- Supabase 대시보드 → SQL Editor → 붙여넣기 → Run
--
-- 증상: 앱 진입 시 "permission denied for table profiles" (42501)로
-- attendance/word_progress/daily_missions 조회 실패, 스플래시에서 멈춤.
--
-- 원인: word_progress_own / daily_missions_own / attendance_own 정책이
-- profiles.guest_token / profiles.auth_id 를 직접 서브쿼리하는데,
-- migration_profiles_grants.sql 이 anon/authenticated 의 profiles SELECT
-- 권한을 9개 컬럼(guest_token·auth_id 제외)으로 좁히면서 이 서브쿼리가
-- 깨졌다. current_profile_id()(SECURITY DEFINER, migration_points_integrity.sql)
-- 는 컬럼 권한과 무관하게 동작하므로, 세 정책 모두 이 함수를 쓰도록 바꾼다.
-- ============================================================

DROP POLICY IF EXISTS "word_progress_own" ON public.word_progress;
CREATE POLICY "word_progress_own" ON public.word_progress
  FOR ALL USING (user_id = public.current_profile_id());

DROP POLICY IF EXISTS "daily_missions_own" ON public.daily_missions;
CREATE POLICY "daily_missions_own" ON public.daily_missions
  FOR ALL USING (user_id = public.current_profile_id());

DROP POLICY IF EXISTS "attendance_own" ON public.attendance;
CREATE POLICY "attendance_own" ON public.attendance
  FOR ALL USING (user_id = public.current_profile_id());
