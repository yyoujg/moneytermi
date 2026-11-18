-- 적용 확인(읽기 전용). 이번 주 등급별 참여자 수와, 새 정의에 등급 조건이 들어갔는지 본다.
SELECT p.league_stage, count(*) AS participants
FROM (
  SELECT user_id FROM public.xp_events
  WHERE created_at >= public.league_week_start() AND delta > 0
  GROUP BY user_id HAVING SUM(delta) > 0
) w JOIN public.profiles p ON p.id = w.user_id AND NOT p.exclude_from_league
GROUP BY 1 ORDER BY 1;

-- 세 줄 모두 has_stage_filter = true 여야 한다
SELECT p.proname, pg_get_functiondef(p.oid) LIKE '%league_stage%' AS has_stage_filter
FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public' AND p.proname IN ('leaderboard_top', 'my_league_rank', 'settle_league')
ORDER BY 1;
