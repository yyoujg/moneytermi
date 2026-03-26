-- ============================================================
-- 리그 공개 조회 허용 (nickname, emoji, points - 비민감 데이터)
-- Supabase 대시보드 → SQL Editor → 실행
-- ============================================================

-- 기존 제한적 SELECT 정책 제거
DROP POLICY IF EXISTS "profiles_select" ON public.profiles;

-- 전체 읽기 허용 (리그 순위 표시용)
-- email/auth_id 같은 민감 컬럼은 앱 레이어에서 필터링
CREATE POLICY "profiles_select_public" ON public.profiles
  FOR SELECT USING (true);

-- UPDATE/INSERT 는 기존 정책 유지 (본인만 수정 가능)
