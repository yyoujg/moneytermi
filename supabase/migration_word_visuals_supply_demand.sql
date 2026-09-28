-- 수요·공급: 가격이 왜 오르고 내리는지. 기존 visuals(수요탄력성 표)는 유지하고 뒤에 붙인다.
UPDATE public.words
SET visuals = COALESCE(visuals, '[]'::jsonb) || '[
  {"type":"line","title":"수요와 공급이 만나는 곳이 가격 (붕어빵 예시)","unit":"개",
   "x":["500원","1,000원","1,500원","2,000원","2,500원"],
   "series":[{"name":"사려는 양(수요)","values":[100,80,60,40,20]},{"name":"팔려는 양(공급)","values":[20,40,60,80,100]}],
   "caption":"가격이 싸면 사려는 사람은 많고 팔려는 사람은 적어요.\n가격이 비싸면 반대예요.\n\n두 선이 만나는 1,500원에서 사려는 양과 팔려는 양이 같아져요.\n이 가격을 균형가격이라고 해요."},
  {"type":"table","title":"가격이 오르고 내리는 네 가지 경우","columns":["무슨 일이 생기면","가격","예시"],
   "rows":[["수요 증가","오름","한파에 패딩 수요 급증"],["수요 감소","내림","유행이 지난 옷"],["공급 감소","오름","태풍으로 배추 수확 감소"],["공급 증가","내림","풍년으로 쌀 생산 증가"]]}
]'::jsonb
WHERE id IN (317, 52);

-- 수요견인 인플레이션은 네 가지 경우 표만
UPDATE public.words
SET visuals = COALESCE(visuals, '[]'::jsonb) || '[
  {"type":"table","title":"가격이 오르고 내리는 네 가지 경우","columns":["무슨 일이 생기면","가격","예시"],
   "rows":[["수요 증가","오름","한파에 패딩 수요 급증"],["수요 감소","내림","유행이 지난 옷"],["공급 감소","오름","태풍으로 배추 수확 감소"],["공급 증가","내림","풍년으로 쌀 생산 증가"]]}
]'::jsonb
WHERE id = 316;

SELECT id, word, jsonb_array_length(visuals) AS n FROM public.words WHERE id IN (52, 316, 317) ORDER BY id;
