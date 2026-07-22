-- ============================================================
-- 머니터미 (MoneyTermi) Supabase Schema
-- Supabase 대시보드 → SQL Editor → 전체 붙여넣기 → Run
-- ============================================================


-- ──────────────────────────────────────────
-- 0. 기존 객체 전부 삭제
-- ──────────────────────────────────────────
DROP VIEW  IF EXISTS public.league_rankings   CASCADE;
DROP TABLE IF EXISTS public.attendance        CASCADE;
DROP TABLE IF EXISTS public.daily_missions    CASCADE;
DROP TABLE IF EXISTS public.word_progress     CASCADE;
DROP TABLE IF EXISTS public.profiles          CASCADE;
DROP FUNCTION IF EXISTS public.set_updated_at CASCADE;


-- ──────────────────────────────────────────
-- 1. profiles
--    guest_token        : 게스트 식별용 UUID (localStorage에 저장)
--    auth_id            : Supabase Auth UID (이메일 OTP 연결 후 채워짐)
--    toss_anonymous_key : 토스 getAnonymousKey hash (재설치/기기변경 복구용)
-- ──────────────────────────────────────────
CREATE TABLE public.profiles (
  id                 UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  guest_token        UUID        UNIQUE NOT NULL DEFAULT gen_random_uuid(),
  toss_anonymous_key TEXT        UNIQUE,
  auth_id            UUID        UNIQUE REFERENCES auth.users(id) ON DELETE SET NULL,
  nickname           TEXT        NOT NULL DEFAULT '예비슈퍼개미',
  email              TEXT        UNIQUE,
  is_guest           BOOLEAN     NOT NULL DEFAULT true,
  league_tier        TEXT        NOT NULL DEFAULT 'bronze'
                                 CHECK (league_tier IN ('bronze','silver','gold','platinum','diamond')),
  points             INTEGER     NOT NULL DEFAULT 0 CHECK (points >= 0),
  emoji              TEXT        NOT NULL DEFAULT '🍊',
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ──────────────────────────────────────────
-- 2. word_progress
-- ──────────────────────────────────────────
CREATE TABLE public.word_progress (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  word_id    INTEGER     NOT NULL,
  status     TEXT        NOT NULL CHECK (status IN ('known', 'unknown')),
  -- SRS 간격반복 (SM-2 lite). 첫 학습 시 due_date는 앱에서 +1일로 시드.
  ease       NUMERIC     NOT NULL DEFAULT 2.5,
  interval_d INTEGER     NOT NULL DEFAULT 0,
  reps       INTEGER     NOT NULL DEFAULT 0,
  due_date   DATE        NOT NULL DEFAULT CURRENT_DATE,
  last_grade SMALLINT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, word_id)
);
CREATE INDEX IF NOT EXISTS idx_wp_due ON public.word_progress(user_id, due_date);

-- ──────────────────────────────────────────
-- 3. daily_missions
-- ──────────────────────────────────────────
CREATE TABLE public.daily_missions (
  id          UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID    NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  mission_id  TEXT    NOT NULL CHECK (mission_id IN ('m1', 'm2', 'm3')),
  date        DATE    NOT NULL DEFAULT CURRENT_DATE,
  current     INTEGER NOT NULL DEFAULT 0 CHECK (current >= 0),
  is_rewarded BOOLEAN NOT NULL DEFAULT false,
  UNIQUE (user_id, mission_id, date)
);

-- ──────────────────────────────────────────
-- 4. attendance
-- ──────────────────────────────────────────
CREATE TABLE public.attendance (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  date       DATE        NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, date)
);

-- ──────────────────────────────────────────
-- 5. 인덱스
-- ──────────────────────────────────────────
CREATE INDEX idx_profiles_guest_token   ON public.profiles(guest_token);
CREATE INDEX idx_profiles_auth_id       ON public.profiles(auth_id);
CREATE INDEX idx_word_progress_user     ON public.word_progress(user_id);
CREATE INDEX idx_daily_missions_user    ON public.daily_missions(user_id, date);
CREATE INDEX idx_attendance_user        ON public.attendance(user_id);

-- ──────────────────────────────────────────
-- 6. updated_at 자동 갱신 트리거
-- ──────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_word_progress_updated_at
  BEFORE UPDATE ON public.word_progress
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ──────────────────────────────────────────
-- 7. Row Level Security
--    게스트: guest_token 으로 식별
--    로그인: auth.uid() 으로 식별
-- ──────────────────────────────────────────
ALTER TABLE public.profiles       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.word_progress  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance     ENABLE ROW LEVEL SECURITY;

-- profiles ───────────────────────────────
-- anon 이 guest_token 으로 자기 행 조회/수정
CREATE POLICY "profiles_select" ON public.profiles
  FOR SELECT USING (
    auth_id = auth.uid()
    OR guest_token = (current_setting('request.headers', true)::json->>'x-guest-token')::uuid
  );

-- 최초 게스트 생성만 허용. points/league_tier 등을 지정한 프로필 주입 차단
-- (실제 컬럼 제한은 아래 8번 컬럼 단위 GRANT 가 담당, 이 정책은 이중 방어)
CREATE POLICY "profiles_insert" ON public.profiles
  FOR INSERT WITH CHECK (
    auth_id     IS NULL
    AND email   IS NULL
    AND is_guest    = true
    AND points      = 0
    AND league_tier = 'bronze'
  );

CREATE POLICY "profiles_update" ON public.profiles
  FOR UPDATE USING (
    auth_id = auth.uid()
    OR guest_token = (current_setting('request.headers', true)::json->>'x-guest-token')::uuid
  );

-- word_progress ──────────────────────────
CREATE POLICY "word_progress_own" ON public.word_progress
  FOR ALL USING (
    user_id IN (
      SELECT id FROM public.profiles
      WHERE auth_id = auth.uid()
         OR guest_token = (current_setting('request.headers', true)::json->>'x-guest-token')::uuid
    )
  );

-- daily_missions ─────────────────────────
CREATE POLICY "daily_missions_own" ON public.daily_missions
  FOR ALL USING (
    user_id IN (
      SELECT id FROM public.profiles
      WHERE auth_id = auth.uid()
         OR guest_token = (current_setting('request.headers', true)::json->>'x-guest-token')::uuid
    )
  );

-- attendance ─────────────────────────────
CREATE POLICY "attendance_own" ON public.attendance
  FOR ALL USING (
    user_id IN (
      SELECT id FROM public.profiles
      WHERE auth_id = auth.uid()
         OR guest_token = (current_setting('request.headers', true)::json->>'x-guest-token')::uuid
    )
  );

-- ──────────────────────────────────────────
-- 8. anon 롤 권한 부여 (RLS가 실제 접근을 제한하지만, 테이블 접근 자체는 허용)
-- ──────────────────────────────────────────
-- profiles 는 컬럼 단위로 부여한다.
--   INSERT: guest_token 만 (나머지는 DEFAULT)
--   SELECT: guest_token(인증 자격증명) / auth_id / email 제외
--   UPDATE: migration_points_integrity.sql 에서 emoji, nickname 만으로 축소
GRANT INSERT (guest_token) ON public.profiles TO anon;
GRANT SELECT (id, nickname, emoji, league_tier, points, is_guest, created_at, updated_at)
  ON public.profiles TO anon;
GRANT UPDATE (nickname, emoji) ON public.profiles TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.word_progress  TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.daily_missions TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.attendance     TO anon;

-- ──────────────────────────────────────────
-- 9. 리그 랭킹 뷰
-- ──────────────────────────────────────────
CREATE OR REPLACE VIEW public.league_rankings AS
SELECT
  id,
  nickname,
  emoji,
  league_tier,
  points,
  RANK() OVER (PARTITION BY league_tier ORDER BY points DESC) AS rank_in_tier,
  RANK() OVER (ORDER BY points DESC)                          AS rank_overall
FROM public.profiles
ORDER BY points DESC;

-- ──────────────────────────────────────────
-- 10. 게스트 → 이메일 계정 승격 헬퍼 함수
--    클라이언트: supabase.rpc('link_guest_to_auth', { guest_token, auth_user_id, email })
-- ──────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.link_guest_to_auth(
  p_guest_token UUID,
  p_auth_user_id UUID,
  p_email TEXT
)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE public.profiles
  SET
    auth_id   = p_auth_user_id,
    email     = p_email,
    is_guest  = false,
    updated_at = now()
  WHERE guest_token = p_guest_token;
END;
$$;

-- ──────────────────────────────────────────
-- 11. 토스 익명 키(getAnonymousKey hash)로 프로필 조회/승격/생성 헬퍼 함수
--    클라이언트: supabase.rpc('resolve_profile_by_toss_key', { p_toss_key, p_guest_token })
--    SECURITY DEFINER: anon은 profiles_select 정책상 자기 행만 SELECT 가능이라
--    임의 toss_anonymous_key 조회가 정책을 못 통과하므로 필요.
-- ──────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.resolve_profile_by_toss_key(
  p_toss_key    TEXT,
  p_guest_token UUID DEFAULT NULL
)
RETURNS TABLE (
  out_id          UUID,
  out_guest_token UUID,
  out_nickname    TEXT,
  out_is_guest    BOOLEAN,
  out_league_tier TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE v_id UUID;
BEGIN
  IF p_toss_key IS NULL OR length(p_toss_key) < 8 THEN
    RAISE EXCEPTION 'invalid toss key';
  END IF;

  -- 1) 이미 연동된 프로필
  SELECT p.id INTO v_id FROM profiles p WHERE p.toss_anonymous_key = p_toss_key;

  -- 2) 기존 게스트 승격 (아직 키가 안 붙은 행만)
  IF v_id IS NULL AND p_guest_token IS NOT NULL THEN
    UPDATE profiles p
       SET toss_anonymous_key = p_toss_key, updated_at = now()
     WHERE p.guest_token = p_guest_token
       AND p.toss_anonymous_key IS NULL
    RETURNING p.id INTO v_id;
  END IF;

  -- 3) 신규 생성 (동시 호출 안전 — 경쟁 시 UNIQUE 위반 대신 기존 행 반환)
  IF v_id IS NULL THEN
    INSERT INTO profiles (toss_anonymous_key) VALUES (p_toss_key)
    ON CONFLICT (toss_anonymous_key) DO UPDATE SET updated_at = now()
    RETURNING profiles.id INTO v_id;
  END IF;

  RETURN QUERY
    SELECT p.id, p.guest_token, p.nickname, p.is_guest, p.league_tier
      FROM profiles p WHERE p.id = v_id;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.resolve_profile_by_toss_key(TEXT, UUID) FROM PUBLIC;
GRANT  EXECUTE ON FUNCTION public.resolve_profile_by_toss_key(TEXT, UUID) TO anon;
