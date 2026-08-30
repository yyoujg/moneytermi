-- ============================================================
-- 머니터미 리워드 광고 (Google AdMob, loadFullScreenAd/showFullScreenAd)
-- 운영 DB에 증분 실행. schema.sql 재실행 금지.
-- Supabase 대시보드 → SQL Editor → 붙여넣기 → Run
--
-- 배경: userEarnedReward 이벤트에도 migration_referral.sql과 동일하게
-- 중복/위조 방지용 고유 키가 없다. 클라이언트가 보고하는 금액을 그대로
-- 믿지 않고 1회당 상한 + 일일 상한으로 방어한다. 광고 시청은 반복이
-- 정상적인 사용 패턴이므로(친구초대와 달리) 별도 일일 상한을 둔다.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.ad_rewards (
  id          BIGSERIAL PRIMARY KEY,
  profile_id  UUID NOT NULL REFERENCES public.profiles(id),
  amount      INTEGER NOT NULL CHECK (amount >= 0),
  reward_unit TEXT NOT NULL DEFAULT 'point',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS ad_rewards_profile_date_idx
  ON public.ad_rewards (profile_id, created_at);

ALTER TABLE public.ad_rewards ENABLE ROW LEVEL SECURITY;

-- ponytail: 1회당 최대 50P, 하루 합계 최대 200P(광고 10회분 상당)로 클램프.
CREATE OR REPLACE FUNCTION public.claim_ad_reward(
  p_reward_amount INTEGER,
  p_reward_unit   TEXT DEFAULT 'point'
)
RETURNS JSON LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_uid          UUID;
  v_today_total  INTEGER;
  v_credited     INTEGER;
  v_points       INTEGER;
BEGIN
  v_uid := public.current_profile_id();
  IF v_uid IS NULL THEN RAISE EXCEPTION 'profile not found'; END IF;

  SELECT COALESCE(SUM(amount), 0) INTO v_today_total
    FROM public.ad_rewards
    WHERE profile_id = v_uid AND created_at::date = CURRENT_DATE;

  v_credited := LEAST(GREATEST(p_reward_amount, 0), 50, GREATEST(200 - v_today_total, 0));

  IF v_credited > 0 THEN
    INSERT INTO public.ad_rewards (profile_id, amount, reward_unit)
      VALUES (v_uid, v_credited, p_reward_unit);

    UPDATE public.profiles SET points = points + v_credited
      WHERE id = v_uid
      RETURNING points INTO v_points;
  ELSE
    SELECT points INTO v_points FROM public.profiles WHERE id = v_uid;
  END IF;

  RETURN json_build_object('points', v_points, 'credited', v_credited);
END;
$$;

REVOKE ALL ON public.ad_rewards FROM anon, authenticated;

GRANT EXECUTE ON FUNCTION public.claim_ad_reward(INTEGER, TEXT) TO anon, authenticated;
