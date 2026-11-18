-- league-per-stage 되돌리기: 전체 한 판 순위(league-exclude-dev)와 전체 정산(league-weekly-promotion)으로 돌아간다.
BEGIN;

CREATE OR REPLACE FUNCTION public.leaderboard_top(p_limit integer DEFAULT 50)
 RETURNS TABLE(rank bigint, nickname text, emoji text, points integer, is_me boolean)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public', 'extensions', 'pg_temp'
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
    WHERE w.wx > 0 AND NOT p.exclude_from_league
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
 SET search_path TO 'public', 'extensions', 'pg_temp'
AS $function$
DECLARE v_uid UUID; v_rank BIGINT; v_total BIGINT; v_wx INTEGER;
BEGIN
  SELECT count(*) INTO v_total FROM (
    SELECT e.user_id FROM public.xp_events e
    JOIN public.profiles p ON p.id = e.user_id AND NOT p.exclude_from_league
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
    JOIN public.profiles p ON p.id = e.user_id AND NOT p.exclude_from_league
    WHERE e.created_at >= public.league_week_start() AND e.delta > 0
    GROUP BY e.user_id
  ) t WHERE t.user_id = v_uid;

  RETURN json_build_object('rank', v_rank, 'total', v_total, 'points', COALESCE(v_wx, 0),
                           'week_start', public.league_week_start());
END;
$function$;

CREATE OR REPLACE FUNCTION public.settle_league()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
DECLARE
  v_end   timestamptz := public.league_week_start()::timestamptz;
  v_start timestamptz := v_end - interval '7 days';
  v_total integer;
BEGIN
  -- ponytail: 지난주 한 주만 정산한다. 앱을 아무도 안 연 주가 끼면 그 주는 건너뛴다
  INSERT INTO public.league_settlements (week_start) VALUES (v_start) ON CONFLICT DO NOTHING;
  IF NOT FOUND THEN RETURN; END IF;

  CREATE TEMP TABLE _league_ranked ON COMMIT DROP AS
  SELECT p.id, ROW_NUMBER() OVER (ORDER BY SUM(e.delta) DESC, p.created_at) AS rnk
  FROM public.xp_events e
  JOIN public.profiles p ON p.id = e.user_id AND NOT p.exclude_from_league
  WHERE e.created_at >= v_start AND e.created_at < v_end AND e.delta > 0
  GROUP BY p.id, p.created_at
  HAVING SUM(e.delta) > 0;

  SELECT count(*) INTO v_total FROM _league_ranked;

  UPDATE public.profiles p SET league_stage = LEAST(p.league_stage + 1, 10)
  FROM _league_ranked r WHERE r.id = p.id AND r.rnk <= 3;

  IF v_total >= 7 THEN
    UPDATE public.profiles p SET league_stage = GREATEST(p.league_stage - 1, 1)
    FROM _league_ranked r WHERE r.id = p.id AND r.rnk > v_total - 3;
  END IF;
END;
$function$;

COMMIT;
