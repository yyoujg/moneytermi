-- my_league_rank 보정
-- 프로필이 없을 때(게스트 생성 실패 등) total까지 0으로 돌려줘 "0명 중" 이 되던 것,
-- leaderboard_top의 is_me가 프로필 없을 때 NULL로 나가던 것을 고친다.

BEGIN;

CREATE OR REPLACE FUNCTION public.leaderboard_top(p_limit INTEGER DEFAULT 50)
RETURNS TABLE (rank BIGINT, nickname TEXT, emoji TEXT, points INTEGER, is_me BOOLEAN)
LANGUAGE sql SECURITY DEFINER STABLE AS $$
  WITH ranked AS (
    SELECT p.id, p.nickname, p.emoji, p.points,
           RANK() OVER (ORDER BY p.points DESC, p.created_at) AS rnk
    FROM public.profiles p
    WHERE p.points > 0
  )
  SELECT r.rnk, r.nickname, r.emoji, r.points,
         COALESCE(r.id = public.current_profile_id(), false)
  FROM ranked r
  ORDER BY r.rnk
  LIMIT LEAST(GREATEST(p_limit, 1), 100);
$$;

CREATE OR REPLACE FUNCTION public.my_league_rank()
RETURNS JSON LANGUAGE plpgsql SECURITY DEFINER STABLE AS $$
DECLARE
  v_uid    UUID;
  v_rank   BIGINT;
  v_total  BIGINT;
  v_points INTEGER;
BEGIN
  SELECT count(*) INTO v_total FROM public.profiles WHERE points > 0;

  v_uid := public.current_profile_id();
  IF v_uid IS NULL THEN
    RETURN json_build_object('rank', NULL, 'total', v_total, 'points', 0);
  END IF;

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
