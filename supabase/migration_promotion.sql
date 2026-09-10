-- ============================================================
-- 머니터미 프로모션 리워드 (grantPromotionReward 연동)
-- 운영 DB에 증분 실행. schema.sql 재실행 금지.
-- Supabase 대시보드 → SQL Editor → 붙여넣기 → Run
--
-- 미션: 첫 학습 카드 완료(activation_first_card, 유저 생애 1회만 발생).
-- Toss grantPromotionReward 자체가 동일 유저 재지급을 막지만(에러 4113),
-- 우리 쪽 points는 별도로 관리하므로 여기서도 유저당 1회만 크레딧한다.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.promotion_rewards (
  profile_id UUID PRIMARY KEY REFERENCES public.profiles(id),
  amount     INTEGER NOT NULL CHECK (amount >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.promotion_rewards ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.promotion_rewards FROM anon, authenticated;

-- ponytail: 1회성 보너스라 상한 100P. referral/ad보다 크게 잡음(일일 반복이 아니므로).
CREATE OR REPLACE FUNCTION public.claim_promotion_reward(
  p_reward_amount INTEGER
)
RETURNS JSON LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_uid      UUID;
  v_credited INTEGER;
  v_points   INTEGER;
BEGIN
  v_uid := public.current_profile_id();
  IF v_uid IS NULL THEN RAISE EXCEPTION 'profile not found'; END IF;

  IF EXISTS (SELECT 1 FROM public.promotion_rewards WHERE profile_id = v_uid) THEN
    SELECT points INTO v_points FROM public.profiles WHERE id = v_uid;
    RETURN json_build_object('points', v_points, 'credited', 0);
  END IF;

  v_credited := LEAST(GREATEST(p_reward_amount, 0), 100);

  INSERT INTO public.promotion_rewards (profile_id, amount) VALUES (v_uid, v_credited);

  UPDATE public.profiles SET points = points + v_credited
    WHERE id = v_uid
    RETURNING points INTO v_points;

  RETURN json_build_object('points', v_points, 'credited', v_credited);
END;
$$;

GRANT EXECUTE ON FUNCTION public.claim_promotion_reward(INTEGER) TO anon, authenticated;
