-- 리그 등급을 누적 XP 대신 주간 순위로 정한다.
-- 매주(월요일 0시 기준) 지난주 주간 XP 순위(전체 한 판, 개발 계정 제외)로
--   상위 3명: 한 단계 승급(최고 10단계)
--   참여자가 7명 이상인 주의 하위 3명: 한 단계 강등(최저 1단계)
-- 모든 사용자는 1단계(돈알못)부터 시작한다.
-- 정산은 앱이 settle_league()를 부를 때 지난주가 아직 정산 전이면 한 번만 한다(league_settlements로 중복 방지).
BEGIN;

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS league_stage smallint NOT NULL DEFAULT 1;
-- 10단계(텅장~돈방석). 5단계로 먼저 적용했어도 다시 실행하면 범위를 10으로 맞춘다
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_league_stage_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_league_stage_check CHECK (league_stage BETWEEN 1 AND 10);
UPDATE public.profiles SET league_stage = 1;
GRANT SELECT (league_stage) ON public.profiles TO anon, authenticated;

CREATE TABLE IF NOT EXISTS public.league_settlements (
  week_start timestamptz PRIMARY KEY,
  settled_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.league_settlements ENABLE ROW LEVEL SECURITY;

-- 새 규칙은 이번 주부터: 지난주는 정산한 것으로 둔다
INSERT INTO public.league_settlements (week_start)
VALUES ((public.league_week_start() - interval '7 days')::timestamptz)
ON CONFLICT DO NOTHING;

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

REVOKE EXECUTE ON FUNCTION public.settle_league() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.settle_league() TO anon, authenticated;

COMMIT;
