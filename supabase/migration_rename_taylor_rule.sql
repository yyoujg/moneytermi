-- 607 단어명에서 영문 괄호(둥근 따옴표 포함)를 뺀다. 다른 단어의 related_words도 같이 바꾼다.
UPDATE public.words SET word = '테일러 준칙' WHERE id = 607;
UPDATE public.words SET related_words = array_replace(related_words, '테일러 준칙(Taylor’s Rule)', '테일러 준칙')
 WHERE '테일러 준칙(Taylor’s Rule)' = ANY(related_words);

NOTIFY pgrst, 'reload schema';

-- SELECT count(*) FROM public.words WHERE word LIKE '%Taylor%' OR '테일러 준칙(Taylor’s Rule)' = ANY(related_words);  -- 0
