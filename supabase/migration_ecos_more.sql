-- 한국은행 ECOS 실제 통계 그래프 16개. 두 선 겹치기(series)·단위 환산(scale)은 앱 새 버전이 필요하다(PR 배포 후 보임).
-- 같은 제목이 이미 있으면 건너뛴다(다시 실행해도 중복 없음). 통계를 못 받는 카드는 앱이 알아서 숨긴다.
UPDATE public.words w SET visuals = COALESCE(w.visuals, '[]'::jsonb) || jsonb_build_array(v.vis)
FROM (VALUES
  (92, '{"type": "ecos", "title": "국고채 3년 금리 최근 5년", "stat": "721Y001", "item": "5020000", "cycle": "M", "unit": "%", "months": 60, "caption": "나라가 3년 동안 돈을 빌릴 때 내는 금리예요. 시장금리의 기준으로 많이 쓰여요."}'::jsonb),
  (749, '{"type": "ecos", "title": "기준금리와 시장금리(국고채 3년)", "stat": "722Y001", "item": "0101000", "cycle": "M", "unit": "%", "months": 60, "series": [{"name": "기준금리", "stat": "722Y001", "item": "0101000"}, {"name": "국고채 3년", "stat": "721Y001", "item": "5020000"}], "caption": "시장금리는 기준금리를 따라 움직이지만, 앞으로의 금리 예상을 먼저 반영해 미리 오르거나 내리기도 해요."}'::jsonb),
  (619, '{"type": "ecos", "title": "기준금리가 시장금리로 번지는 모습", "stat": "722Y001", "item": "0101000", "cycle": "M", "unit": "%", "months": 60, "series": [{"name": "기준금리", "stat": "722Y001", "item": "0101000"}, {"name": "국고채 3년", "stat": "721Y001", "item": "5020000"}], "caption": "기준금리를 올리기 시작하자 국고채 금리가 먼저, 더 크게 뛰었어요."}'::jsonb),
  (487, '{"type": "ecos", "title": "국고채 10년과 3년 금리", "stat": "721Y001", "item": "5050000", "cycle": "M", "unit": "%", "months": 60, "series": [{"name": "10년", "stat": "721Y001", "item": "5050000"}, {"name": "3년", "stat": "721Y001", "item": "5020000"}], "caption": "두 선 사이 간격이 장단기금리차예요. 간격이 좁아지거나 3년이 10년보다 높아지면(역전) 경기 둔화 신호로 봐요."}'::jsonb),
  (318, '{"type": "ecos", "title": "만기가 길수록 금리가 높을까", "stat": "721Y001", "item": "5050000", "cycle": "M", "unit": "%", "months": 60, "series": [{"name": "10년", "stat": "721Y001", "item": "5050000"}, {"name": "3년", "stat": "721Y001", "item": "5020000"}], "caption": "보통은 10년 금리가 3년보다 높아요. 이 순서가 뒤집히면 수익률곡선이 역전됐다고 해요."}'::jsonb),
  (391, '{"type": "ecos", "title": "예금금리와 대출금리", "stat": "121Y006", "item": "BECBLA01", "cycle": "M", "unit": "%", "months": 60, "series": [{"name": "대출", "stat": "121Y006", "item": "BECBLA01"}, {"name": "예금", "stat": "121Y002", "item": "BEABAA2"}], "caption": "대출금리와 예금금리의 간격이 은행이 버는 예대마진이에요. (신규 취급액 기준)"}'::jsonb),
  (524, '{"type": "ecos", "title": "코스피 지수 최근 5년", "stat": "901Y014", "item": "1070000", "cycle": "M", "unit": "", "months": 60, "caption": "우리나라 대표 주가지수예요. 월평균 값이에요."}'::jsonb),
  (800, '{"type": "ecos", "title": "코스피 지수 최근 5년", "stat": "901Y014", "item": "1070000", "cycle": "M", "unit": "", "months": 60, "caption": "주가들을 모아 만든 코스피 지수로 주식시장 전체 흐름을 볼 수 있어요."}'::jsonb),
  (26, '{"type": "ecos", "title": "경상수지 최근 5년 (월별)", "stat": "301Y013", "item": "000000", "cycle": "M", "unit": "억 달러", "months": 60, "scale": 0.01, "caption": "0보다 위면 흑자, 아래면 적자예요. 수출이 잘되면 흑자가 커져요."}'::jsonb),
  (750, '{"type": "ecos", "title": "통화량(M2) 최근 5년", "stat": "161Y006", "item": "BBHA00", "cycle": "M", "unit": "조 원", "months": 60, "scale": 0.001, "caption": "시중에 풀린 돈이 꾸준히 늘어 왔어요. (계절조정, 평잔)"}'::jsonb),
  (55, '{"type": "ecos", "title": "광의통화(M2) 최근 5년", "stat": "161Y006", "item": "BBHA00", "cycle": "M", "unit": "조 원", "months": 60, "scale": 0.001, "caption": "현금과 바로 꺼내 쓸 수 있는 예금, 2년 미만 금융상품까지 모두 합친 돈의 양이에요."}'::jsonb),
  (410, '{"type": "ecos", "title": "외환보유액 최근 5년", "stat": "732Y001", "item": "99", "cycle": "M", "unit": "억 달러", "months": 60, "scale": 1e-05, "caption": "위기 때 쓰려고 한국은행과 정부가 쌓아 둔 달러 등 외화예요."}'::jsonb),
  (30, '{"type": "ecos", "title": "경제심리지수 최근 5년", "stat": "513Y001", "item": "E1000", "cycle": "M", "unit": "", "months": 60, "caption": "100보다 높으면 기업과 소비자가 경제를 평소보다 좋게 본다는 뜻이에요."}'::jsonb),
  (311, '{"type": "ecos", "title": "소비자심리지수 최근 5년", "stat": "511Y002", "item": "FME/99988", "cycle": "M", "unit": "", "months": 60, "caption": "100보다 높으면 소비자들이 경기를 낙관한다는 뜻이에요."}'::jsonb),
  (286, '{"type": "ecos", "title": "생산자물가지수 최근 5년", "stat": "404Y014", "item": "*AA", "cycle": "M", "unit": "", "months": 60, "caption": "기업끼리 거래하는 물건 값이에요. 보통 몇 달 뒤 소비자물가에 반영돼요. (2020년 = 100)"}'::jsonb),
  (322, '{"type": "ecos", "title": "수입물가지수 최근 5년", "stat": "401Y015", "item": "*AA/W", "cycle": "M", "unit": "", "months": 60, "caption": "원화로 따진 수입품 값이에요. 환율과 국제 원자재 값이 오르면 함께 올라요. (2020년 = 100)"}'::jsonb)
) AS v(id, vis)
WHERE w.id = v.id
  AND NOT COALESCE(w.visuals, '[]'::jsonb) @> jsonb_build_array(jsonb_build_object('title', v.vis->>'title'));

SELECT id, word, jsonb_array_length(visuals) AS n FROM public.words WHERE id IN (92, 749, 619, 487, 318, 391, 524, 800, 26, 750, 55, 410, 30, 311, 286, 322) ORDER BY id;
