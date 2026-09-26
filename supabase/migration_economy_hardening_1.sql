-- ============================================================
-- 포인트·XP 경제 보강 1/3 (2026-09-26 점검) — add_xp 원자화, 미션 보상 원자화
-- 실행 순서: _1 → _2 → _3. 파일당 문장 수를 적게 유지한다(SQL Editor가 긴 붙여넣기의 앞부분만 실행한 적이 있음).
--
-- ⚠️ 옛 마이그레이션(migration_missions_slots.sql, migration_weekly_league.sql, migration_leaderboard*.sql,
--    migration_points_economy.sql STEP 3)을 다시 실행하면 이 파일의 함수가 옛 버전으로 되돌아간다. 재실행 금지.
-- ============================================================

-- ===== STEP 1 : add_xp — 한 문장으로 갱신 (경합 시 XP 유실·마일스톤 이중 지급 방지) =====
-- 이전 버전은 xp를 SELECT한 뒤 절대값으로 UPDATE했다. UPDATE 한 문장 안에서 xp는 갱신 전 값이므로
-- 부스트 배수와 50XP 단위 보너스가 같은 스냅샷으로 계산된다.
-- (형식) SQL Editor가 45줄 넘는 붙여넣기의 앞부분만 실행한 적이 있어 문장을 150자 줄로 촘촘히 붙였다. 의미는 동일.

CREATE OR REPLACE FUNCTION public.add_xp(p_uid UUID, p_amount INTEGER) RETURNS INTEGER LANGUAGE plpgsql SECURITY DEFINER AS $$ DECLARE v_new INTEGER;
BEGIN UPDATE public.profiles SET xp     = xp + p_amount * (CASE WHEN boost_until > now() THEN 2 ELSE 1 END),
points = points + ((xp + p_amount * (CASE WHEN boost_until > now() THEN 2 ELSE 1 END)) / 50 - xp / 50) * 50 WHERE id = p_uid RETURNING xp INTO v_new;
RETURN v_new; END; $$; REVOKE EXECUTE ON FUNCTION public.add_xp(UUID, INTEGER) FROM PUBLIC, anon, authenticated;
CREATE OR REPLACE FUNCTION public.claim_mission_reward( p_mission_id TEXT, p_date       DATE DEFAULT NULL )
RETURNS JSON LANGUAGE plpgsql SECURITY DEFINER AS $$ DECLARE v_uid    UUID; v_target INTEGER; v_reward INTEGER; v_points INTEGER; v_xp     INTEGER;
v_date   DATE     := public.mission_date(); v_slot   SMALLINT := public.mission_slot(); BEGIN v_uid := public.current_profile_id();
IF v_uid IS NULL THEN RAISE EXCEPTION 'profile not found'; END IF; SELECT target, reward INTO v_target, v_reward
FROM public.mission_defs WHERE mission_id = p_mission_id AND active;
IF v_reward IS NULL THEN RAISE EXCEPTION 'unknown mission %', p_mission_id; END IF; UPDATE public.daily_missions SET is_rewarded = true
WHERE user_id = v_uid AND mission_id = p_mission_id AND date = v_date AND slot = v_slot AND current >= v_target AND is_rewarded = false;
IF NOT FOUND THEN RAISE EXCEPTION 'reward not eligible'; END IF; UPDATE public.profiles SET points = points + v_reward WHERE id = v_uid;
PERFORM public.add_xp(v_uid, 5); SELECT points, xp INTO v_points, v_xp FROM public.profiles WHERE id = v_uid;
RETURN json_build_object('points', v_points, 'xp', v_xp, 'reward', v_reward); END; $$;
GRANT EXECUTE ON FUNCTION public.claim_mission_reward(TEXT, DATE) TO anon, authenticated; NOTIFY pgrst, 'reload schema';


-- 확인:
-- SELECT pg_get_functiondef('public.add_xp(uuid,integer)'::regprocedure);            -- 'xp = xp + ' 포함
-- SELECT pg_get_functiondef('public.claim_mission_reward(text,date)'::regprocedure); -- 'is_rewarded = false;' 가 UPDATE 안에

