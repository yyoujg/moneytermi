-- ===== 코스 재분류 4/4 (categories.py 생성) - 앞 번호 파일 다음에 실행 =====

INSERT INTO public.course_words (course_id, word_id, position) VALUES ('l4_t15_2',394,1), ('l4_t15_2',409,2), ('l4_t15_2',422,3), ('l4_t15_2',444,4), ('l4_t15_2',459,5), ('l4_t15_2',460,6), ('l4_t15_2',461,7), ('l4_t15_2',462,8), ('l4_t15_2',498,9), ('l4_t15_2',502,10), ('l4_t15_2',503,11), ('l4_t15_2',506,12), ('l4_t15_2',510,13), ('l4_t15_2',514,14), ('l4_t15_2',515,15), ('l4_t15_2',534,16), ('l4_t15_2',535,17), ('l4_t15_2',539,18), ('l4_t15_2',540,19);
INSERT INTO public.course_words (course_id, word_id, position) VALUES ('l4_t15_3',541,1), ('l4_t15_3',543,2), ('l4_t15_3',544,3), ('l4_t15_3',545,4), ('l4_t15_3',546,5), ('l4_t15_3',547,6), ('l4_t15_3',553,7), ('l4_t15_3',558,8), ('l4_t15_3',561,9), ('l4_t15_3',567,10), ('l4_t15_3',574,11), ('l4_t15_3',575,12), ('l4_t15_3',581,13), ('l4_t15_3',648,14), ('l4_t15_3',659,15), ('l4_t15_3',681,16), ('l4_t15_3',695,17), ('l4_t15_3',726,18), ('l4_t15_3',727,19);
INSERT INTO public.course_words (course_id, word_id, position) VALUES ('l4_t17_1',568,1), ('l4_t17_1',697,2), ('l4_t17_1',774,3), ('l4_t17_1',775,4), ('l4_t17_1',776,5);

NOTIFY pgrst, 'reload schema';

-- 확인:
-- SELECT count(*) FROM public.courses;       -- 67
-- SELECT count(*) FROM public.course_words;  -- 1000
-- SELECT category, count(*) FROM public.courses c JOIN public.course_words cw ON cw.course_id = c.id GROUP BY 1 ORDER BY min(sort_order);
