-- 리그를 등급(league_stage)별로 나눈다. 같은 등급끼리만 순위·참가자 수를 세고, 주간 정산도 등급마다 따로 한다.
--   등급마다: 상위 3명 한 단계 승급(최고 10), 그 등급 참여자가 7명 이상이면 하위 3명 한 단계 강등(최저 1)
-- 등급은 정산(주 1회) 때만 바뀌므로 한 주 동안 같은 리그 구성원이 유지된다.
-- 운영 정의(2026-11-18 read-current-functions.sql)의 search_path 설정을 그대로 유지한다.
BEGIN;

CREATE OR REPLACE FUNCTION public.leaderboard_top(p_limit integer DEFAULT 50)
 RETURNS TABLE(rank bigint, nickname text, emoji text, points integer, is_me boolean)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public', 'extensions', 'pg_temp'
AS $function$
  WITH me AS (
    -- 나를 모르면(토큰 없음) 1단계 리그를 보여 준다
    SELECT COALESCE((SELECT league_stage FROM public.profiles WHERE id = public.current_profile_id()), 1) AS stage
  ), weekly AS (
    SELECT e.user_id, SUM(e.delta)::int AS wx
    FROM public.xp_events e
    WHERE e.created_at >= public.league_week_start() AND e.delta > 0
    GROUP BY e.user_id
  ), ranked AS (
    SELECT p.id, p.nickname, p.emoji, w.wx,
           RANK() OVER (ORDER BY w.wx DESC, p.created_at) AS rnk
    FROM weekly w JOIN public.profiles p ON p.id = w.user_id
    WHERE w.wx > 0 AND NOT p.exclude_from_league
      AND p.league_stage = (SELECT stage FROM me)
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
DECLARE v_uid UUID; v_rank BIGINT; v_total BIGINT; v_wx INTEGER; v_stage SMALLINT;
BEGIN
  v_uid := public.current_profile_id();
  SELECT COALESCE((SELECT league_stage FROM public.profiles WHERE id = v_uid), 1) INTO v_stage;

  SELECT count(*) INTO v_total FROM (
    SELECT e.user_id FROM public.xp_events e
    JOIN public.profiles p ON p.id = e.user_id AND NOT p.exclude_from_league AND p.league_stage = v_stage
    WHERE e.created_at >= public.league_week_start() AND e.delta > 0
    GROUP BY e.user_id HAVING SUM(e.delta) > 0
  ) t;

  IF v_uid IS NULL THEN
    RETURN json_build_object('rank', NULL, 'total', v_total, 'points', 0, 'week_start', public.league_week_start());
  END IF;

  SELECT COALESCE(SUM(delta), 0)::int INTO v_wx FROM public.xp_events
    WHERE user_id = v_uid AND created_at >= public.league_week_start() AND delta > 0;

  -- leaderboard_top과 같은 동점 처리(가입이 빠른 쪽이 위)
  SELECT rnk INTO v_rank FROM (
    SELECT e.user_id, RANK() OVER (ORDER BY SUM(e.delta) DESC, p.created_at) AS rnk
    FROM public.xp_events e
    JOIN public.profiles p ON p.id = e.user_id AND NOT p.exclude_from_league AND p.league_stage = v_stage
    WHERE e.created_at >= public.league_week_start() AND e.delta > 0
    GROUP BY e.user_id, p.created_at
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
BEGIN
  -- ponytail: 지난주 한 주만 정산한다. 앱을 아무도 안 연 주가 끼면 그 주는 건너뛴다
  INSERT INTO public.league_settlements (week_start) VALUES (v_start) ON CONFLICT DO NOTHING;
  IF NOT FOUND THEN RETURN; END IF;

  -- 승급·강등 전에 등급별 순위와 인원을 한 번에 고정한다(승급자가 윗 등급 순위에 섞이지 않게)
  CREATE TEMP TABLE _league_ranked ON COMMIT DROP AS
  SELECT id, rnk, count(*) OVER (PARTITION BY league_stage) AS total
  FROM (
    SELECT p.id, p.league_stage,
           ROW_NUMBER() OVER (PARTITION BY p.league_stage ORDER BY SUM(e.delta) DESC, p.created_at) AS rnk
    FROM public.xp_events e
    JOIN public.profiles p ON p.id = e.user_id AND NOT p.exclude_from_league
    WHERE e.created_at >= v_start AND e.created_at < v_end AND e.delta > 0
    GROUP BY p.id, p.league_stage, p.created_at
    HAVING SUM(e.delta) > 0
  ) t;

  UPDATE public.profiles p SET league_stage = LEAST(p.league_stage + 1, 10)
  FROM _league_ranked r WHERE r.id = p.id AND r.rnk <= 3;

  UPDATE public.profiles p SET league_stage = GREATEST(p.league_stage - 1, 1)
  FROM _league_ranked r WHERE r.id = p.id AND r.total >= 7 AND r.rnk > r.total - 3;
END;
$function$;

REVOKE EXECUTE ON FUNCTION public.settle_league() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.settle_league() TO anon, authenticated;

COMMIT;
