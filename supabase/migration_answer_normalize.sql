-- ============================================================
-- 리뷰(주관식) 정답 판정 정규화
-- ------------------------------------------------------------
-- 문제: 기존 typed 채점은 공백·대소문자만 무시 → '국내총생산(GDP)', '간접세/직접세'
--       처럼 괄호·슬래시·영문 포함 단어는 정답 입력이 사실상 불가.
-- 해결: 괄호 안 내용(약어)·슬래시 분해 항목을 모두 정답 후보로 인정.
--       클라이언트(src/lib/answer.ts)와 동일 규칙.
-- 실행: Supabase 대시보드 → SQL Editor → 붙여넣기 → Run
-- 안전: 기존 정답은 그대로 통과(후보 집합에 원본 정규화 포함). 판정 완화만.
-- ============================================================

-- 정답 후보 매칭 헬퍼
CREATE OR REPLACE FUNCTION public.answer_matches(p_answer TEXT, p_word TEXT)
RETURNS BOOLEAN LANGUAGE plpgsql IMMUTABLE AS $$
DECLARE
  a     TEXT := lower(regexp_replace(coalesce(p_answer, ''), '\s+', '', 'g'));
  paren TEXT := lower(regexp_replace(coalesce((regexp_match(p_word, '\(([^)]*)\)'))[1], ''), '\s+', '', 'g'));
  base  TEXT := regexp_replace(p_word, '\([^)]*\)', '', 'g');  -- 괄호·내용 제거
  cand  TEXT[];
BEGIN
  IF a = '' THEN RETURN false; END IF;
  -- 슬래시 분해 후 각 항 정규화 (빈 항 제외)
  cand := ARRAY(
    SELECT lower(regexp_replace(x, '\s+', '', 'g'))
    FROM unnest(string_to_array(base, '/')) AS x
    WHERE btrim(x) <> ''
  );
  IF paren <> '' THEN cand := cand || paren; END IF;   -- 괄호 안 약어도 정답 인정
  RETURN a = ANY(cand);
END;
$$;

-- submit_quiz_answer: typed 판정만 answer_matches로 교체 (나머지 원본 동일)
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

  IF p_session_start THEN
    v_combo := 0;
  ELSE
    SELECT quiz_combo INTO v_combo FROM public.profiles WHERE id = v_uid;
  END IF;

  -- 정답 판정 (모드별)
  IF p_mode = 'typed' THEN
    v_correct := public.answer_matches(p_answer, v_word);   -- ← 정규화 매칭
  ELSE  -- 'mc'
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

GRANT EXECUTE ON FUNCTION public.submit_quiz_answer(INTEGER, TEXT, TEXT, BOOLEAN, BOOLEAN) TO anon, authenticated;

-- 검증(선택):
-- SELECT public.answer_matches('국내총생산', '국내총생산(GDP)');  -- t
-- SELECT public.answer_matches('gdp',       '국내총생산(GDP)');  -- t
-- SELECT public.answer_matches('직접세',    '간접세/직접세');     -- t
-- SELECT public.answer_matches('오답',      '국내총생산(GDP)');  -- f
