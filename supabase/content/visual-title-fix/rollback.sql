-- apply.sql 되돌리기
update public.words
set visuals = jsonb_set(visuals, '{2,title}', to_jsonb('규모에 대한 수익과의 관계'::text))
where id = 94
  and visuals -> 2 ->> 'title' = '규모의 경제와 규모에 대한 수익은 달라요'
returning id, word, visuals -> 2 ->> 'title' as title;
