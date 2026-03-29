-- 코스 통합: 34개 → 12개
-- Supabase 대시보드 → SQL Editor → 붙여넣기 → Run

-- ── 경제일반: 5개 → 2개 ──────────────────────────────────────────

UPDATE public.course_words SET course_id = 'bok_1' WHERE course_id = 'bok_2';
UPDATE public.courses SET title = '경제 기초와 트렌드', description = '가계 금융부터 새로운 경제 원리까지' WHERE id = 'bok_1';
DELETE FROM public.courses WHERE id = 'bok_2';

UPDATE public.course_words SET course_id = 'bok_3' WHERE course_id IN ('bok_4', 'bok_5');
UPDATE public.courses SET title = '생활 경제와 신용', description = '경제 심리, 생활 밀착형 경제, 핀테크까지' WHERE id = 'bok_3';
DELETE FROM public.courses WHERE id IN ('bok_4', 'bok_5');

-- ── 거시경제: 14개 → 4개 ─────────────────────────────────────────

UPDATE public.course_words SET course_id = 'bok_6' WHERE course_id = 'bok_7';
UPDATE public.courses SET title = '경기 지표와 흐름', description = '경기 지표, 정책, 경기 흐름과 통제' WHERE id = 'bok_6';
DELETE FROM public.courses WHERE id = 'bok_7';

UPDATE public.course_words SET course_id = 'bok_8' WHERE course_id IN ('bok_9', 'bok_10', 'bok_11');
UPDATE public.courses SET title = '국가 경제와 글로벌 지표', description = '국가 경제 성적표부터 글로벌 지표까지' WHERE id = 'bok_8';
DELETE FROM public.courses WHERE id IN ('bok_9', 'bok_10', 'bok_11');

UPDATE public.course_words SET course_id = 'bok_12' WHERE course_id IN ('bok_13', 'bok_14', 'bok_15');
UPDATE public.courses SET title = '국민소득과 글로벌 금융', description = '국민소득 심화, 글로벌 금융과 위기, 물가와 금리' WHERE id = 'bok_12';
DELETE FROM public.courses WHERE id IN ('bok_13', 'bok_14', 'bok_15');

UPDATE public.course_words SET course_id = 'bok_16' WHERE course_id IN ('bok_17', 'bok_18', 'bok_19');
UPDATE public.courses SET title = '위기, 통화 정책과 혁신', description = '경제 위기, 중앙은행 정책, 글로벌 심리까지' WHERE id = 'bok_16';
DELETE FROM public.courses WHERE id IN ('bok_17', 'bok_18', 'bok_19');

-- ── 금융: 12개 → 4개 ─────────────────────────────────────────────

UPDATE public.course_words SET course_id = 'bok_20' WHERE course_id IN ('bok_21', 'bok_22');
UPDATE public.courses SET title = '채권·대출·핀테크 기초', description = '채권, 대출, 미래 금융까지 한번에' WHERE id = 'bok_20';
DELETE FROM public.courses WHERE id IN ('bok_21', 'bok_22');

UPDATE public.course_words SET course_id = 'bok_23' WHERE course_id IN ('bok_24', 'bok_25');
UPDATE public.courses SET title = '생활 금융과 환율', description = '생활 금융, 디지털 트렌드, 금리와 환율' WHERE id = 'bok_23';
DELETE FROM public.courses WHERE id IN ('bok_24', 'bok_25');

UPDATE public.course_words SET course_id = 'bok_26' WHERE course_id IN ('bok_27', 'bok_28');
UPDATE public.courses SET title = '자본시장과 펀드', description = '통화, 시장 구조, 펀드와 자본시장' WHERE id = 'bok_26';
DELETE FROM public.courses WHERE id IN ('bok_27', 'bok_28');

UPDATE public.course_words SET course_id = 'bok_29' WHERE course_id IN ('bok_30', 'bok_31');
UPDATE public.courses SET title = '금융 제도와 위기 관리', description = '금융 정책, 국가 자본, 시스템 위기 관리' WHERE id = 'bok_29';
DELETE FROM public.courses WHERE id IN ('bok_30', 'bok_31');

-- ── 주식/기업: 3개 → 2개 ─────────────────────────────────────────

UPDATE public.course_words SET course_id = 'bok_32' WHERE course_id = 'bok_33';
UPDATE public.courses SET title = '기업과 주식 시장', description = '기업 자금, 경영, 주식 시장과 투자' WHERE id = 'bok_32';
DELETE FROM public.courses WHERE id = 'bok_33';
