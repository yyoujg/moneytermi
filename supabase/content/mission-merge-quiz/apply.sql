-- 퀘스트 퀴즈 미션 하나로 합치기: '퀴즈 정답 10회 맞히기'(m4)를 끄고 '퀴즈 정답 3회 맞히기'(m3)만 남긴다.
-- 두 미션은 같은 정답 하나로 함께 오르고 보상도 같은 +5XP라 중복이었다. 앱은 active=true인 미션만 불러오므로 앱 변경은 없다.
-- 서버는 m4 진행도를 계속 올리지만 화면에 보이지 않는다. 오늘 m4를 채우고 아직 받지 않은 보상은 받을 수 없게 된다.
-- 정의가 검토 때와 다르면(제목·활성 상태) 아무것도 바꾸지 않고 중단한다.
DO $merge_quiz_mission$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.mission_defs WHERE mission_id = 'm3' AND active AND title = '퀴즈 정답 3회 맞히기') THEN
    RAISE EXCEPTION 'm3 definition changed since review';
  END IF;
  UPDATE public.mission_defs SET active = false
  WHERE mission_id = 'm4' AND active AND title = '퀴즈 정답 10회 맞히기';
  IF NOT FOUND THEN RAISE EXCEPTION 'm4 definition changed since review or already inactive'; END IF;
END
$merge_quiz_mission$;
