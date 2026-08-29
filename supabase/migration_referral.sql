-- ============================================================
-- 머니터미 공유 리워드 (contactsViral 연동)
-- 운영 DB에 증분 실행. schema.sql 재실행 금지.
-- Supabase 대시보드 → SQL Editor → 붙여넣기 → Run
--
-- 배경: 앱인토스 SDK의 contactsViral()이 보내는 sendViral 이벤트에는
-- 중복 지급 방지용 고유 키가 없다. 콘솔의 "공유 리워드" 모듈이 얼마나
-- 엄격히 중복을 막는지 서버에서 검증할 방법이 없으므로, 클라이언트가
-- 보고하는 금액을 그대로 믿지 않고 1회당 상한 + 일일 상한으로 방어한다.
-- ============================================================

-- ──────────────────────────────────────────
-- 1. 지급 이력 (일일 상한 계산 + 감사 로그)
-- ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.referral_rewards (
  id          BIGSERIAL PRIMARY KEY,
  profile_id  UUID NOT NULL REFERENCES public.profiles(id),
  amount      INTEGER NOT NULL CHECK (amount >= 0),
  reward_unit TEXT NOT NULL DEFAULT 'point',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS referral_rewards_profile_date_idx
  ON public.referral_rewards (profile_id, created_at);

ALTER TABLE public.referral_rewards ENABLE ROW LEVEL SECURITY;

-- ──────────────────────────────────────────
-- 2. 리워드 지급 RPC
--    ponytail: 1회당 최대 50P, 하루 합계 최대 200P로 클램프.
--    콘솔에서 리워드 단위를 다르게(하트/보석 등) 설정하면 이 상한을 다시 검토할 것.
-- ──────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.claim_referral_reward(
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
    FROM public.referral_rewards
    WHERE profile_id = v_uid AND created_at::date = CURRENT_DATE;

  v_credited := LEAST(GREATEST(p_reward_amount, 0), 50, GREATEST(200 - v_today_total, 0));

  IF v_credited > 0 THEN
    INSERT INTO public.referral_rewards (profile_id, amount, reward_unit)
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

-- ──────────────────────────────────────────
-- 3. 권한 — 지급 이력 테이블은 RPC로만 기록, 클라 직접 접근 불가
-- ──────────────────────────────────────────
REVOKE ALL ON public.referral_rewards FROM anon, authenticated;

GRANT EXECUTE ON FUNCTION public.claim_referral_reward(INTEGER, TEXT) TO anon, authenticated;
