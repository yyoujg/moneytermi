-- Apply before releasing the first-lesson entry button.
CREATE TABLE IF NOT EXISTS public.first_lesson_access (
  profile_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  course_id TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.first_lesson_access ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.first_lesson_access FROM anon, authenticated;

CREATE OR REPLACE FUNCTION public.claim_first_lesson(p_course_id TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_uid UUID := public.current_profile_id();
  v_first_course TEXT;
  v_claimed_course TEXT;
BEGIN
  IF v_uid IS NULL THEN RAISE EXCEPTION 'profile not found'; END IF;

  PERFORM 1 FROM public.profiles WHERE id = v_uid FOR UPDATE;
  SELECT id INTO v_first_course FROM public.courses ORDER BY sort_order, id LIMIT 1;
  IF p_course_id IS DISTINCT FROM v_first_course THEN RETURN FALSE; END IF;

  SELECT course_id INTO v_claimed_course
    FROM public.first_lesson_access WHERE profile_id = v_uid;
  IF FOUND THEN RETURN v_claimed_course = p_course_id; END IF;

  IF EXISTS (SELECT 1 FROM public.word_progress WHERE user_id = v_uid) THEN
    RETURN FALSE;
  END IF;

  INSERT INTO public.first_lesson_access (profile_id, course_id)
    VALUES (v_uid, p_course_id);
  RETURN TRUE;
END;
$$;

GRANT EXECUTE ON FUNCTION public.claim_first_lesson(TEXT) TO anon, authenticated;
