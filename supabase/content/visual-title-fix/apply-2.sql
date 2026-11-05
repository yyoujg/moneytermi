-- '…관계' 소제목 2개를 핵심이 드러나게 바꾼다. 제목이 검토 때와 다르면 그 행은 바꾸지 않는다.
-- 필립스곡선(642) 0번, 평균비용(1045) 2번
update public.words as w
set visuals = jsonb_set(w.visuals, array[c.idx::text, 'title'], to_jsonb(c.new_title))
from (values
  (642, 0, '실업률과 물가상승률의 상충관계', '실업률이 낮으면 물가가 올라요'),
  (1045, 2, '평균과 한계의 관계', '한계비용이 평균보다 크면 평균비용이 올라요')
) as c(id, idx, old_title, new_title)
where w.id = c.id
  and w.visuals -> c.idx ->> 'type' = 'text'
  and w.visuals -> c.idx ->> 'title' = c.old_title
returning w.id, w.word, w.visuals -> c.idx ->> 'title' as title;
