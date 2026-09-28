-- PER 첫 설명 카드 제목 변경 (new_words.py와 같은 내용)
UPDATE public.words SET visuals = jsonb_set(visuals, '{0,title}', '"미리 알아둘 말"')
WHERE id = 755 AND visuals->0->>'title' = '먼저 두 단어부터';

SELECT id, word, visuals->0->>'title' AS first_title FROM public.words WHERE id = 755;
