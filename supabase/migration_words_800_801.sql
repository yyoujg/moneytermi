-- 새 기초어 2개(주가, 순이익). 18_words_new.sql을 다시 실행하면 단어가 들어가고(이미 있는 52개는 덮어쓰기라 안전),
-- 아래는 코스 전체를 다시 만들지 않고 '기초 · 주식·채권시장' 코스 끝에만 붙인다.
INSERT INTO public.course_words (course_id, word_id, position)
SELECT 'l1_t08_1', w.id, (SELECT COALESCE(max(position), 0) FROM public.course_words WHERE course_id = 'l1_t08_1') + row_number() OVER (ORDER BY w.id)
FROM public.words w
WHERE w.id IN (800, 801) AND NOT EXISTS (SELECT 1 FROM public.course_words cw WHERE cw.word_id = w.id);

SELECT cw.course_id, cw.word_id, w.word, cw.position FROM public.course_words cw JOIN public.words w ON w.id = cw.word_id WHERE cw.word_id IN (800, 801);
