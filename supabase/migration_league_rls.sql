-- ============================================================
-- 리그 공개 조회 허용 (nickname, emoji, points - 비민감 데이터)
-- Supabase 대시보드 → SQL Editor → 실행
-- ============================================================

-- 기존 제한적 SELECT 정책 제거
DROP POLICY IF EXISTS "profiles_select" ON public.profiles;

-- 전체 읽기 허용 (리그 순위 표시용)
CREATE POLICY "profiles_select_public" ON public.profiles
  FOR SELECT USING (true);

-- UPDATE/INSERT 는 기존 정책 유지 (본인만 수정 가능)

-- ============================================================
-- 정정 (2026-07-22) — 이 파일의 원래 주석은 틀렸다.
--   "email/auth_id 같은 민감 컬럼은 앱 레이어에서 필터링"
--   → anon key 로 PostgREST 를 직접 호출하면 앱 레이어를 통과하지 않는다.
--     정책이 USING (true) 인 동안 guest_token(= x-guest-token 인증 자격증명)까지
--     전체 공개돼 임의 사용자 가장이 가능했다.
--   컬럼 노출은 GRANT 로만 막을 수 있다 → migration_profiles_grants.sql 에서 처리.
-- ============================================================
