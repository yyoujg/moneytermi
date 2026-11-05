-- apply.sql 되돌리기: 두 함수를 원래 정의로 돌리고 제외 열을 지운다.
BEGIN;

CREATE OR REPLACE FUNCTION public.leaderboard_top(p_limit integer DEFAULT 50)
 RETURNS TABLE(rank bigint, nickname text, emoji text, points integer, is_me boolean)
 LANGUAGE sql
 STABLE SECURITY DEFINER
AS $function$
  WITH weekly AS (
    SELECT e.user_id, SUM(e.delta)::int AS wx
    FROM public.xp_events e
    WHERE e.created_at >= public.league_week_start() AND e.delta > 0
    GROUP BY e.user_id
  ), ranked AS (
    SELECT p.id, p.nickname, p.emoji, w.wx,
           RANK() OVER (ORDER BY w.wx DESC, p.created_at) AS rnk
    FROM weekly w JOIN public.profiles p ON p.id = w.user_id
    WHERE w.wx > 0
  )
  SELECT r.rnk, r.nickname, r.emoji, r.wx,
         COALESCE(r.id = public.current_profile_id(), false)
  FROM ranked r ORDER BY r.rnk
  LIMIT LEAST(GREATEST(p_limit, 1), 100);
$function$;

CREATE OR REPLACE FUNCTION public.my_league_rank()
 RETURNS json
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
AS $function$
DECLARE v_uid UUID; v_rank BIGINT; v_total BIGINT; v_wx INTEGER;
BEGIN
  SELECT count(*) INTO v_total FROM (
    SELECT e.user_id FROM public.xp_events e
    WHERE e.created_at >= public.league_week_start() AND e.delta > 0
    GROUP BY e.user_id HAVING SUM(e.delta) > 0
  ) t;

  v_uid := public.current_profile_id();
  IF v_uid IS NULL THEN
    RETURN json_build_object('rank', NULL, 'total', v_total, 'points', 0, 'week_start', public.league_week_start());
  END IF;

  SELECT COALESCE(SUM(delta), 0)::int INTO v_wx FROM public.xp_events
    WHERE user_id = v_uid AND created_at >= public.league_week_start() AND delta > 0;

  SELECT rnk INTO v_rank FROM (
    SELECT e.user_id, RANK() OVER (ORDER BY SUM(e.delta) DESC) AS rnk
    FROM public.xp_events e
    WHERE e.created_at >= public.league_week_start() AND e.delta > 0
    GROUP BY e.user_id
  ) t WHERE t.user_id = v_uid;

  RETURN json_build_object('rank', v_rank, 'total', v_total, 'points', COALESCE(v_wx, 0),
                           'week_start', public.league_week_start());
END;
$function$;

ALTER TABLE public.profiles DROP COLUMN IF EXISTS exclude_from_league;

COMMIT;
