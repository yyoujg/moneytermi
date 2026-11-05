-- 리그 참가자가 실제 사용자인지 확인(읽기 전용). 결과는 한 줄씩 나온다.
-- participants: 앱 리그와 같은 기준(이번 주 XP 합 > 0)
-- learning: 출석(+3)만이 아니라 학습으로도 XP를 얻은 프로필(이번 주 XP > 3)
-- single_event: 이번 주 XP 기록이 한 번뿐인 프로필(대개 출석만 하고 나간 방문)
-- toss_linked: 토스 익명 키가 있는 프로필(토스 앱에서 실제로 들어온 사용자)
WITH weekly AS (
  SELECT user_id, SUM(delta) AS wx, COUNT(*) AS events
  FROM public.xp_events
  WHERE created_at >= public.league_week_start() AND delta > 0
  GROUP BY user_id HAVING SUM(delta) > 0
)
SELECT
  CASE WHEN p.is_guest THEN 'guest' ELSE 'member' END AS kind,
  count(*) AS participants,
  count(*) FILTER (WHERE w.wx > 3) AS learning,
  count(*) FILTER (WHERE w.events = 1) AS single_event,
  count(*) FILTER (WHERE p.toss_anonymous_key IS NOT NULL) AS toss_linked,
  min(p.created_at)::date AS oldest_profile,
  max(p.created_at)::date AS newest_profile
FROM weekly w JOIN public.profiles p ON p.id = w.user_id
GROUP BY 1
ORDER BY 1;
