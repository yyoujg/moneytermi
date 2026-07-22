-- ============================================================
-- profiles 쓰기/읽기 권한 정리 (컬럼 단위)
-- 운영 DB에 증분 실행. schema.sql 재실행 금지.
-- Supabase 대시보드 → SQL Editor → 붙여넣기 → Run
--
-- 배경: migration_points_integrity.sql §6 이 UPDATE 는 컬럼 단위로 좁혔지만
--       INSERT / SELECT 는 테이블 전체 권한이 그대로 남아있었다.
--   1) INSERT: anon 이 points/league_tier 를 지정해 프로필을 만들 수 있어
--      리그 랭킹 상단을 즉시 차지할 수 있었다.
--   2) SELECT: migration_league_rls.sql 이 정책을 USING (true) 로 열면서
--      guest_token 컬럼까지 전체 공개됐다. guest_token 은 x-guest-token 헤더로
--      쓰이는 인증 자격증명이므로, 조회한 토큰으로 임의 사용자를 가장할 수 있었다.
--
-- 방식은 points 무결성 마이그레이션과 동일하게 컬럼 단위 GRANT 를 쓴다.
-- ============================================================

-- ──────────────────────────────────────────
-- 1. INSERT — guest_token 만 허용
--    나머지 컬럼은 DEFAULT 로 채워진다 (points 0, league_tier 'bronze' 등)
-- ──────────────────────────────────────────
REVOKE INSERT ON public.profiles FROM anon, authenticated;
GRANT  INSERT (guest_token) ON public.profiles TO anon, authenticated;

-- 정책도 함께 좁힌다 (컬럼 GRANT 와 이중 방어)
DROP POLICY IF EXISTS "profiles_insert" ON public.profiles;
CREATE POLICY "profiles_insert" ON public.profiles
  FOR INSERT WITH CHECK (
    auth_id     IS NULL
    AND email   IS NULL
    AND is_guest    = true
    AND points      = 0
    AND quiz_combo  = 0
    AND league_tier = 'bronze'
  );

-- ──────────────────────────────────────────
-- 2. SELECT — 인증 자격증명·개인정보 컬럼 제외
--    guest_token / auth_id / email 은 클라이언트가 조회할 일이 없다.
--    (본인 guest_token 은 이미 기기 Storage 에 있다)
-- ──────────────────────────────────────────
REVOKE SELECT ON public.profiles FROM anon, authenticated;
GRANT  SELECT (id, nickname, emoji, league_tier, points, quiz_combo, is_guest,
               created_at, updated_at)
  ON public.profiles TO anon, authenticated;

-- ──────────────────────────────────────────
-- 3. 확인용 (실행 후 수동 점검)
-- ──────────────────────────────────────────
-- select privilege_type, column_name
--   from information_schema.column_privileges
--  where table_name = 'profiles' and grantee = 'anon'
--  order by privilege_type, column_name;
--
-- 기대: INSERT = guest_token 만 / UPDATE = emoji, nickname 만
--       SELECT = 위 9개 컬럼만 (guest_token, auth_id, email 없어야 함)
