-- New guests send only guest_token. Other profile fields use server defaults.
-- The live points default is 100, so the old points = 0 policy rejects new guests.
-- INSERT (guest_token) is the only insert grant for anon, so callers cannot set points or tier.
REVOKE INSERT ON public.profiles FROM anon;
GRANT INSERT (guest_token) ON public.profiles TO anon;

DROP POLICY IF EXISTS "profiles_insert" ON public.profiles;

CREATE POLICY "profiles_insert" ON public.profiles
  FOR INSERT TO anon
  WITH CHECK (
    guest_token = NULLIF(current_setting('request.headers', true)::jsonb->>'x-guest-token', '')::uuid
    AND auth_id IS NULL
    AND email IS NULL
    AND is_guest = true
  );
