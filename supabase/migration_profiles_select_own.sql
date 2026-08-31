-- ============================================================
-- profiles SELECT를 본인 행만 허용하도록 좁힌다
-- 운영 DB에 증분 실행. schema.sql 재실행 금지.
-- Supabase 대시보드 → SQL Editor → 붙여넣기 → Run
--
-- 배경: migration_league_rls.sql의 profiles_select_public(USING (true))은
-- 리그 리더보드(다른 유저 프로필 표시)를 위해 열어둔 것이었다. 2026-08-31
-- "캐릭터 키우기" 전환으로 리더보드 자체가 사라지면서, 이 전체 공개 정책은
-- 근거를 잃었다 — anon key만 있으면 여전히 전체 유저의 nickname/points/emoji를
-- 직접 조회할 수 있는 과다 노출 상태였다.
--
-- 유일하게 남아있던 "다른 유저 조회" 용도는 닉네임 중복 체크
-- (useAuth.tsx updateNickname)였다. 이건 SECURITY DEFINER RPC로 옮기고,
-- SELECT 정책 자체는 본인 행만 허용하도록 좁힌다.
-- ============================================================

-- ──────────────────────────────────────────
-- 1. 닉네임 중복 체크 RPC — 행 데이터 노출 없이 boolean만 반환
-- ──────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.is_nickname_taken(
  p_nickname   TEXT,
  p_exclude_id UUID
)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE nickname = p_nickname AND id != p_exclude_id
  );
$$;

GRANT EXECUTE ON FUNCTION public.is_nickname_taken(TEXT, UUID) TO anon, authenticated;

-- ──────────────────────────────────────────
-- 2. SELECT 정책을 본인 행만으로 교체
--    current_profile_id()는 migration_points_integrity.sql에서 정의된
--    SECURITY DEFINER 함수로, word_progress/daily_missions/attendance
--    정책에 이미 쓰이는 것과 동일한 패턴이다.
-- ──────────────────────────────────────────
DROP POLICY IF EXISTS "profiles_select_public" ON public.profiles;
CREATE POLICY "profiles_select_own" ON public.profiles
  FOR SELECT USING (id = public.current_profile_id());
