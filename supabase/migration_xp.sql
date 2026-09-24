-- 리그 점수를 XP로 분리 (젬 폐기)
--
-- 역할 정리
--   XP   : 리그 주간 순위 + 티어. 학습 행동으로만 쌓이고 소모되지 않는다.
--   포인트: 소모 재화. 부스트 구매·광고 충전. 순위와 무관하므로 써도 손해가 없다.
--   젬   : 폐기. 포인트와 역할이 같아 둘로 나눌 이유가 없었다.
--
-- XP 획득: 새 단어 1XP · 퀴즈 정답 2XP · 출석 3XP · 미션 보상 수령 5XP
--          광고/초대/프로모션 보상은 XP를 주지 않는다(돈으로 순위를 사는 길을 막는다).
--
-- 선행: migration_missions_slots.sql, migration_weekly_league.sql
-- 적용: 대시보드 SQL Editor에서 STEP별로 나눠 실행. 실패 지점이 보이도록 트랜잭션으로 묶지 않는다.
-- 2026-09-24 점검: STEP 4~8이 빠진 채 운영됐다(증상: XP가 0 고정, 리그 비어 있음). STEP 4~8 재실행 후 migration_revoke_helpers.sql.

-- ===== STEP 1 : 컬럼 =====
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS xp          INTEGER     NOT NULL DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS boost_until TIMESTAMPTZ;
-- 확인: SELECT xp, boost_until FROM public.profiles LIMIT 1;

-- ===== STEP 2 : 읽기 권한 (profiles는 컬럼 단위로 GRANT돼 있다) =====
GRANT SELECT (xp) ON public.profiles TO anon;
GRANT SELECT (xp) ON public.profiles TO authenticated;
GRANT SELECT (boost_until) ON public.profiles TO anon;
GRANT SELECT (boost_until) ON public.profiles TO authenticated;

-- ===== STEP 3 : XP 이력 (주간 리그 집계용) =====
CREATE TABLE IF NOT EXISTS public.xp_events (
  id         BIGSERIAL   PRIMARY KEY,
  user_id    UUID        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  delta      INTEGER     NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS xp_events_user_time ON public.xp_events (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS xp_events_time      ON public.xp_events (created_at DESC);
ALTER TABLE public.xp_events ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.xp_events FROM anon, authenticated;

CREATE OR REPLACE FUNCTION public.log_xp_change() RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF NEW.xp IS DISTINCT FROM OLD.xp THEN
    INSERT INTO public.xp_events (user_id, delta) VALUES (NEW.id, NEW.xp - OLD.xp);
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_log_xp_change ON public.profiles;
CREATE TRIGGER trg_log_xp_change
  AFTER UPDATE OF xp ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.log_xp_change();

-- ===== STEP 4 : XP 지급 헬퍼 (부스트 중이면 2배) =====
CREATE OR REPLACE FUNCTION public.add_xp(p_uid UUID, p_amount INTEGER) RETURNS INTEGER
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE v_mult INTEGER := 1; v_xp INTEGER;
BEGIN
  SELECT CASE WHEN boost_until > now() THEN 2 ELSE 1 END INTO v_mult
    FROM public.profiles WHERE id = p_uid;
  UPDATE public.profiles SET xp = xp + p_amount * COALESCE(v_mult, 1)
    WHERE id = p_uid RETURNING xp INTO v_xp;
  RETURN v_xp;
END;
$$;

-- ===== STEP 5 : 퀴즈 정답 2XP =====
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
  v_xp      INTEGER;
  v_m3      INTEGER := 0;
BEGIN
  v_uid := public.current_profile_id();
  IF v_uid IS NULL THEN RAISE EXCEPTION 'profile not found'; END IF;

  SELECT word INTO v_word FROM public.words WHERE id = p_word_id;
  IF v_word IS NULL THEN RAISE EXCEPTION 'word not found'; END IF;

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

    UPDATE public.profiles
      SET points = points + v_earned, quiz_combo = v_combo
      WHERE id = v_uid;

    v_xp := public.add_xp(v_uid, 2);
    v_m3 := COALESCE(public.bump_mission(v_uid, 'm3'), 0);
    PERFORM public.bump_mission(v_uid, 'm4');
  ELSE
    v_combo := 0;
    UPDATE public.profiles SET quiz_combo = 0 WHERE id = v_uid;
    SELECT COALESCE(current, 0) INTO v_m3 FROM public.daily_missions
      WHERE user_id = v_uid AND mission_id = 'm3'
        AND date = public.mission_date() AND slot = public.mission_slot();
  END IF;

  SELECT points, xp INTO v_points, v_xp FROM public.profiles WHERE id = v_uid;

  RETURN json_build_object(
    'correct', v_correct, 'earned', v_earned, 'combo', v_combo,
    'points', v_points, 'xp', v_xp, 'm3_current', COALESCE(v_m3, 0)
  );
END;
$$;

-- ===== STEP 6 : 출석 3XP =====
CREATE OR REPLACE FUNCTION public.checkin(p_date DATE DEFAULT NULL)
RETURNS JSON LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE v_uid UUID; v_new BOOLEAN := false;
BEGIN
  v_uid := public.current_profile_id();
  IF v_uid IS NULL THEN RAISE EXCEPTION 'profile not found'; END IF;

  INSERT INTO public.attendance (user_id, date)
    VALUES (v_uid, public.mission_date())
    ON CONFLICT (user_id, date) DO NOTHING;
  v_new := FOUND;

  PERFORM public.bump_mission(v_uid, 'm1');
  IF v_new THEN PERFORM public.add_xp(v_uid, 3); END IF;  -- 하루 한 번만

  RETURN json_build_object('ok', true);
END;
$$;

-- ===== STEP 7 : 미션 보상 수령 5XP =====
CREATE OR REPLACE FUNCTION public.claim_mission_reward(
  p_mission_id TEXT,
  p_date       DATE DEFAULT NULL
)
RETURNS JSON LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_uid    UUID;
  v_target INTEGER;
  v_reward INTEGER;
  v_points INTEGER;
  v_date   DATE     := public.mission_date();
  v_slot   SMALLINT := public.mission_slot();
BEGIN
  v_uid := public.current_profile_id();
  IF v_uid IS NULL THEN RAISE EXCEPTION 'profile not found'; END IF;

  SELECT target, reward INTO v_target, v_reward
    FROM public.mission_defs WHERE mission_id = p_mission_id AND active;
  IF v_reward IS NULL THEN RAISE EXCEPTION 'unknown mission %', p_mission_id; END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.daily_missions
    WHERE user_id = v_uid AND mission_id = p_mission_id
      AND date = v_date AND slot = v_slot
      AND current >= v_target AND is_rewarded = false
  ) THEN
    RAISE EXCEPTION 'reward not eligible';
  END IF;

  UPDATE public.daily_missions SET is_rewarded = true
    WHERE user_id = v_uid AND mission_id = p_mission_id AND date = v_date AND slot = v_slot;

  UPDATE public.profiles SET points = points + v_reward WHERE id = v_uid
    RETURNING points INTO v_points;

  PERFORM public.add_xp(v_uid, 5);

  RETURN json_build_object('points', v_points);
END;
$$;

-- ===== STEP 8 : 새 단어 1XP (word_progress INSERT 트리거에 얹는다) =====
CREATE OR REPLACE FUNCTION public.on_word_progress_insert() RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  PERFORM public.bump_mission(NEW.user_id, 'm2');
  PERFORM public.bump_mission(NEW.user_id, 'm5');
  PERFORM public.add_xp(NEW.user_id, 1);
  RETURN NEW;
END;
$$;

-- ===== STEP 9 : 부스트 — 300포인트로 30분간 XP 2배 =====
CREATE OR REPLACE FUNCTION public.buy_boost()
RETURNS JSON LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE v_uid UUID; v_points INTEGER; v_until TIMESTAMPTZ;
BEGIN
  v_uid := public.current_profile_id();
  IF v_uid IS NULL THEN RAISE EXCEPTION 'profile not found'; END IF;

  IF EXISTS (SELECT 1 FROM public.profiles WHERE id = v_uid AND boost_until > now()) THEN
    RAISE EXCEPTION 'boost already active';
  END IF;

  UPDATE public.profiles
    SET points = points - 300, boost_until = now() + interval '30 minutes'
    WHERE id = v_uid AND points >= 300
    RETURNING points, boost_until INTO v_points, v_until;

  IF NOT FOUND THEN RAISE EXCEPTION 'not enough points'; END IF;

  RETURN json_build_object('points', v_points, 'boost_until', v_until);
END;
$$;

-- ===== STEP 10 : 리그 랭킹을 XP 기준으로 =====
CREATE OR REPLACE FUNCTION public.leaderboard_top(p_limit INTEGER DEFAULT 50)
RETURNS TABLE (rank BIGINT, nickname TEXT, emoji TEXT, points INTEGER, is_me BOOLEAN)
LANGUAGE sql SECURITY DEFINER STABLE AS $$
  WITH weekly AS (
    SELECT e.user_id, SUM(e.delta)::int AS wx
    FROM public.xp_events e
    WHERE e.created_at >= public.league_week_start() AND e.delta > 0
    GROUP BY e.user_id
  ), ranked AS (
    SELECT p.id, p.nickname, p.emoji, w.wx,
           RANK() OVER (ORDER BY w.wx DESC, p.created_at) AS rnk
    FROM weekly w JOIN public.profiles p ON p.id = w.user_id
    WHERE w.wx > 0
  )
  SELECT r.rnk, r.nickname, r.emoji, r.wx,
         COALESCE(r.id = public.current_profile_id(), false)
  FROM ranked r ORDER BY r.rnk
  LIMIT LEAST(GREATEST(p_limit, 1), 100);
$$;

CREATE OR REPLACE FUNCTION public.my_league_rank()
RETURNS JSON LANGUAGE plpgsql SECURITY DEFINER STABLE AS $$
DECLARE v_uid UUID; v_rank BIGINT; v_total BIGINT; v_wx INTEGER;
BEGIN
  SELECT count(*) INTO v_total FROM (
    SELECT user_id FROM public.xp_events
    WHERE created_at >= public.league_week_start() AND delta > 0
    GROUP BY user_id HAVING SUM(delta) > 0
  ) t;

  v_uid := public.current_profile_id();
  IF v_uid IS NULL THEN
    RETURN json_build_object('rank', NULL, 'total', v_total, 'points', 0, 'week_start', public.league_week_start());
  END IF;

  SELECT COALESCE(SUM(delta), 0)::int INTO v_wx FROM public.xp_events
    WHERE user_id = v_uid AND created_at >= public.league_week_start() AND delta > 0;

  SELECT rnk INTO v_rank FROM (
    SELECT user_id, RANK() OVER (ORDER BY SUM(delta) DESC) AS rnk
    FROM public.xp_events
    WHERE created_at >= public.league_week_start() AND delta > 0
    GROUP BY user_id
  ) t WHERE t.user_id = v_uid;

  RETURN json_build_object('rank', v_rank, 'total', v_total, 'points', COALESCE(v_wx, 0),
                           'week_start', public.league_week_start());
END;
$$;

-- ===== STEP 11 : 실행 권한 + 스키마 캐시 갱신 =====
GRANT EXECUTE ON FUNCTION public.submit_quiz_answer(INTEGER, TEXT, TEXT, BOOLEAN, BOOLEAN) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.claim_mission_reward(TEXT, DATE) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.checkin(DATE)                    TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.buy_boost()                      TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.leaderboard_top(INTEGER)         TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.my_league_rank()                 TO anon, authenticated;
NOTIFY pgrst, 'reload schema';

-- 확인
--   SELECT xp, boost_until FROM public.profiles LIMIT 1;
--   SELECT * FROM public.leaderboard_top(10);
