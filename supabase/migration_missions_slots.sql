-- 오늘의 미션 확장 + 8시간 단위 리셋
--
-- 배경
--   - claim_mission_reward가 미션 ID/목표/보상을 CASE 문에 하드코딩하고 있어
--     미션을 추가하려면 매번 함수를 고쳐야 했다. mission_defs 테이블로 뺀다.
--   - daily_missions가 date 단위라 하루 1회만 리셋된다. slot(0/1/2)을 추가해
--     KST 기준 08시간마다(00/08/16시) 리셋한다.
--
-- 적용: Supabase 대시보드 SQL Editor에서 통째로 실행. 여러 번 실행해도 안전하다.

BEGIN;

-- ──────────────────────────────────────────
-- 1. 미션 정의 테이블
-- ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.mission_defs (
  mission_id TEXT    PRIMARY KEY,
  title      TEXT    NOT NULL,
  target     INTEGER NOT NULL CHECK (target > 0),
  reward     INTEGER NOT NULL CHECK (reward BETWEEN 0 AND 100),
  sort_order INTEGER NOT NULL DEFAULT 0,
  active     BOOLEAN NOT NULL DEFAULT true
);

INSERT INTO public.mission_defs (mission_id, title, target, reward, sort_order) VALUES
  ('m1', '앱 출석하기',         1,  10, 10),
  ('m2', '새 단어 5개 배우기',   5,  20, 20),
  ('m3', '퀴즈 정답 3회 맞히기', 3,  30, 30),
  ('m4', '퀴즈 정답 10회 맞히기',10, 50, 40),
  ('m5', '단어 카드 3개 보기',   3,  15, 50)
ON CONFLICT (mission_id) DO UPDATE
  SET title = EXCLUDED.title, target = EXCLUDED.target,
      reward = EXCLUDED.reward, sort_order = EXCLUDED.sort_order, active = true;

ALTER TABLE public.mission_defs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS mission_defs_read ON public.mission_defs;
CREATE POLICY mission_defs_read ON public.mission_defs FOR SELECT USING (true);
GRANT SELECT ON public.mission_defs TO anon, authenticated;

-- ──────────────────────────────────────────
-- 2. daily_missions에 slot 추가
--    기존 행은 slot 0으로 남는다(과거 기록이므로 그대로 둔다).
-- ──────────────────────────────────────────
ALTER TABLE public.daily_missions ADD COLUMN IF NOT EXISTS slot SMALLINT NOT NULL DEFAULT 0;
ALTER TABLE public.daily_missions DROP CONSTRAINT IF EXISTS daily_missions_mission_id_check;
ALTER TABLE public.daily_missions DROP CONSTRAINT IF EXISTS daily_missions_user_id_mission_id_date_key;
CREATE UNIQUE INDEX IF NOT EXISTS daily_missions_uniq
  ON public.daily_missions (user_id, mission_id, date, slot);

-- ──────────────────────────────────────────
-- 3. 현재 슬롯/날짜 (KST 기준). 클라이언트 시계를 믿지 않는다.
-- ──────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.kst_now() RETURNS TIMESTAMP
  LANGUAGE sql STABLE AS $$ SELECT (now() AT TIME ZONE 'Asia/Seoul') $$;

CREATE OR REPLACE FUNCTION public.mission_date() RETURNS DATE
  LANGUAGE sql STABLE AS $$ SELECT public.kst_now()::date $$;

CREATE OR REPLACE FUNCTION public.mission_slot() RETURNS SMALLINT
  LANGUAGE sql STABLE AS $$ SELECT (EXTRACT(HOUR FROM public.kst_now())::int / 8)::smallint $$;

GRANT EXECUTE ON FUNCTION public.kst_now()      TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.mission_date() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.mission_slot() TO anon, authenticated;

-- 진행도 1 증가 헬퍼 (목표치에서 멈춘다)
CREATE OR REPLACE FUNCTION public.bump_mission(p_uid UUID, p_mission_id TEXT, p_by INTEGER DEFAULT 1)
RETURNS INTEGER LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE v_target INTEGER; v_cur INTEGER;
BEGIN
  SELECT target INTO v_target FROM public.mission_defs WHERE mission_id = p_mission_id AND active;
  IF v_target IS NULL THEN RETURN NULL; END IF;

  INSERT INTO public.daily_missions (user_id, mission_id, date, slot, current)
    VALUES (p_uid, p_mission_id, public.mission_date(), public.mission_slot(), LEAST(p_by, v_target))
    ON CONFLICT (user_id, mission_id, date, slot)
    DO UPDATE SET current = LEAST(public.daily_missions.current + p_by, v_target)
    RETURNING current INTO v_cur;

  RETURN v_cur;
END;
$$;

-- ──────────────────────────────────────────
-- 4. claim_mission_reward — 정의 테이블 + 현재 슬롯 기준
--    p_date는 구버전 클라이언트 호환을 위해 남겨두되 무시한다(서버 시간을 쓴다).
-- ──────────────────────────────────────────
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

  RETURN json_build_object('points', v_points);
END;
$$;

GRANT EXECUTE ON FUNCTION public.claim_mission_reward(TEXT, DATE) TO anon, authenticated;

-- ──────────────────────────────────────────
-- 5. 단어를 처음 배울 때 m2/m5 진행도 증가
--    word_progress INSERT가 "새 단어를 배웠다"와 같다(이후는 UPDATE).
-- ──────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.on_word_progress_insert() RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  PERFORM public.bump_mission(NEW.user_id, 'm2');
  PERFORM public.bump_mission(NEW.user_id, 'm5');
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_word_progress_mission ON public.word_progress;
CREATE TRIGGER trg_word_progress_mission
  AFTER INSERT ON public.word_progress
  FOR EACH ROW EXECUTE FUNCTION public.on_word_progress_insert();

-- ──────────────────────────────────────────
-- 6. checkin — m1을 현재 슬롯에 기록
--    출석 자체(attendance)는 하루 1행 그대로. 미션 진행도만 슬롯을 탄다.
-- ──────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.checkin(
  p_date DATE DEFAULT NULL
)
RETURNS JSON LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_uid UUID;
BEGIN
  v_uid := public.current_profile_id();
  IF v_uid IS NULL THEN RAISE EXCEPTION 'profile not found'; END IF;

  INSERT INTO public.attendance (user_id, date)
    VALUES (v_uid, public.mission_date())
    ON CONFLICT (user_id, date) DO NOTHING;

  PERFORM public.bump_mission(v_uid, 'm1');

  RETURN json_build_object('ok', true);
END;
$$;

GRANT EXECUTE ON FUNCTION public.checkin(DATE) TO anon, authenticated;

-- ──────────────────────────────────────────
-- 7. submit_quiz_answer — m3/m4를 현재 슬롯에 기록
--    채점·포인트 계산 로직은 건드리지 않고 미션 갱신부만 bump_mission으로 바꾼다.
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

    v_m3 := COALESCE(public.bump_mission(v_uid, 'm3'), 0);
    PERFORM public.bump_mission(v_uid, 'm4');
  ELSE
    v_combo := 0;
    UPDATE public.profiles SET quiz_combo = 0 WHERE id = v_uid;
    SELECT COALESCE(current, 0) INTO v_m3 FROM public.daily_missions
      WHERE user_id = v_uid AND mission_id = 'm3'
        AND date = public.mission_date() AND slot = public.mission_slot();
  END IF;

  SELECT points INTO v_points FROM public.profiles WHERE id = v_uid;

  RETURN json_build_object(
    'correct',    v_correct,
    'earned',     v_earned,
    'combo',      v_combo,
    'points',     v_points,
    'm3_current', COALESCE(v_m3, 0)
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.submit_quiz_answer(INTEGER, TEXT, TEXT, BOOLEAN, BOOLEAN) TO anon, authenticated;

COMMIT;

-- ──────────────────────────────────────────
-- 적용 후 확인
--   SELECT public.mission_date(), public.mission_slot();       -- 오늘/현재 슬롯(0~2)
--   SELECT * FROM public.mission_defs ORDER BY sort_order;     -- 미션 5종
--   SELECT mission_id, date, slot, current, is_rewarded
--     FROM public.daily_missions WHERE user_id = '<프로필 UUID>' ORDER BY date DESC, slot DESC;
-- ──────────────────────────────────────────
