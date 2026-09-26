-- ============================================================
-- 포인트·XP 경제 보강 3/3 (2026-09-26 점검) — word_progress FK, 게스트 가입 정책, 광고·추천 일일 상한 KST
-- _2b 다음에 실행. 재실행 금지(옛 파일 포함) 규칙은 _1 머리말 참고.
-- ============================================================

-- ===== STEP 4 : word_progress.word_id → words(id) FK =====
-- 배경: FK가 없고 anon INSERT가 열려 있어 존재하지 않는 단어 id를 대량 upsert하면 그만큼 XP(트리거 add_xp 1)와
-- 미션 m2/m5를 얻을 수 있었다. 정당한 대량 학습은 그대로 허용된다.
-- 먼저 고아 행이 있는지 본다. 0이 아니면 아래 DELETE 주석을 풀어 먼저 실행한다(01_delete.sql 이후엔 id 1~747뿐이라 0이어야 함).
--   SELECT count(*) FROM public.word_progress wp LEFT JOIN public.words w ON w.id = wp.word_id WHERE w.id IS NULL;
--   DELETE FROM public.word_progress wp WHERE NOT EXISTS (SELECT 1 FROM public.words w WHERE w.id = wp.word_id);
-- (형식) SQL Editor가 45줄 넘는 붙여넣기의 앞부분만 실행한 적이 있어 문장을 150자 줄로 촘촘히 붙였다. 의미는 동일.

ALTER TABLE public.word_progress ADD CONSTRAINT word_progress_word_fk FOREIGN KEY (word_id) REFERENCES public.words(id) ON DELETE CASCADE NOT VALID;
ALTER TABLE public.word_progress VALIDATE CONSTRAINT word_progress_word_fk; DROP POLICY IF EXISTS "profiles_insert" ON public.profiles;
CREATE POLICY "profiles_insert" ON public.profiles FOR INSERT WITH CHECK ( auth_id  IS NULL AND email IS NULL AND is_guest = true );
CREATE OR REPLACE FUNCTION public.claim_ad_reward( p_reward_amount INTEGER, p_reward_unit   TEXT DEFAULT 'point' )
RETURNS JSON LANGUAGE plpgsql SECURITY DEFINER AS $$ DECLARE v_uid          UUID; v_today_total  INTEGER; v_credited     INTEGER;
v_points       INTEGER; BEGIN v_uid := public.current_profile_id(); IF v_uid IS NULL THEN RAISE EXCEPTION 'profile not found'; END IF;
SELECT COALESCE(SUM(amount), 0) INTO v_today_total FROM public.ad_rewards
WHERE profile_id = v_uid AND (created_at AT TIME ZONE 'Asia/Seoul')::date = public.mission_date();
v_credited := LEAST(GREATEST(p_reward_amount, 0), 50, GREATEST(200 - v_today_total, 0)); IF v_credited > 0 THEN
INSERT INTO public.ad_rewards (profile_id, amount, reward_unit) VALUES (v_uid, v_credited, p_reward_unit);
UPDATE public.profiles SET points = points + v_credited WHERE id = v_uid RETURNING points INTO v_points; ELSE
SELECT points INTO v_points FROM public.profiles WHERE id = v_uid; END IF; RETURN json_build_object('points', v_points, 'credited', v_credited); END;
$$; CREATE OR REPLACE FUNCTION public.claim_referral_reward( p_reward_amount INTEGER, p_reward_unit   TEXT DEFAULT 'point' )
RETURNS JSON LANGUAGE plpgsql SECURITY DEFINER AS $$ DECLARE v_uid          UUID; v_today_total  INTEGER; v_credited     INTEGER;
v_points       INTEGER; BEGIN v_uid := public.current_profile_id(); IF v_uid IS NULL THEN RAISE EXCEPTION 'profile not found'; END IF;
SELECT COALESCE(SUM(amount), 0) INTO v_today_total FROM public.referral_rewards
WHERE profile_id = v_uid AND (created_at AT TIME ZONE 'Asia/Seoul')::date = public.mission_date();
v_credited := LEAST(GREATEST(p_reward_amount, 0), 50, GREATEST(200 - v_today_total, 0)); IF v_credited > 0 THEN
INSERT INTO public.referral_rewards (profile_id, amount, reward_unit) VALUES (v_uid, v_credited, p_reward_unit);
UPDATE public.profiles SET points = points + v_credited WHERE id = v_uid RETURNING points INTO v_points; ELSE
SELECT points INTO v_points FROM public.profiles WHERE id = v_uid; END IF; RETURN json_build_object('points', v_points, 'credited', v_credited); END;
$$; NOTIFY pgrst, 'reload schema';


-- 확인:
-- SELECT conname, convalidated FROM pg_constraint WHERE conname = 'word_progress_word_fk';   -- 1행, true
-- SELECT qual, with_check FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'profiles_insert';  -- points 조건 없음
-- SELECT pg_get_functiondef('public.claim_ad_reward(integer,text)'::regprocedure);           -- 'Asia/Seoul' 포함

