-- ============================================================
-- 머니터미 포인트 무결성 (서버 권위 채점)
-- 운영 DB에 증분 실행. schema.sql 재실행 금지.
-- Supabase 대시보드 → SQL Editor → 붙여넣기 → Run
-- ============================================================

-- ──────────────────────────────────────────
-- 1. 콤보 상태 컬럼
-- ──────────────────────────────────────────
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS quiz_combo INTEGER NOT NULL DEFAULT 0 CHECK (quiz_combo >= 0);

-- ──────────────────────────────────────────
-- 2. 호출자 프로필 해석 헬퍼 (RLS 정책과 동일 로직)
--    헤더 x-guest-token 또는 auth.uid() 로 프로필 id 반환
-- ──────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.current_profile_id()
RETURNS UUID LANGUAGE plpgsql STABLE SECURITY DEFINER AS $$
DECLARE
  v_id UUID;
BEGIN
  SELECT id INTO v_id FROM public.profiles
  WHERE auth_id = auth.uid()
     OR guest_token = (current_setting('request.headers', true)::json->>'x-guest-token')::uuid
  LIMIT 1;
  RETURN v_id;
END;
$$;

-- ──────────────────────────────────────────
-- 3. 퀴즈 답안 채점 RPC
--    정답 판정·콤보·포인트·m3 진행도를 서버가 소유
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
  v_uid       UUID;
  v_word      TEXT;
  v_combo     INTEGER;
  v_correct   BOOLEAN;
  v_earned    INTEGER := 0;
  v_points    INTEGER;
  v_m3        INTEGER := 0;
BEGIN
  v_uid := public.current_profile_id();
  IF v_uid IS NULL THEN RAISE EXCEPTION 'profile not found'; END IF;

  SELECT word INTO v_word FROM public.words WHERE id = p_word_id;
  IF v_word IS NULL THEN RAISE EXCEPTION 'word not found'; END IF;

  -- 세션 시작이면 콤보 리셋
  IF p_session_start THEN
    v_combo := 0;
  ELSE
    SELECT quiz_combo INTO v_combo FROM public.profiles WHERE id = v_uid;
  END IF;

  -- 정답 판정 (모드별)
  IF p_mode = 'typed' THEN
    v_correct := lower(regexp_replace(p_answer, '\s+', '', 'g'))
               = lower(regexp_replace(v_word,  '\s+', '', 'g'));
  ELSE  -- 'mc'
    v_correct := p_answer = v_word;
  END IF;

  IF v_correct THEN
    v_combo := v_combo + 1;

    -- earned 계산 (모드별 공식)
    -- typed(ReviewScreen)는 증가 전 콤보로 보너스 계산하던 원본 동작 유지 → (v_combo-1)
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

    -- m3 진행도 서버 증가
    INSERT INTO public.daily_missions (user_id, mission_id, date, current)
      VALUES (v_uid, 'm3', CURRENT_DATE, 1)
      ON CONFLICT (user_id, mission_id, date)
      DO UPDATE SET current = LEAST(public.daily_missions.current + 1, 3);

    SELECT current INTO v_m3 FROM public.daily_missions
      WHERE user_id = v_uid AND mission_id = 'm3' AND date = CURRENT_DATE;
  ELSE
    v_combo := 0;
    UPDATE public.profiles SET quiz_combo = 0 WHERE id = v_uid;
    SELECT COALESCE(current, 0) INTO v_m3 FROM public.daily_missions
      WHERE user_id = v_uid AND mission_id = 'm3' AND date = CURRENT_DATE;
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

-- ──────────────────────────────────────────
-- 4. 미션 보상 수령 RPC
--    서버 소유 진행도로 자격 검증 후 적립
-- ──────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.claim_mission_reward(
  p_mission_id TEXT,
  p_date       DATE DEFAULT CURRENT_DATE
)
RETURNS JSON LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_uid    UUID;
  v_target INTEGER;
  v_reward INTEGER;
  v_points INTEGER;
BEGIN
  v_uid := public.current_profile_id();
  IF v_uid IS NULL THEN RAISE EXCEPTION 'profile not found'; END IF;

  v_target := CASE p_mission_id WHEN 'm1' THEN 1 WHEN 'm3' THEN 3 ELSE NULL END;
  v_reward := CASE p_mission_id WHEN 'm1' THEN 10 WHEN 'm3' THEN 30 ELSE NULL END;
  IF v_reward IS NULL THEN RAISE EXCEPTION 'unknown mission %', p_mission_id; END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.daily_missions
    WHERE user_id = v_uid AND mission_id = p_mission_id AND date = p_date
      AND current >= v_target AND is_rewarded = false
  ) THEN
    RAISE EXCEPTION 'reward not eligible';
  END IF;

  UPDATE public.daily_missions SET is_rewarded = true
    WHERE user_id = v_uid AND mission_id = p_mission_id AND date = p_date;

  UPDATE public.profiles SET points = points + v_reward WHERE id = v_uid
    RETURNING points INTO v_points;

  RETURN json_build_object('points', v_points);
END;
$$;

-- ──────────────────────────────────────────
-- 5. 출석 RPC (포인트 미지급, m1 진행도만)
-- ──────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.checkin(
  p_date DATE DEFAULT CURRENT_DATE
)
RETURNS JSON LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_uid UUID;
BEGIN
  v_uid := public.current_profile_id();
  IF v_uid IS NULL THEN RAISE EXCEPTION 'profile not found'; END IF;

  INSERT INTO public.attendance (user_id, date)
    VALUES (v_uid, p_date)
    ON CONFLICT (user_id, date) DO NOTHING;

  INSERT INTO public.daily_missions (user_id, mission_id, date, current)
    VALUES (v_uid, 'm1', p_date, 1)
    ON CONFLICT (user_id, mission_id, date)
    DO UPDATE SET current = 1;

  RETURN json_build_object('ok', true);
END;
$$;

-- ──────────────────────────────────────────
-- 6. 권한 조정 — 클라 직접 쓰기 차단
-- ──────────────────────────────────────────
-- points 직접 UPDATE 차단: 테이블 UPDATE 회수 후 허용 컬럼만 재부여
REVOKE UPDATE ON public.profiles FROM anon, authenticated;
GRANT  UPDATE (emoji, nickname) ON public.profiles TO anon, authenticated;

-- daily_missions / attendance 직접 쓰기 차단 (RPC가 소유), 읽기는 유지
REVOKE INSERT, UPDATE, DELETE ON public.daily_missions FROM anon, authenticated;
REVOKE INSERT, UPDATE, DELETE ON public.attendance     FROM anon, authenticated;
GRANT  SELECT ON public.daily_missions TO anon, authenticated;
GRANT  SELECT ON public.attendance     TO anon, authenticated;

-- RPC 실행 권한
GRANT EXECUTE ON FUNCTION public.submit_quiz_answer(INTEGER, TEXT, TEXT, BOOLEAN, BOOLEAN) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.claim_mission_reward(TEXT, DATE)                          TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.checkin(DATE)                                             TO anon, authenticated;
