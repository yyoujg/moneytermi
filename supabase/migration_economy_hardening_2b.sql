-- ============================================================
-- 포인트·XP 경제 보강 2/3 (2026-09-26 점검) — 퀴즈 보상 일일 상한, typed 콤보 보너스 상한
-- _1 다음에 실행. 재실행 금지(옛 파일 포함) 규칙은 _1 머리말 참고.
--
-- 배경: submit_quiz_answer에 단어별·일별 상한이 없어 words(공개 읽기)의 정답을 그대로 보내는 루프로
-- 포인트·XP를 무제한 얻을 수 있었다(주간 리그 1위 가능). 정답 처리는 그대로 두고 보상만 하루 150회까지.
-- 150 = 퀴즈 노드 10개분. 정상 사용에서는 닿지 않는다.
-- ponytail: 단어별 상한 대신 사용자·일 단위 카운터 하나. 정교한 이상 탐지가 필요해지면 quiz_rewards_daily에 word_id를 더한다.
-- ============================================================

-- ===== STEP 3-1 : 일일 보상 카운터 =====
-- (형식) SQL Editor가 45줄 넘는 붙여넣기의 앞부분만 실행한 적이 있어 문장을 150자 줄로 촘촘히 붙였다. 의미는 동일.

-- 2b: submit_quiz_answer 교체. 2a(테이블) 다음에 실행. 이 파일엔 CREATE TABLE이 없어 에디터가 문장을 쪼개지 않는다.

CREATE OR REPLACE FUNCTION public.submit_quiz_answer( p_word_id       INTEGER, p_answer        TEXT, p_mode          TEXT,
p_used_hint     BOOLEAN DEFAULT false, p_session_start BOOLEAN DEFAULT false ) RETURNS JSON LANGUAGE plpgsql SECURITY DEFINER AS $$ DECLARE
v_uid     UUID; v_word    TEXT; v_combo   INTEGER; v_correct BOOLEAN; v_earned  INTEGER := 0; v_points  INTEGER; v_xp      INTEGER;
v_m3      INTEGER := 0; v_count   INTEGER := 0; v_capped  BOOLEAN := false; BEGIN v_uid := public.current_profile_id();
IF v_uid IS NULL THEN RAISE EXCEPTION 'profile not found'; END IF; SELECT word INTO v_word FROM public.words WHERE id = p_word_id;
IF v_word IS NULL THEN RAISE EXCEPTION 'word not found'; END IF; IF p_session_start THEN v_combo := 0; ELSE
SELECT quiz_combo INTO v_combo FROM public.profiles WHERE id = v_uid; END IF; IF p_mode = 'typed' THEN
v_correct := public.answer_matches(p_answer, v_word); ELSE v_correct := p_answer = v_word; END IF; IF v_correct THEN v_combo := v_combo + 1;
INSERT INTO public.quiz_rewards_daily (user_id, date, count) VALUES (v_uid, public.mission_date(), 1)
ON CONFLICT (user_id, date) DO UPDATE SET count = public.quiz_rewards_daily.count + 1 RETURNING count INTO v_count; v_capped := v_count > 150;
IF NOT v_capped THEN IF p_mode = 'typed' THEN v_earned := (CASE WHEN p_used_hint THEN 5 ELSE 10 END)
+ (CASE WHEN (v_combo - 1) >= 2 THEN LEAST((v_combo - 1) * 2, 18) ELSE 0 END); ELSE v_earned := CASE WHEN v_combo >= 5 THEN 20
WHEN v_combo >= 3 THEN 15 ELSE 10 END; END IF; END IF; UPDATE public.profiles SET points = points + v_earned, quiz_combo = v_combo WHERE id = v_uid;
IF NOT v_capped THEN PERFORM public.add_xp(v_uid, 2); v_m3 := COALESCE(public.bump_mission(v_uid, 'm3'), 0); PERFORM public.bump_mission(v_uid, 'm4');
ELSE SELECT COALESCE(current, 0) INTO v_m3 FROM public.daily_missions WHERE user_id = v_uid AND mission_id = 'm3'
AND date = public.mission_date() AND slot = public.mission_slot(); END IF; ELSE v_combo := 0;
UPDATE public.profiles SET quiz_combo = 0 WHERE id = v_uid; SELECT COALESCE(current, 0) INTO v_m3 FROM public.daily_missions
WHERE user_id = v_uid AND mission_id = 'm3' AND date = public.mission_date() AND slot = public.mission_slot(); END IF;
SELECT points, xp INTO v_points, v_xp FROM public.profiles WHERE id = v_uid; RETURN json_build_object(
'correct', v_correct, 'earned', v_earned, 'combo', v_combo, 'points', v_points, 'xp', v_xp, 'm3_current', COALESCE(v_m3, 0), 'capped', v_capped );
END; $$; GRANT EXECUTE ON FUNCTION public.submit_quiz_answer(INTEGER, TEXT, TEXT, BOOLEAN, BOOLEAN) TO anon, authenticated;
NOTIFY pgrst, 'reload schema';
