-- 주간·월간 미션 XP 보상. 진행도는 클라이언트를 믿지 않고 서버가 출석·XP 기록으로 다시 센다.
-- 미션과 보상(클라이언트 src/lib/periodMissions.ts와 같아야 한다):
--   w-attend  이번 주 5일 출석      +20 XP
--   w-xp      이번 주 100 XP 모으기  +20 XP
--   mo-attend 이번 달 20일 출석     +50 XP
-- 주는 월요일 0시(KST), 달은 1일 0시(KST)에 시작한다. 같은 기간에는 한 번만 받는다(기본키로 중복 차단).
-- XP는 add_xp로 넣어 다른 보상과 같은 경로(리그 주간 XP 포함)를 탄다.
BEGIN;

CREATE TABLE IF NOT EXISTS public.period_mission_rewards (
  user_id      uuid        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  mission_id   text        NOT NULL,
  period_start date        NOT NULL,
  xp           integer     NOT NULL,
  claimed_at   timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, mission_id, period_start)
);
ALTER TABLE public.period_mission_rewards ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS period_mission_rewards_read_own ON public.period_mission_rewards;
CREATE POLICY period_mission_rewards_read_own ON public.period_mission_rewards
  FOR SELECT TO anon, authenticated USING (user_id = public.current_profile_id());
-- 쓰기는 아래 함수만 한다
REVOKE ALL ON public.period_mission_rewards FROM anon, authenticated;
GRANT SELECT ON public.period_mission_rewards TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.claim_period_mission(p_mission_id text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_uid     uuid := public.current_profile_id();
  v_kst     timestamp := now() AT TIME ZONE 'Asia/Seoul';
  v_week    date := date_trunc('week', v_kst)::date;    -- ISO 주: 월요일
  v_month   date := date_trunc('month', v_kst)::date;
  v_start   date;
  v_target  integer;
  v_reward  integer;
  v_current integer;
  v_xp      integer;
BEGIN
  IF v_uid IS NULL THEN RAISE EXCEPTION 'profile not found'; END IF;

  CASE p_mission_id
    WHEN 'w-attend' THEN
      v_start := v_week; v_target := 5; v_reward := 20;
      SELECT count(*) INTO v_current FROM public.attendance WHERE user_id = v_uid AND date >= v_start;
    WHEN 'w-xp' THEN
      v_start := v_week; v_target := 100; v_reward := 20;
      SELECT coalesce(sum(delta), 0) INTO v_current FROM public.xp_events
      WHERE user_id = v_uid AND delta > 0 AND created_at >= (v_start::timestamp AT TIME ZONE 'Asia/Seoul');
    WHEN 'mo-attend' THEN
      v_start := v_month; v_target := 20; v_reward := 50;
      SELECT count(*) INTO v_current FROM public.attendance WHERE user_id = v_uid AND date >= v_start;
    ELSE
      RAISE EXCEPTION 'unknown mission %', p_mission_id;
  END CASE;

  IF v_current < v_target THEN RAISE EXCEPTION 'reward not eligible'; END IF;

  INSERT INTO public.period_mission_rewards (user_id, mission_id, period_start, xp)
  VALUES (v_uid, p_mission_id, v_start, v_reward)
  ON CONFLICT DO NOTHING;
  IF NOT FOUND THEN RAISE EXCEPTION 'already claimed'; END IF;

  PERFORM public.add_xp(v_uid, v_reward);
  SELECT xp INTO v_xp FROM public.profiles WHERE id = v_uid;
  RETURN json_build_object('xp', v_xp, 'reward', v_reward, 'period_start', v_start);
END;
$$;

REVOKE EXECUTE ON FUNCTION public.claim_period_mission(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.claim_period_mission(text) TO anon, authenticated;
NOTIFY pgrst, 'reload schema';

COMMIT;

-- 확인:
-- SELECT has_function_privilege('anon', 'public.claim_period_mission(text)', 'EXECUTE');  -- true
-- SELECT pg_get_functiondef('public.add_xp(uuid,integer)'::regprocedure);                  -- 함수가 있어야 한다
