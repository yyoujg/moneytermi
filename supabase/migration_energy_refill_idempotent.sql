-- Energy refill approval target.
-- Not applied automatically. Apply only after approving server-side point spending for energy refill.
--
-- Client recovery design:
-- 1. Before calling buy_energy_refill_once, store a local pending refill key.
-- 2. If the RPC succeeds but local energy persistence fails or the app refreshes, retry the same key.
-- 3. The function returns idempotent=true without charging again, letting the client refill local energy and clear the pending key.

CREATE TABLE IF NOT EXISTS public.energy_refill_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  idempotency_key TEXT NOT NULL,
  cost INTEGER NOT NULL DEFAULT 600 CHECK (cost = 600),
  points_after INTEGER NOT NULL CHECK (points_after >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, idempotency_key)
);

ALTER TABLE public.energy_refill_requests ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.energy_refill_requests FROM PUBLIC;
REVOKE ALL ON public.energy_refill_requests FROM anon;
REVOKE ALL ON public.energy_refill_requests FROM authenticated;

CREATE OR REPLACE FUNCTION public.buy_energy_refill_once(
  p_idempotency_key TEXT
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_auth_uid UUID := auth.uid();
  v_uid UUID := public.current_profile_id();
  v_cost CONSTANT INTEGER := 600;
  v_points INTEGER;
  v_existing public.energy_refill_requests%ROWTYPE;
BEGIN
  IF v_auth_uid IS NULL AND v_uid IS NULL THEN
    RAISE EXCEPTION 'authenticated or guest profile required';
  END IF;
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'profile required';
  END IF;
  IF p_idempotency_key IS NULL OR length(trim(p_idempotency_key)) < 16 THEN
    RAISE EXCEPTION 'idempotency key required';
  END IF;

  PERFORM pg_advisory_xact_lock(hashtext(v_uid::TEXT));

  SELECT *
    INTO v_existing
    FROM public.energy_refill_requests
   WHERE user_id = v_uid
     AND idempotency_key = p_idempotency_key;

  IF FOUND THEN
    RETURN json_build_object(
      'points', v_existing.points_after,
      'cost', v_existing.cost,
      'reason', 'energy_refill',
      'idempotent', true
    );
  END IF;

  -- Same-user near-simultaneous requests with different keys are treated as one refill.
  -- The app also stores a pending key locally, but this protects against racing webviews/tabs.
  SELECT *
    INTO v_existing
    FROM public.energy_refill_requests
   WHERE user_id = v_uid
     AND created_at > now() - interval '30 seconds'
   ORDER BY created_at DESC
   LIMIT 1;

  IF FOUND THEN
    RETURN json_build_object(
      'points', v_existing.points_after,
      'cost', v_existing.cost,
      'reason', 'energy_refill',
      'idempotent', true
    );
  END IF;

  UPDATE public.profiles
     SET points = points - v_cost,
         updated_at = now()
   WHERE id = v_uid
     AND points >= v_cost
   RETURNING points INTO v_points;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'insufficient points';
  END IF;

  INSERT INTO public.energy_refill_requests (
    user_id, idempotency_key, cost, points_after
  ) VALUES (
    v_uid, p_idempotency_key, v_cost, v_points
  );

  RETURN json_build_object(
    'points', v_points,
    'cost', v_cost,
    'reason', 'energy_refill',
    'idempotent', false
  );
END;
$$;

REVOKE EXECUTE ON FUNCTION public.buy_energy_refill_once(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.buy_energy_refill_once(TEXT) TO anon;
GRANT EXECUTE ON FUNCTION public.buy_energy_refill_once(TEXT) TO authenticated;
