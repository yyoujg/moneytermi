-- 확인(읽기 전용): m4만 active=false이고 나머지 4개(m1·m2·m3·m5)는 true여야 한다.
SELECT mission_id, title, target, active FROM public.mission_defs ORDER BY sort_order;
