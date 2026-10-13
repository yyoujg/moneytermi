-- ECOS 지수형 통계 카드의 단위 표시 보강.
-- LineChart 범례는 값 뒤에 unit을 그대로 붙이므로 지수형 자료는 p(point)로 통일한다.

UPDATE public.words AS w
SET visuals = (
  SELECT jsonb_agg(
    CASE
      WHEN visual->>'type' = 'ecos'
        AND COALESCE(btrim(visual->>'unit'), '') = ''
      THEN jsonb_set(visual, '{unit}', '"p"'::jsonb, true)
      ELSE visual
    END
    ORDER BY ord
  )
  FROM jsonb_array_elements(COALESCE(w.visuals, '[]'::jsonb)) WITH ORDINALITY AS v(visual, ord)
)
WHERE id IN (30, 219, 286, 310, 311, 322, 454, 524, 800);
