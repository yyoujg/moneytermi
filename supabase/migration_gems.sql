-- 젬(재화) + 환전 + 부스트
--
-- 포인트는 리그 순위·티어를 결정하는 점수라 소모하면 순위가 내려간다.
-- 그래서 소모용 재화 '젬'을 따로 둔다.
--   획득: 퀴즈 정답 1개당 1젬 (누적 복습은 10문제라 자연히 더 많이 받는다)
--   환전: 10젬 -> 100P (10젬 단위)
--   부스트: 30젬으로 30분간 획득 포인트 2배
--
-- gems도 points처럼 클라이언트 직접 UPDATE를 막고 RPC로만 바꾼다.
-- 부스트로 늘어난 포인트는 point_events 트리거가 잡아 리그에도 반영된다.
--
-- 선행: migration_missions_slots.sql (submit_quiz_answer를 여기서 다시 덮어쓴다)
-- 적용: Supabase 대시보드 SQL Editor에서 실행.

BEGIN;

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS gems        INTEGER     NOT NULL DEFAULT 0 CHECK (gems >= 0);
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS boost_until TIMESTAMPTZ;

GRANT SELECT (gems, boost_until) ON public.profiles TO anon, authenticated;

-- ──────────────────────────────────────────
-- 1. 퀴즈 채점 — 정답이면 젬 +1, 부스트 중이면 포인트 2배
--    (migration_missions_slots.sql 버전에 젬/부스트만 얹었다)
-- ──────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.submit_quiz_answer(
  p_word_id       INTEGER,
  p_answer        TEXT,
  p_mode          TEXT,
  p_used_hint     BOOLEAN DEFAULT false,
  p_session_start BOOLEAN DEFAULT false
)
RETURNS JSON LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_uid     UUID;
  v_word    TEXT;
  v_combo   INTEGER;
  v_correct BOOLEAN;
  v_earned  INTEGER := 0;
  v_points  INTEGER;
  v_gems    INTEGER;
  v_m3      INTEGER := 0;
  v_boost   BOOLEAN := false;
BEGIN
  v_uid := public.current_profile_id();
  IF v_uid IS NULL THEN RAISE EXCEPTION 'profile not found'; END IF;

  SELECT word INTO v_word FROM public.words WHERE id = p_word_id;
  IF v_word IS NULL THEN RAISE EXCEPTION 'word not found'; END IF;

  SELECT COALESCE(boost_until > now(), false) INTO v_boost FROM public.profiles WHERE id = v_uid;

  IF p_session_start THEN
    v_combo := 0;
  ELSE
    SELECT quiz_combo INTO v_combo FROM public.profiles WHERE id = v_uid;
  END IF;

  IF p_mode = 'typed' THEN
    v_correct := public.answer_matches(p_answer, v_word);
  ELSE
    v_correct := p_answer = v_word;
  END IF;

  IF v_correct THEN
    v_combo := v_combo + 1;
    IF p_mode = 'typed' THEN
      v_earned := (CASE WHEN p_used_hint THEN 5 ELSE 10 END)
                + (CASE WHEN (v_combo - 1) >= 2 THEN (v_combo - 1) * 2 ELSE 0 END);
    ELSE
      v_earned := CASE WHEN v_combo >= 5 THEN 20
                       WHEN v_combo >= 3 THEN 15
                       ELSE 10 END;
    END IF;

    IF v_boost THEN v_earned := v_earned * 2; END IF;

    UPDATE public.profiles
      SET points = points + v_earned, quiz_combo = v_combo, gems = gems + 1
      WHERE id = v_uid;

    v_m3 := COALESCE(public.bump_mission(v_uid, 'm3'), 0);
    PERFORM public.bump_mission(v_uid, 'm4');
  ELSE
    v_combo := 0;
    UPDATE public.profiles SET quiz_combo = 0 WHERE id = v_uid;
    SELECT COALESCE(current, 0) INTO v_m3 FROM public.daily_missions
      WHERE user_id = v_uid AND mission_id = 'm3'
        AND date = public.mission_date() AND slot = public.mission_slot();
  END IF;

  SELECT points, gems INTO v_points, v_gems FROM public.profiles WHERE id = v_uid;

  RETURN json_build_object(
    'correct',    v_correct,
    'earned',     v_earned,
    'combo',      v_combo,
    'points',     v_points,
    'gems',       v_gems,
    'boost',      v_boost,
    'm3_current', COALESCE(v_m3, 0)
  );
END;
$$;

-- ──────────────────────────────────────────
-- 2. 환전 — 10젬 단위로 젬당 10P
-- ──────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.exchange_gems(p_gems INTEGER)
RETURNS JSON LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_uid    UUID;
  v_gems   INTEGER;
  v_points INTEGER;
BEGIN
  v_uid := public.current_profile_id();
  IF v_uid IS NULL THEN RAISE EXCEPTION 'profile not found'; END IF;
  IF p_gems IS NULL OR p_gems < 10 OR p_gems % 10 <> 0 THEN
    RAISE EXCEPTION 'gems must be a positive multiple of 10';
  END IF;

  UPDATE public.profiles
    SET gems = gems - p_gems, points = points + p_gems * 10
    WHERE id = v_uid AND gems >= p_gems
    RETURNING gems, points INTO v_gems, v_points;

  IF NOT FOUND THEN RAISE EXCEPTION 'not enough gems'; END IF;

  RETURN json_build_object('gems', v_gems, 'points', v_points);
END;
$$;

-- ──────────────────────────────────────────
-- 3. 부스트 — 30젬, 30분, 2배. 이미 켜져 있으면 거절(중복 구매 방지)
-- ──────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.buy_boost()
RETURNS JSON LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_uid   UUID;
  v_gems  INTEGER;
  v_until TIMESTAMPTZ;
BEGIN
  v_uid := public.current_profile_id();
  IF v_uid IS NULL THEN RAISE EXCEPTION 'profile not found'; END IF;

  IF EXISTS (SELECT 1 FROM public.profiles WHERE id = v_uid AND boost_until > now()) THEN
    RAISE EXCEPTION 'boost already active';
  END IF;

  UPDATE public.profiles
    SET gems = gems - 30, boost_until = now() + interval '30 minutes'
    WHERE id = v_uid AND gems >= 30
    RETURNING gems, boost_until INTO v_gems, v_until;

  IF NOT FOUND THEN RAISE EXCEPTION 'not enough gems'; END IF;

  RETURN json_build_object('gems', v_gems, 'boost_until', v_until);
END;
$$;

GRANT EXECUTE ON FUNCTION public.submit_quiz_answer(INTEGER, TEXT, TEXT, BOOLEAN, BOOLEAN) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.exchange_gems(INTEGER) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.buy_boost()            TO anon, authenticated;

COMMIT;

-- 확인
--   SELECT gems, boost_until FROM public.profiles WHERE id = '<프로필 UUID>';
--   SELECT public.exchange_gems(10);   -- 젬 10 차감, 100P 적립
--   SELECT public.buy_boost();         -- 젬 30 차감, 30분 2배
