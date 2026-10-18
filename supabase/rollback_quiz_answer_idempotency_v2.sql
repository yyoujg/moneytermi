-- 선행 조건: 새 RPC를 호출하는 모든 클라이언트를 먼저 내리고 진행 중 요청을 배출한다.
-- 원본/잠금본만 허용한다. 기존 함수의 소유자 및 ACL(알 수 없는 PUBLIC grant 포함)은 보존한다.
-- 영수증 테이블/기록/권한과 기존 데이터는 삭제하거나 변경하지 않는다.
BEGIN;
SET LOCAL lock_timeout = '10s';
DO $guard$
DECLARE v_definition text;
BEGIN
  IF pg_catalog.to_regprocedure('public.submit_quiz_answer(integer,text,text,boolean,boolean)') IS NULL THEN
    RAISE EXCEPTION 'reviewed submit_quiz_answer is missing';
  END IF;
  v_definition := pg_catalog.btrim(pg_catalog.pg_get_functiondef(
    'public.submit_quiz_answer(integer,text,text,boolean,boolean)'::regprocedure), E' \t\r\n');
  IF pg_catalog.encode(pg_catalog.sha256(pg_catalog.convert_to(v_definition, 'UTF8')), 'hex')
     NOT IN ('f812da21f998176ab6e85f9a090efcce86034cf0168c0c87b1afb25a72f166d1', '6e466ba3856c4a8b2cf35b98b1550c565aba952df9e1f23b7c57848a5152233e') THEN
    RAISE EXCEPTION 'submit_quiz_answer changed since review; stop and review the live definition';
  END IF;
  IF pg_catalog.to_regprocedure('public.submit_quiz_answer_once(integer,text,text,boolean,boolean,uuid)') IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM pg_catalog.pg_proc p
     WHERE p.oid = pg_catalog.to_regprocedure('public.submit_quiz_answer_once(integer,text,text,boolean,boolean,uuid)')
       AND pg_catalog.encode(pg_catalog.sha256(pg_catalog.convert_to(p.prosrc, 'UTF8')), 'hex') = 'bf031f11a0a5c942247b780e70b679bcf1880b28fe6914e5854988b77bdaff94'
       AND p.prosecdef AND p.prorettype = 'jsonb'::regtype
       AND p.proconfig = ARRAY['search_path=pg_catalog, public, pg_temp']::text[]
  ) THEN
    RAISE EXCEPTION 'submit_quiz_answer_once changed since review; refusing to remove';
  END IF;
END;
$guard$;

DROP FUNCTION IF EXISTS public.submit_quiz_answer_once(integer,text,text,boolean,boolean,uuid);
CREATE OR REPLACE FUNCTION public.submit_quiz_answer(p_word_id integer, p_answer text, p_mode text, p_used_hint boolean DEFAULT false, p_session_start boolean DEFAULT false)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$ DECLARE
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
END; $function$;
NOTIFY pgrst, 'reload schema';
COMMIT;
