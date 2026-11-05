-- apply-2.sql 되돌리기
update public.words as w
set visuals = jsonb_set(w.visuals, array[c.idx::text, 'title'], to_jsonb(c.old_title))
from (values
  (642, 0, '실업률과 물가상승률의 상충관계', '실업률이 낮으면 물가가 올라요'),
  (1045, 2, '평균과 한계의 관계', '한계비용이 평균보다 크면 평균비용이 올라요')
) as c(id, idx, old_title, new_title)
where w.id = c.id
  and w.visuals -> c.idx ->> 'title' = c.new_title
returning w.id, w.word, w.visuals -> c.idx ->> 'title' as title;
