-- 리그 랭킹 조회 RPC
--
-- 배경: 번들 121에서 profiles SELECT를 본인 행만 허용하도록 RLS를 강화했다.
--       랭킹은 남의 점수를 읽어야 하므로 SECURITY DEFINER 함수로만 노출한다.
--       노출 항목은 닉네임/이모지/포인트뿐 — id, guest_token, toss_anonymous_key는 반환하지 않는다.
--
-- 적용: Supabase 대시보드 SQL Editor에서 실행. 여러 번 실행해도 안전하다.

BEGIN;

-- 상위 N명. 동점은 먼저 가입한 순.
CREATE OR REPLACE FUNCTION public.leaderboard_top(p_limit INTEGER DEFAULT 50)
RETURNS TABLE (rank BIGINT, nickname TEXT, emoji TEXT, points INTEGER, is_me BOOLEAN)
LANGUAGE sql SECURITY DEFINER STABLE AS $$
  WITH ranked AS (
    SELECT p.id, p.nickname, p.emoji, p.points,
           RANK() OVER (ORDER BY p.points DESC, p.created_at) AS rnk
    FROM public.profiles p
    WHERE p.points > 0
  )
  SELECT r.rnk, r.nickname, r.emoji, r.points, r.id = public.current_profile_id()
  FROM ranked r
  ORDER BY r.rnk
  LIMIT LEAST(GREATEST(p_limit, 1), 100);
$$;

-- 내 순위 (상위 N 밖이어도 보여주기 위함)
CREATE OR REPLACE FUNCTION public.my_league_rank()
RETURNS JSON LANGUAGE plpgsql SECURITY DEFINER STABLE AS $$
DECLARE
  v_uid    UUID;
  v_rank   BIGINT;
  v_total  BIGINT;
  v_points INTEGER;
BEGIN
  v_uid := public.current_profile_id();
  IF v_uid IS NULL THEN RETURN json_build_object('rank', NULL, 'total', 0, 'points', 0); END IF;

  SELECT count(*) INTO v_total FROM public.profiles WHERE points > 0;
  SELECT points INTO v_points FROM public.profiles WHERE id = v_uid;

  SELECT rnk INTO v_rank FROM (
    SELECT id, RANK() OVER (ORDER BY points DESC, created_at) AS rnk
    FROM public.profiles WHERE points > 0
  ) t WHERE t.id = v_uid;

  RETURN json_build_object('rank', v_rank, 'total', v_total, 'points', COALESCE(v_points, 0));
END;
$$;

GRANT EXECUTE ON FUNCTION public.leaderboard_top(INTEGER) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.my_league_rank()          TO anon, authenticated;

COMMIT;

-- 확인
--   SELECT * FROM public.leaderboard_top(10);
--   SELECT public.my_league_rank();
