-- 리그 순위 함수의 현재 정의를 읽는다(읽기 전용). 결과의 definition 열을 그대로 복사해 전달한다.
SELECT p.oid::regprocedure AS signature, pg_get_functiondef(p.oid) AS definition
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public' AND p.proname IN ('my_league_rank', 'leaderboard_top')
ORDER BY p.proname;
