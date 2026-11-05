-- period-mission-rewards/apply.sql 되돌리기. 이미 지급한 XP는 회수하지 않는다. 앱은 테이블이 없으면 보상 칸을 숨긴다.
BEGIN;
DROP FUNCTION IF EXISTS public.claim_period_mission(text);
DROP TABLE IF EXISTS public.period_mission_rewards;
NOTIFY pgrst, 'reload schema';
COMMIT;
