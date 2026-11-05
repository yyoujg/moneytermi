-- 보안 점검(2026-11-05) 중 앱 동작을 바꾸지 않고 서버에서 바로 막을 수 있는 것만 모았다.
-- 1) link_guest_to_auth: 앱이 쓰지 않는데 누구나 호출해 남의 계정에 auth_id·이메일을 붙일 수 있었다 -> 실행 권한 회수
-- 2) league_rankings 뷰: 소유자 권한으로 RLS를 우회해 전체 프로필을 보여줬다(앱 미사용) -> 호출자 권한 + 읽기 권한 회수
-- 3) search_path 없는 SECURITY DEFINER 함수: 스키마 바꿔치기로 다른 함수가 실행될 수 있다 -> 고정
-- 토스 키 검증(resolve_profile_by_toss_key), 게스트 토큰 교체, 광고 보상 증빙은 앱 변경이 같이 필요해 여기 넣지 않았다.
BEGIN;

REVOKE EXECUTE ON FUNCTION public.link_guest_to_auth(UUID, UUID, TEXT) FROM PUBLIC, anon, authenticated;
ALTER FUNCTION public.link_guest_to_auth(UUID, UUID, TEXT) SET search_path = public, pg_temp;

ALTER VIEW public.league_rankings SET (security_invoker = true);
REVOKE SELECT ON public.league_rankings FROM anon, authenticated;

-- public 스키마의 SECURITY DEFINER 함수 중 search_path가 없는 것 전부.
-- extensions를 같이 넣어 pgcrypto 같은 확장 함수를 이름만으로 부르는 함수도 그대로 돈다.
DO $$
DECLARE f record;
BEGIN
  FOR f IN
    SELECT p.oid::regprocedure AS sig
    FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public' AND p.prosecdef
      AND NOT EXISTS (SELECT 1 FROM unnest(coalesce(p.proconfig, '{}')) c WHERE c LIKE 'search_path=%')
  LOOP
    EXECUTE format('ALTER FUNCTION %s SET search_path = public, extensions, pg_temp', f.sig);
    RAISE NOTICE 'search_path 고정: %', f.sig;
  END LOOP;
END $$;

COMMIT;
