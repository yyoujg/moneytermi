-- 스마트 발송(기능성 메시지) 대상 식별용 컬럼 + 매일 발송 스케줄
-- Toss bulk-send API는 사용자별 정수 userKey가 필요하므로 profiles에 저장한다.

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS toss_user_key      BIGINT  UNIQUE,
  ADD COLUMN IF NOT EXISTS notification_agreed BOOLEAN NOT NULL DEFAULT false;

-- 발송 대상 조회용 부분 인덱스
CREATE INDEX IF NOT EXISTS idx_profiles_push_targets
  ON public.profiles (toss_user_key)
  WHERE notification_agreed AND toss_user_key IS NOT NULL;

-- ─────────────────────────────────────────────────────────────
-- 매일 오전 9시(KST) DAILY_TERM_PUSH 발송 (pg_cron + pg_net)
-- 사전 준비:
--   1) 대시보드 Database > Extensions 에서 pg_cron, pg_net 활성화
--   2) Vault 에 service_role 키 저장:
--      select vault.create_secret('<SERVICE_ROLE_KEY>', 'daily_term_push_key');
--   3) 아래 <PROJECT_REF> 를 실제 프로젝트 ref 로 치환
-- ─────────────────────────────────────────────────────────────
-- select cron.schedule(
--   'daily-term-push',
--   '0 0 * * *',  -- UTC 00:00 = KST 09:00
--   $$
--   select net.http_post(
--     url     := 'https://<PROJECT_REF>.supabase.co/functions/v1/daily-term-push',
--     headers := jsonb_build_object(
--       'Content-Type', 'application/json',
--       'Authorization', 'Bearer ' || (select decrypted_secret from vault.decrypted_secrets where name = 'daily_term_push_key')
--     ),
--     body    := '{}'::jsonb
--   );
--   $$
-- );
