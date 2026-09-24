-- 내부 헬퍼 RPC 노출 차단 (2026-09-24 전체 점검)
-- Supabase 기본 권한이 새 함수를 anon/authenticated에 자동 GRANT하므로 셋 다 회수한다.
-- 선행: migration_xp.sql STEP 4~8 (add_xp가 있어야 두 번째 REVOKE가 통과한다)
REVOKE EXECUTE ON FUNCTION public.bump_mission(UUID, TEXT, INTEGER) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.add_xp(UUID, INTEGER)             FROM PUBLIC, anon, authenticated;

-- 클라이언트는 word_progress를 upsert만 한다. DELETE가 열려 있으면
-- "지우고 다시 넣기"로 INSERT 트리거(XP/미션)를 무한 파밍할 수 있다.
REVOKE DELETE ON public.word_progress FROM anon, authenticated;

NOTIFY pgrst, 'reload schema';

-- 확인:
-- SELECT proname, has_function_privilege('anon', p.oid, 'EXECUTE') AS anon_exec,
--        (pg_get_functiondef(p.oid) LIKE '%add_xp%') AS calls_add_xp
-- FROM pg_proc p WHERE pronamespace='public'::regnamespace
--   AND proname IN ('add_xp','bump_mission','submit_quiz_answer','checkin','claim_mission_reward','on_word_progress_insert')
-- ORDER BY 1;
-- 기대: add_xp/bump_mission anon_exec=false, 나머지 4개 calls_add_xp=true
