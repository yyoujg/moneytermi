-- 마이그레이션 적용 후 관리자 권한의 별도 세션에서만 수동 실행한다.
-- 2026-10-19 운영 함수와 함께 가상 프로필로 검사한 뒤 전체 ROLLBACK을 확인했다.
-- 기존 고객을 찾거나 읽지 않는다. 읽는 기존 데이터는 단어 사전 한 항목뿐이다.
-- 프로필은 컬럼 기본값을 그대로 사용하며, 모든 검사와 쓰기는 아래 트랜잭션에서 취소한다.
-- 단일 세션 검사이다. 실제 병렬 요청은 별도의 격리 데이터베이스에서 검사한다.
BEGIN;
SET LOCAL lock_timeout = '5s';
SET LOCAL statement_timeout = '30s';
SET LOCAL request.jwt.claims = '{}';
SET LOCAL request.jwt.claim.sub = ''; 
SET LOCAL request.headers = '{}';

DO $test$
DECLARE
  v_uid uuid;
  v_guest uuid := pg_catalog.gen_random_uuid();
  v_request uuid := pg_catalog.gen_random_uuid();
  v_request2 uuid := pg_catalog.gen_random_uuid();
  v_word_id integer;
  v_word text;
  v_first jsonb;
  v_repeat jsonb;
  v_second jsonb;
  v_late jsonb;
  v_legacy jsonb;
  v_points integer;
  v_xp integer;
  v_combo integer;
  v_count integer;
  v_m3 integer;
  v_receipts integer;
  v_bad_mode text;
BEGIN
  IF auth.uid() IS NOT NULL THEN RAISE EXCEPTION 'test requires empty authentication context'; END IF;
  INSERT INTO public.profiles(guest_token, nickname)
    VALUES (v_guest, '검증수달') RETURNING id INTO v_uid;
  PERFORM pg_catalog.set_config('request.headers',
    pg_catalog.jsonb_build_object('x-guest-token', v_guest)::text, true);
  IF public.current_profile_id() IS DISTINCT FROM v_uid THEN
    RAISE EXCEPTION 'synthetic profile resolution failed';
  END IF;
  SELECT w.id, w.word INTO v_word_id, v_word
    FROM public.words AS w WHERE w.word IS NOT NULL ORDER BY w.id LIMIT 1;
  IF NOT FOUND THEN RAISE EXCEPTION 'test needs one dictionary word'; END IF;

  v_first := public.submit_quiz_answer_once(v_word_id, v_word, 'typed', false, true, v_request);
  IF (v_first->>'correct')::boolean IS DISTINCT FROM true
     OR (v_first->>'earned')::integer IS DISTINCT FROM 10
     OR (v_first->>'combo')::integer IS DISTINCT FROM 1
     OR (v_first->>'capped')::boolean IS DISTINCT FROM false THEN
    RAISE EXCEPTION 'first correct answer failed: %', v_first;
  END IF;
  SELECT p.points, p.xp INTO v_points, v_xp FROM public.profiles p WHERE p.id = v_uid;
  SELECT r.count INTO v_count FROM public.quiz_rewards_daily r
    WHERE r.user_id = v_uid AND r.date = public.mission_date();
  IF v_count IS DISTINCT FROM 1 THEN RAISE EXCEPTION 'first reward count failed'; END IF;

  v_repeat := public.submit_quiz_answer_once(v_word_id, v_word, 'typed', false, true, v_request);
  IF v_repeat IS DISTINCT FROM v_first THEN RAISE EXCEPTION 'immediate replay result changed'; END IF;
  IF EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = v_uid
             AND (p.points IS DISTINCT FROM v_points OR p.xp IS DISTINCT FROM v_xp))
     OR (SELECT r.count FROM public.quiz_rewards_daily r
         WHERE r.user_id = v_uid AND r.date = public.mission_date()) IS DISTINCT FROM 1 THEN
    RAISE EXCEPTION 'duplicate awarded twice';
  END IF;

  BEGIN
    PERFORM public.submit_quiz_answer_once(v_word_id, v_word || '다른답안', 'typed', false, true, v_request);
    RAISE EXCEPTION 'different payload was accepted';
  EXCEPTION WHEN SQLSTATE '22023' THEN NULL; END;
  BEGIN
    PERFORM public.submit_quiz_answer_once(v_word_id, v_word, 'typed', true, true, v_request);
    RAISE EXCEPTION 'different hint flag was accepted';
  EXCEPTION WHEN SQLSTATE '22023' THEN NULL; END;
  BEGIN
    PERFORM public.submit_quiz_answer_once(v_word_id, v_word, 'typed', false, false, NULL);
    RAISE EXCEPTION 'null request ID was accepted';
  EXCEPTION WHEN SQLSTATE '22023' THEN NULL; END;
  BEGIN
    PERFORM 'not-a-uuid'::uuid;
    RAISE EXCEPTION 'invalid UUID text was accepted';
  EXCEPTION WHEN invalid_text_representation THEN NULL; END;
  BEGIN
    PERFORM public.submit_quiz_answer_once(v_word_id, NULL, 'typed', false, false, pg_catalog.gen_random_uuid());
    RAISE EXCEPTION 'null answer was accepted';
  EXCEPTION WHEN SQLSTATE '22023' THEN NULL; END;
  FOREACH v_bad_mode IN ARRAY ARRAY[NULL::text, '', 'invalid'] LOOP
    BEGIN
      PERFORM public.submit_quiz_answer_once(v_word_id, v_word, v_bad_mode, false, false, pg_catalog.gen_random_uuid());
      RAISE EXCEPTION 'invalid mode was accepted';
    EXCEPTION WHEN SQLSTATE '22023' THEN NULL; END;
  END LOOP;
  BEGIN
    PERFORM public.submit_quiz_answer_once(NULL, v_word, 'typed', false, false, pg_catalog.gen_random_uuid());
    RAISE EXCEPTION 'null word ID was accepted';
  EXCEPTION WHEN SQLSTATE '22023' THEN NULL; END;
  BEGIN
    PERFORM public.submit_quiz_answer_once(v_word_id, v_word, 'typed', NULL, false, pg_catalog.gen_random_uuid());
    RAISE EXCEPTION 'null boolean was accepted';
  EXCEPTION WHEN SQLSTATE '22023' THEN NULL; END;

  v_second := public.submit_quiz_answer_once(v_word_id, v_word, 'typed', false, false, v_request2);
  IF (v_second->>'combo')::integer IS DISTINCT FROM 2
     OR (v_second->>'earned')::integer IS DISTINCT FROM 10 THEN
    RAISE EXCEPTION 'distinct request did not accumulate combo: %', v_second;
  END IF;
  -- 구형 클라이언트 경로도 같은 잠금과 기존 보상식을 사용한다.
  v_legacy := public.submit_quiz_answer(v_word_id, v_word, 'typed', false, false)::jsonb;
  IF (v_legacy->>'combo')::integer IS DISTINCT FROM 3
     OR (v_legacy->>'earned')::integer IS DISTINCT FROM 14 THEN
    RAISE EXCEPTION 'legacy combo/reward changed: %', v_legacy;
  END IF;
  SELECT p.points, p.xp, p.quiz_combo INTO v_points, v_xp, v_combo
    FROM public.profiles p WHERE p.id = v_uid;
  SELECT COALESCE(d.current, 0) INTO v_m3 FROM public.daily_missions d
    WHERE d.user_id = v_uid AND d.mission_id = 'm3'
      AND d.date = public.mission_date() AND d.slot = public.mission_slot();
  v_late := public.submit_quiz_answer_once(v_word_id, v_word, 'typed', false, true, v_request);
  IF (v_late->>'points')::integer IS DISTINCT FROM v_points
     OR (v_late->>'xp')::integer IS DISTINCT FROM v_xp
     OR (v_late->>'combo')::integer IS DISTINCT FROM v_combo
     OR (v_late->>'m3_current')::integer IS DISTINCT FROM COALESCE(v_m3, 0)
     OR (v_late - ARRAY['points','xp','combo','m3_current'])
        IS DISTINCT FROM (v_first - ARRAY['points','xp','combo','m3_current']) THEN
    RAISE EXCEPTION 'late replay is stale or lost original grading: %', v_late;
  END IF;
  IF EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = v_uid
             AND (p.points IS DISTINCT FROM v_points OR p.xp IS DISTINCT FROM v_xp
                  OR p.quiz_combo IS DISTINCT FROM v_combo)) THEN
    RAISE EXCEPTION 'late replay changed profile';
  END IF;
  SELECT r.count INTO v_count FROM public.quiz_rewards_daily r
    WHERE r.user_id = v_uid AND r.date = public.mission_date();
  SELECT count(*) INTO v_receipts FROM public.quiz_answer_receipts_v2 r WHERE r.user_id = v_uid;
  IF v_count IS DISTINCT FROM 3 OR v_receipts IS DISTINCT FROM 2 THEN
    RAISE EXCEPTION 'reward count or receipt count incorrect';
  END IF;

  -- 아래 변경도 이 트랜잭션에서 만든 가상 프로필에만 적용한다.
  UPDATE public.profiles SET quiz_combo = 0 WHERE id = v_uid;
  v_second := public.submit_quiz_answer_once(v_word_id, v_word, 'typed', true, true, pg_catalog.gen_random_uuid());
  IF (v_second->>'earned')::integer IS DISTINCT FROM 5 OR (v_second->>'combo')::integer IS DISTINCT FROM 1 THEN
    RAISE EXCEPTION 'hint reward changed';
  END IF;
  SELECT p.points, p.xp INTO v_points, v_xp FROM public.profiles p WHERE p.id = v_uid;
  SELECT r.count INTO v_count FROM public.quiz_rewards_daily r WHERE r.user_id = v_uid AND r.date = public.mission_date();
  v_second := public.submit_quiz_answer_once(v_word_id, '__quality_wrong_answer__', 'typed', false, false, pg_catalog.gen_random_uuid());
  IF (v_second->>'correct')::boolean IS DISTINCT FROM false OR (v_second->>'earned')::integer IS DISTINCT FROM 0
     OR (v_second->>'combo')::integer IS DISTINCT FROM 0
     OR (SELECT p.points FROM public.profiles p WHERE p.id = v_uid) IS DISTINCT FROM v_points
     OR (SELECT p.xp FROM public.profiles p WHERE p.id = v_uid) IS DISTINCT FROM v_xp
     OR (SELECT r.count FROM public.quiz_rewards_daily r WHERE r.user_id = v_uid AND r.date = public.mission_date()) IS DISTINCT FROM v_count THEN
    RAISE EXCEPTION 'wrong answer changed reward or counts';
  END IF;
  v_second := public.submit_quiz_answer_once(v_word_id, v_word, 'mc', false, true, pg_catalog.gen_random_uuid());
  IF (v_second->>'earned')::integer IS DISTINCT FROM 10 OR (v_second->>'combo')::integer IS DISTINCT FROM 1 THEN
    RAISE EXCEPTION 'multiple choice reward changed';
  END IF;
  UPDATE public.quiz_rewards_daily SET count = 149 WHERE user_id = v_uid AND date = public.mission_date();
  v_second := public.submit_quiz_answer_once(v_word_id, v_word, 'mc', false, true, pg_catalog.gen_random_uuid());
  IF (v_second->>'capped')::boolean IS DISTINCT FROM false OR (v_second->>'earned')::integer IS DISTINCT FROM 10
     OR (SELECT r.count FROM public.quiz_rewards_daily r WHERE r.user_id = v_uid AND r.date = public.mission_date()) IS DISTINCT FROM 150 THEN
    RAISE EXCEPTION '150th reward boundary changed';
  END IF;
  SELECT p.points, p.xp INTO v_points, v_xp FROM public.profiles p WHERE p.id = v_uid;
  SELECT COALESCE(d.current, 0) INTO v_m3 FROM public.daily_missions d
    WHERE d.user_id = v_uid AND d.mission_id = 'm3' AND d.date = public.mission_date() AND d.slot = public.mission_slot();
  v_second := public.submit_quiz_answer_once(v_word_id, v_word, 'mc', false, false, pg_catalog.gen_random_uuid());
  IF (v_second->>'capped')::boolean IS DISTINCT FROM true OR (v_second->>'earned')::integer IS DISTINCT FROM 0
     OR (v_second->>'m3_current')::integer IS DISTINCT FROM COALESCE(v_m3, 0)
     OR (SELECT p.points FROM public.profiles p WHERE p.id = v_uid) IS DISTINCT FROM v_points
     OR (SELECT p.xp FROM public.profiles p WHERE p.id = v_uid) IS DISTINCT FROM v_xp THEN
    RAISE EXCEPTION '151st capped reward changed';
  END IF;
  IF NOT pg_catalog.has_function_privilege('anon', 'public.submit_quiz_answer_once(integer,text,text,boolean,boolean,uuid)', 'EXECUTE')
     OR NOT pg_catalog.has_function_privilege('authenticated', 'public.submit_quiz_answer_once(integer,text,text,boolean,boolean,uuid)', 'EXECUTE')
     OR pg_catalog.has_table_privilege('anon', 'public.quiz_answer_receipts_v2', 'SELECT,INSERT,UPDATE,DELETE,TRUNCATE,REFERENCES,TRIGGER')
     OR pg_catalog.has_table_privilege('authenticated', 'public.quiz_answer_receipts_v2', 'SELECT,INSERT,UPDATE,DELETE,TRUNCATE,REFERENCES,TRIGGER')
     OR pg_catalog.has_any_column_privilege('anon', 'public.quiz_answer_receipts_v2', 'SELECT,INSERT,UPDATE,REFERENCES')
     OR pg_catalog.has_any_column_privilege('authenticated', 'public.quiz_answer_receipts_v2', 'SELECT,INSERT,UPDATE,REFERENCES') THEN
    RAISE EXCEPTION 'receipt access control failed';
  END IF;

  PERFORM pg_catalog.set_config('request.headers', '{}', true);
  IF public.current_profile_id() IS NOT NULL THEN RAISE EXCEPTION 'no-profile isolation failed'; END IF;
  BEGIN
    PERFORM public.submit_quiz_answer_once(v_word_id, v_word, 'typed', false, false, pg_catalog.gen_random_uuid());
    RAISE EXCEPTION 'no-profile request was accepted';
  EXCEPTION WHEN SQLSTATE '28000' THEN NULL; END;
  RAISE NOTICE 'synthetic profile tests passed; all changes will be rolled back';
END;
$test$;
ROLLBACK;
