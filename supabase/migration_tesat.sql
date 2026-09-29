-- TESAT 연결. 먼저 words_bok/18_words_new.sql을 다시 실행(새 단어 802~842, sources 포함)한 뒤 이 파일을 실행한다.
-- 1) 기존 단어 중 TESAT 공부방 주제와 겹치는 160개에 출처 'tesat' 추가 (제목 대조, 오탐 3개 제외 + 동의어 5개)
UPDATE public.words SET sources = array_append(sources, 'tesat')
WHERE id IN (6, 9, 26, 39, 46, 49, 56, 59, 62, 63, 69, 74, 75, 77, 78, 80, 84, 85, 88, 91, 92, 94, 95, 98, 108, 111, 124, 129, 135, 141, 142, 149, 170, 181, 185, 191, 202, 205, 218, 219, 221, 233, 241, 244, 255, 260, 266, 267, 272, 276, 280, 295, 296, 310, 315, 317, 334, 336, 337, 344, 353, 355, 364, 373, 382, 383, 388, 392, 396, 397, 406, 410, 412, 428, 436, 454, 463, 465, 466, 467, 468, 476, 477, 479, 484, 490, 491, 509, 511, 521, 522, 523, 528, 536, 537, 550, 551, 556, 562, 570, 577, 578, 583, 587, 589, 590, 592, 593, 599, 600, 608, 611, 612, 617, 622, 627, 632, 634, 642, 643, 644, 645, 646, 650, 652, 673, 678, 691, 693, 694, 704, 714, 717, 721, 722, 750, 751, 752, 753, 754, 755, 759, 760, 764, 780, 782, 783, 784, 785, 787, 788, 789, 791, 792, 794, 795, 796, 798, 799, 801) AND NOT ('tesat' = ANY(sources));

-- 2) 새 단어 41개를 코스 끝에 붙인다. 같은 레벨·주제 코스가 없으면(작은 주제가 합쳐진 경우) 그 레벨의 첫 코스로.
--    코스를 새로 만들지 않아 사용자의 퀴즈 완료 기록은 그대로다.
INSERT INTO public.course_words (course_id, word_id, position)
SELECT c.cid, v.word_id,
       (SELECT COALESCE(max(position), 0) FROM public.course_words WHERE course_id = c.cid) + row_number() OVER (PARTITION BY c.cid ORDER BY v.word_id)
FROM (VALUES
  (802, 'l1_t05_1', '기초'),
  (803, 'l3_t01_1', '고급'),
  (804, 'l2_t13_1', '중급'),
  (805, 'l3_t13_1', '고급'),
  (806, 'l2_t01_1', '중급'),
  (807, 'l2_t01_1', '중급'),
  (808, 'l2_t01_1', '중급'),
  (809, 'l1_t17_1', '기초'),
  (810, 'l2_t01_1', '중급'),
  (811, 'l3_t08_1', '고급'),
  (812, 'l2_t01_1', '중급'),
  (813, 'l2_t04_1', '중급'),
  (814, 'l3_t02_1', '고급'),
  (815, 'l2_t06_1', '중급'),
  (816, 'l2_t01_1', '중급'),
  (817, 'l2_t13_1', '중급'),
  (818, 'l3_t04_1', '고급'),
  (819, 'l3_t13_1', '고급'),
  (820, 'l1_t08_1', '기초'),
  (821, 'l2_t17_1', '중급'),
  (822, 'l2_t17_1', '중급'),
  (823, 'l2_t17_1', '중급'),
  (824, 'l2_t11_1', '중급'),
  (825, 'l3_t13_1', '고급'),
  (826, 'l4_t06_1', '심화'),
  (827, 'l3_t05_1', '고급'),
  (828, 'l2_t15_1', '중급'),
  (829, 'l4_t12_1', '심화'),
  (830, 'l1_t08_1', '기초'),
  (831, 'l2_t17_1', '중급'),
  (832, 'l3_t05_1', '고급'),
  (833, 'l2_t12_1', '중급'),
  (834, 'l3_t05_1', '고급'),
  (835, 'l1_t11_1', '기초'),
  (836, 'l1_t17_1', '기초'),
  (837, 'l2_t11_1', '중급'),
  (838, 'l3_t11_1', '고급'),
  (839, 'l3_t05_1', '고급'),
  (840, 'l1_t09_1', '기초'),
  (841, 'l2_t10_1', '중급'),
  (842, 'l2_t01_1', '중급')
) AS v(word_id, want, lvl)
CROSS JOIN LATERAL (
  SELECT COALESCE(
    (SELECT id FROM public.courses WHERE id = v.want),
    (SELECT id FROM public.courses WHERE level = v.lvl ORDER BY sort_order LIMIT 1)) AS cid
) c
WHERE EXISTS (SELECT 1 FROM public.words w WHERE w.id = v.word_id)
  AND NOT EXISTS (SELECT 1 FROM public.course_words cw WHERE cw.word_id = v.word_id);

SELECT (SELECT count(*) FROM public.words WHERE 'tesat' = ANY(sources)) AS tesat_words,
       (SELECT count(*) FROM public.course_words WHERE word_id BETWEEN 802 AND 842) AS new_in_courses;   -- 201, 41
