-- 단어 출처(여러 개). 기존 1~747 = 한국은행 경제금융용어 800선 기반(뜻은 앱에서 다시 씀). 머니터미가 쓴 새 단어는 빈 배열.
-- 같은 용어는 한 번만 두고 출처만 더한다(예: 'tesat').
ALTER TABLE public.words ADD COLUMN IF NOT EXISTS sources TEXT[] NOT NULL DEFAULT '{}';
UPDATE public.words SET sources = array_append(sources, 'bok800') WHERE id <= 747 AND NOT ('bok800' = ANY(sources));
NOTIFY pgrst, 'reload schema';

SELECT sources, count(*) FROM public.words GROUP BY 1;
