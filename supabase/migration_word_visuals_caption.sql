-- 복리·단리 그래프 캡션 교체 (migration_word_visuals.sql에도 반영됨)
UPDATE public.words SET visuals = jsonb_set(visuals, '{0,caption}', to_jsonb('단리: 처음 넣은 100만 원에만 이자가 붙어요.
1년 +10만 → 2년 +10만 → 3년 +10만

복리: 통장에 있는 돈 전체에 이자가 붙어요.
1년 +10만 → 2년 +11만 → 3년 +12.1만
작년 이자도 올해 이자를 만들어요.

10년째 한 해 이자는 단리 10만 원, 복리 23.6만 원이에요.
(세금·수수료 제외 예시)'::text)) WHERE id IN (724, 167) AND visuals->0->>'type' = 'line';
