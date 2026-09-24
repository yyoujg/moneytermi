-- 리그 주간 초기화 (KST 월요일 00:00 기준)
--
-- 문제: 랭킹이 profiles.points(누적)를 쓰고 있어 매주 초기화할 수가 없다.
-- 해법: 포인트 증감 이력 테이블 + profiles.points UPDATE 트리거 하나로 적립을 기록하고,
--       랭킹은 "이번 주에 쌓은 포인트" 합계로 계산한다.
--       보상 RPC 5개(퀴즈/미션/초대/광고/프로모션)를 각각 고치지 않아도 된다.
--
-- 이력은 지금부터 쌓이므로 이번 주 랭킹은 모두 0에서 시작한다.
-- 티어(브론즈~다이아)는 누적 포인트 기준 그대로 둔다 — 초기화되지 않는다.
--
-- 적용: Supabase 대시보드 SQL Editor에서 실행.

BEGIN;

CREATE TABLE IF NOT EXISTS public.point_events (
  id         BIGSERIAL   PRIMARY KEY,
  user_id    UUID        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  delta      INTEGER     NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS point_events_user_time ON public.point_events (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS point_events_time      ON public.point_events (created_at DESC);

ALTER TABLE public.point_events ENABLE ROW LEVEL SECURITY;
-- 클라이언트는 직접 읽고 쓸 일이 없다. 랭킹 RPC(SECURITY DEFINER)만 접근한다.
REVOKE ALL ON public.point_events FROM anon, authenticated;

-- 포인트가 바뀔 때마다 증감을 남긴다. 적립 경로가 늘어도 자동으로 잡힌다.
CREATE OR REPLACE FUNCTION public.log_point_change() RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF NEW.points IS DISTINCT FROM OLD.points THEN
    INSERT INTO public.point_events (user_id, delta) VALUES (NEW.id, NEW.points - OLD.points);
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_log_point_change ON public.profiles;
CREATE TRIGGER trg_log_point_change
  AFTER UPDATE OF points ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.log_point_change();

-- 이번 주 시작 시각 (KST 월요일 00:00). Postgres의 week는 월요일 시작이다.
CREATE OR REPLACE FUNCTION public.league_week_start() RETURNS TIMESTAMPTZ
LANGUAGE sql STABLE AS $$
  SELECT date_trunc('week', public.kst_now()) AT TIME ZONE 'Asia/Seoul'
$$;
GRANT EXECUTE ON FUNCTION public.league_week_start() TO anon, authenticated;

-- 주간 랭킹
CREATE OR REPLACE FUNCTION public.leaderboard_top(p_limit INTEGER DEFAULT 50)
RETURNS TABLE (rank BIGINT, nickname TEXT, emoji TEXT, points INTEGER, is_me BOOLEAN)
LANGUAGE sql SECURITY DEFINER STABLE AS $$
  WITH weekly AS (
    SELECT e.user_id, SUM(e.delta)::int AS wp
    FROM public.point_events e
    WHERE e.created_at >= public.league_week_start() AND e.delta > 0
    GROUP BY e.user_id
  ), ranked AS (
    SELECT p.id, p.nickname, p.emoji, w.wp,
           RANK() OVER (ORDER BY w.wp DESC, p.created_at) AS rnk
    FROM weekly w JOIN public.profiles p ON p.id = w.user_id
    WHERE w.wp > 0
  )
  SELECT r.rnk, r.nickname, r.emoji, r.wp,
         COALESCE(r.id = public.current_profile_id(), false)
  FROM ranked r ORDER BY r.rnk
  LIMIT LEAST(GREATEST(p_limit, 1), 100);
$$;

CREATE OR REPLACE FUNCTION public.my_league_rank()
RETURNS JSON LANGUAGE plpgsql SECURITY DEFINER STABLE AS $$
DECLARE
  v_uid   UUID;
  v_rank  BIGINT;
  v_total BIGINT;
  v_wp    INTEGER;
BEGIN
  SELECT count(*) INTO v_total FROM (
    SELECT user_id FROM public.point_events
    WHERE created_at >= public.league_week_start() AND delta > 0
    GROUP BY user_id HAVING SUM(delta) > 0
  ) t;

  v_uid := public.current_profile_id();
  IF v_uid IS NULL THEN
    RETURN json_build_object('rank', NULL, 'total', v_total, 'points', 0, 'week_start', public.league_week_start());
  END IF;

  SELECT COALESCE(SUM(delta), 0)::int INTO v_wp FROM public.point_events
    WHERE user_id = v_uid AND created_at >= public.league_week_start() AND delta > 0;

  SELECT rnk INTO v_rank FROM (
    SELECT user_id, RANK() OVER (ORDER BY SUM(delta) DESC) AS rnk
    FROM public.point_events
    WHERE created_at >= public.league_week_start() AND delta > 0
    GROUP BY user_id
  ) t WHERE t.user_id = v_uid;

  RETURN json_build_object('rank', v_rank, 'total', v_total, 'points', COALESCE(v_wp, 0),
                           'week_start', public.league_week_start());
END;
$$;

GRANT EXECUTE ON FUNCTION public.leaderboard_top(INTEGER) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.my_league_rank()          TO anon, authenticated;

COMMIT;

-- 확인
--   SELECT public.league_week_start();
--   SELECT * FROM public.leaderboard_top(10);
--   SELECT public.my_league_rank();
