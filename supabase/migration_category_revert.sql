-- 카테고리 복구: 2개 → 4개
-- Supabase 대시보드 → SQL Editor → 붙여넣기 → Run

UPDATE public.courses SET category = '경제일반' WHERE id IN ('bok_1','bok_2','bok_3','bok_4','bok_5');
UPDATE public.courses SET category = '거시경제'  WHERE id IN ('bok_6','bok_7','bok_8','bok_9','bok_10','bok_11','bok_12','bok_13','bok_14','bok_15','bok_16','bok_17','bok_18','bok_19');
UPDATE public.courses SET category = '주식/기업' WHERE id IN ('bok_32','bok_33','bok_34');
