-- 카테고리 통합: 4개 → 2개
-- 경제일반 + 거시경제 → 경제
-- 금융 + 주식/기업 → 금융
-- Supabase 대시보드 → SQL Editor → 붙여넣기 → Run

UPDATE public.courses SET category = '경제' WHERE category IN ('경제일반', '거시경제');
UPDATE public.courses SET category = '금융'  WHERE category = '주식/기업';
