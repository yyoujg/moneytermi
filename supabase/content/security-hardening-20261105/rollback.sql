-- apply.sql 되돌리기. search_path는 apply 때 NOTICE로 찍힌 함수만 RESET 하면 되지만, 고정해 둔 채로 두어도 동작은 같다.
BEGIN;

GRANT EXECUTE ON FUNCTION public.link_guest_to_auth(UUID, UUID, TEXT) TO PUBLIC;
ALTER FUNCTION public.link_guest_to_auth(UUID, UUID, TEXT) RESET search_path;

ALTER VIEW public.league_rankings SET (security_invoker = false);
GRANT SELECT ON public.league_rankings TO anon, authenticated;

COMMIT;
