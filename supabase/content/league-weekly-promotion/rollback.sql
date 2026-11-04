-- league-weekly-promotion/apply.sql 되돌리기. 앱은 league_stage가 없으면 1단계로 보여 준다.
BEGIN;
DROP FUNCTION IF EXISTS public.settle_league();
DROP TABLE IF EXISTS public.league_settlements;
ALTER TABLE public.profiles DROP COLUMN IF EXISTS league_stage;
COMMIT;
