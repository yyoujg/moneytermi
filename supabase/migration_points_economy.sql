-- 포인트 경제 (2026-09-25)
--   레슨 시작에 10P가 든다. 포인트는 학습(퀴즈 정답·미션·XP 마일스톤)과 광고로 얻는다.
--   XP는 소모하지 않는다 — 누적 XP가 50을 넘을 때마다 50P를 자동 지급한다(티어·리그에 영향 없음).
-- 선행: migration_xp.sql STEP 4~8, migration_revoke_helpers.sql
-- 적용: STEP별로 실행. 트랜잭션으로 묶지 않는다.

-- ===== STEP 1 : 시작 잔고 100P (신규 기본값 + 기존 유저 1회 지급) =====
-- 두 번째 줄은 한 번만 실행할 것. 다시 실행하면 100P가 또 들어간다.
ALTER TABLE public.profiles ALTER COLUMN points SET DEFAULT 100;
UPDATE public.profiles SET points = points + 100;

-- ===== STEP 2 : 포인트 소모 RPC =====
CREATE OR REPLACE FUNCTION public.spend_points(p_amount INTEGER, p_reason TEXT DEFAULT 'lesson')
RETURNS JSON LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE v_uid UUID; v_points INTEGER;
BEGIN
  v_uid := public.current_profile_id();
  IF v_uid IS NULL THEN RAISE EXCEPTION 'profile not found'; END IF;
  IF p_amount IS NULL OR p_amount <= 0 OR p_amount > 1000 THEN RAISE EXCEPTION 'invalid amount'; END IF;

  UPDATE public.profiles SET points = points - p_amount
    WHERE id = v_uid AND points >= p_amount
    RETURNING points INTO v_points;
  IF NOT FOUND THEN RAISE EXCEPTION 'insufficient points'; END IF;

  RETURN json_build_object('points', v_points, 'reason', p_reason);
END;
$$;
GRANT EXECUTE ON FUNCTION public.spend_points(INTEGER, TEXT) TO anon, authenticated;

-- ===== STEP 3 : XP 마일스톤 → 포인트 (add_xp 교체) =====
-- 부스트 배수 적용 후의 누적 XP가 50 단위를 넘을 때마다 50P. 여러 단위를 한 번에 넘으면 그만큼 지급.
CREATE OR REPLACE FUNCTION public.add_xp(p_uid UUID, p_amount INTEGER) RETURNS INTEGER
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE v_mult INTEGER := 1; v_old INTEGER; v_new INTEGER; v_bonus INTEGER;
BEGIN
  SELECT CASE WHEN boost_until > now() THEN 2 ELSE 1 END, xp INTO v_mult, v_old
    FROM public.profiles WHERE id = p_uid;
  v_new := COALESCE(v_old, 0) + p_amount * COALESCE(v_mult, 1);
  v_bonus := (v_new / 50 - COALESCE(v_old, 0) / 50) * 50;
  UPDATE public.profiles SET xp = v_new, points = points + v_bonus WHERE id = p_uid;
  RETURN v_new;
END;
$$;
REVOKE EXECUTE ON FUNCTION public.add_xp(UUID, INTEGER) FROM PUBLIC, anon, authenticated;

NOTIFY pgrst, 'reload schema';

-- 확인:
-- SELECT has_function_privilege('anon', 'public.spend_points(integer, text)', 'EXECUTE');  -- true
-- SELECT column_default FROM information_schema.columns WHERE table_name='profiles' AND column_name='points';  -- 100
