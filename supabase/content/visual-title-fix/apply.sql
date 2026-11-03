-- 규모의 경제(id 94) 자세히 보기 소제목을 핵심이 드러나게 바꾼다.
-- 제목이 검토 때와 다르면 아무것도 바꾸지 않는다.
update public.words
set visuals = jsonb_set(visuals, '{2,title}', to_jsonb('규모의 경제와 규모에 대한 수익은 달라요'::text))
where id = 94
  and word = '규모의 경제'
  and visuals -> 2 ->> 'type' = 'text'
  and visuals -> 2 ->> 'title' = '규모에 대한 수익과의 관계'
returning id, word, visuals -> 2 ->> 'title' as title;
