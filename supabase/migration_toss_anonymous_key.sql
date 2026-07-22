-- 유저정보 연동: 토스 익명 사용자 키(getAnonymousKey hash)로 프로필 식별
-- 재설치/기기 변경 시 guest_token 소실로 학습 진행도가 유실되는 문제 해결 (APPS_IN_TOSS_TODO A-1)
-- Supabase 대시보드 → SQL Editor → 붙여넣기 → Run
--
-- 주의: 컬럼명은 toss_anonymous_key (TEXT). toss_user_key(BIGINT)는 토스 로그인 userKey 전용이며
--       migration_push_subscriptions.sql 이 선점 중이라 별개 컬럼이다.

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS toss_anonymous_key TEXT UNIQUE;

-- 토스 익명 키로 프로필을 찾거나(기존)/붙이거나(승격)/새로 만든다.
-- SECURITY DEFINER: anon은 profiles_select 정책상 자기 행만 SELECT 가능이라
-- 임의 toss_anonymous_key 조회가 정책을 못 통과하므로 필요.
-- 신뢰 모델: p_toss_key/p_guest_token은 클라이언트 값이며 서버 검증이 없다.
-- x-guest-token 헤더가 곧 인증 자격증명인 기존 모델과 동일 수준 — 새 노출 없음.
-- 서버측 hash 검증은 토스 로그인(A-1) 도입 시 함께.
CREATE OR REPLACE FUNCTION public.resolve_profile_by_toss_key(
  p_toss_key    TEXT,
  p_guest_token UUID DEFAULT NULL
)
RETURNS TABLE (
  out_id          UUID,
  out_guest_token UUID,
  out_nickname    TEXT,
  out_is_guest    BOOLEAN,
  out_league_tier TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE v_id UUID;
BEGIN
  IF p_toss_key IS NULL OR length(p_toss_key) < 8 THEN
    RAISE EXCEPTION 'invalid toss key';
  END IF;

  -- 1) 이미 연동된 프로필
  SELECT p.id INTO v_id FROM profiles p WHERE p.toss_anonymous_key = p_toss_key;

  -- 2) 기존 게스트 승격 (아직 키가 안 붙은 행만)
  IF v_id IS NULL AND p_guest_token IS NOT NULL THEN
    UPDATE profiles p
       SET toss_anonymous_key = p_toss_key, updated_at = now()
     WHERE p.guest_token = p_guest_token
       AND p.toss_anonymous_key IS NULL
    RETURNING p.id INTO v_id;
  END IF;

  -- 3) 신규 생성 (동시 호출 안전 — 경쟁 시 UNIQUE 위반 대신 기존 행 반환)
  IF v_id IS NULL THEN
    INSERT INTO profiles (toss_anonymous_key) VALUES (p_toss_key)
    ON CONFLICT (toss_anonymous_key) DO UPDATE SET updated_at = now()
    RETURNING profiles.id INTO v_id;
  END IF;

  RETURN QUERY
    SELECT p.id, p.guest_token, p.nickname, p.is_guest, p.league_tier
      FROM profiles p WHERE p.id = v_id;
END;
$$;

-- REVOKE FROM PUBLIC 후에는 authenticated/service_role 도 EXECUTE 를 잃으므로 명시 부여.
-- (기존 RPC들은 REVOKE 가 없어 PUBLIC 상속으로 동작했다 — migration_points_integrity.sql §6 참고)
REVOKE EXECUTE ON FUNCTION public.resolve_profile_by_toss_key(TEXT, UUID) FROM PUBLIC;
GRANT  EXECUTE ON FUNCTION public.resolve_profile_by_toss_key(TEXT, UUID) TO anon;
GRANT  EXECUTE ON FUNCTION public.resolve_profile_by_toss_key(TEXT, UUID) TO authenticated;
GRANT  EXECUTE ON FUNCTION public.resolve_profile_by_toss_key(TEXT, UUID) TO service_role;
