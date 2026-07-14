-- SRS 초기 due_date 백필 (1회성, 수동 실행)
--
-- 배경: status-only upsert 시절 생성된 word_progress 행은 due_date가 DB 기본값
-- CURRENT_DATE(=학습일)로 채워져, 복습 전인데 즉시·영구히 복습 큐에 쌓인다.
-- 앱의 신규 시드 정책(첫 학습 = interval_d 1, due = 내일)에 맞춰 정리한다.
--
-- 안전장치: 복습 이력이 있는 행(last_grade IS NOT NULL)은 건드리지 않는다.
--          이미 미래로 스케줄된 행(due_date > 오늘)도 제외한다.
-- 날짜: KST(Asia/Seoul) 기준.
--
-- 실행 전 영향 행 수 확인:
--   SELECT count(*) FROM public.word_progress
--   WHERE last_grade IS NULL
--     AND due_date <= (now() AT TIME ZONE 'Asia/Seoul')::date;

UPDATE public.word_progress
SET interval_d = 1,
    reps       = 0,
    ease       = 2.5,
    due_date   = (now() AT TIME ZONE 'Asia/Seoul')::date + 1
WHERE last_grade IS NULL
  AND due_date <= (now() AT TIME ZONE 'Asia/Seoul')::date;
