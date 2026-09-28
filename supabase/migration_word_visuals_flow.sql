-- 기준금리가 물가에 닿는 경로. 기존 ECOS 그래프 뒤에 붙인다.
UPDATE public.words
SET visuals = COALESCE(visuals, '[]'::jsonb) || '[
  {"type":"flow","title":"기준금리를 올리면 물가가 잡히는 이유",
   "steps":["기준금리 ↑","대출금리 ↑","가계·기업의 이자 부담 ↑","소비·투자 ↓","물가 상승 압력 ↓"],
   "caption":"내리면 반대로 움직여요. 이자 부담이 줄어 소비·투자가 늘고 물가는 오를 수 있어요."}
]'::jsonb
WHERE id = 142;

SELECT id, word, jsonb_array_length(visuals) AS n FROM public.words WHERE id = 142;
