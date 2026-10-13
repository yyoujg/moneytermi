-- 단어/퀴즈 데이터 품질 보강.
-- 1) 빈칸 퀴즈가 동작하도록 news_example에 단어명을 정확히 포함
-- 2) learning_example이 없는 단어에 기존 뜻/상세 설명 기반 쉬운 예시 보강
-- 3) 레슨 체크가 없는 코스마다 대표 단어 1개에 복습 퀴즈 추가
-- 4) related_words를 실제 등록된 단어명으로만 정리하고, 슬래시 묶음은 등록 단어로 펼침

UPDATE public.words
SET news_example = '매매가-전세보증금 차이가 줄어든 지역에서 갭투자와 보증금 반환 위험이 함께 거론됐다.'
WHERE id = 1216
  AND word = '매매가-전세보증금 차이';

UPDATE public.words
SET news_example = '사기죄 여부를 판단할 때는 전세보증금 미반환 사실뿐 아니라 계약 당시 기망행위와 반환 능력을 함께 본다.'
WHERE id = 1222
  AND word = '사기죄';

WITH missing_examples AS (
  SELECT
    id,
    '학습용 가정: ' || word || '을 이해할 때는 "' ||
      regexp_replace(btrim(meaning), '[.!?。]+$', '') ||
      '"을 먼저 떠올리면 쉬워요.' ||
      CASE
        WHEN btrim(COALESCE((regexp_match(detailed_meaning, '^([^.!?。]+[.!?。]?)'))[1], '')) = '' THEN ''
        ELSE ' ' || btrim((regexp_match(detailed_meaning, '^([^.!?。]+[.!?。]?)'))[1])
      END AS example
  FROM public.words
  WHERE learning_example IS NULL
     OR btrim(learning_example) = ''
)
UPDATE public.words AS w
SET learning_example = m.example
FROM missing_examples AS m
WHERE w.id = m.id;

WITH courses_without_check AS (
  SELECT c.id, c.category
  FROM public.courses AS c
  WHERE NOT EXISTS (
    SELECT 1
    FROM public.course_words AS cw
    JOIN public.words AS w ON w.id = cw.word_id
    CROSS JOIN LATERAL jsonb_array_elements(COALESCE(w.visuals, '[]'::jsonb)) AS v(item)
    WHERE cw.course_id = c.id
      AND v.item->>'type' = 'quiz'
      AND v.item->>'lessonCheck' = 'true'
      AND btrim(COALESCE(v.item->>'explanation', '')) <> ''
  )
),
target_course_words AS (
  SELECT DISTINCT ON (c.id)
    c.id AS course_id,
    c.category,
    cw.word_id
  FROM courses_without_check AS c
  JOIN public.course_words AS cw ON cw.course_id = c.id
  JOIN public.words AS w ON w.id = cw.word_id
  ORDER BY c.id, cw.position
),
target_words AS (
  SELECT DISTINCT ON (word_id)
    course_id,
    category,
    word_id
  FROM target_course_words
  ORDER BY word_id, course_id
),
quiz_payload AS (
  SELECT
    tw.word_id,
    jsonb_build_object(
      'type', 'quiz',
      'lessonCheck', true,
      'q', '다음 설명에 가장 가까운 용어는 무엇일까요? ' || w.meaning,
      'options', to_jsonb(ARRAY[w.word] || d.options),
      'answer', 0,
      'explanation', w.word || '은/는 ' || w.meaning || ' 이 설명과 연결해 기억하면 쉬워요.'
    ) AS quiz
  FROM target_words AS tw
  JOIN public.words AS w ON w.id = tw.word_id
  CROSS JOIN LATERAL (
    SELECT array_agg(candidate.word ORDER BY candidate.tier, candidate.sort_key) AS options
    FROM (
      SELECT
        w2.word,
        CASE WHEN bool_or(c2.category = tw.category) THEN 0 ELSE 1 END AS tier,
        md5(tw.course_id || ':' || w2.id::text) AS sort_key
      FROM public.words AS w2
      LEFT JOIN public.course_words AS cw2 ON cw2.word_id = w2.id
      LEFT JOIN public.courses AS c2 ON c2.id = cw2.course_id
      WHERE w2.id <> w.id
        AND left(regexp_replace(split_part(w2.word, '(', 1), '\s+', '', 'g'), 3)
          <> left(regexp_replace(split_part(w.word, '(', 1), '\s+', '', 'g'), 3)
      GROUP BY w2.id, w2.word
      ORDER BY tier, sort_key
      LIMIT 3
    ) AS candidate
  ) AS d
  WHERE cardinality(d.options) = 3
)
UPDATE public.words AS w
SET visuals = COALESCE(w.visuals, '[]'::jsonb) || jsonb_build_array(q.quiz)
FROM quiz_payload AS q
WHERE w.id = q.word_id
  AND NOT EXISTS (
    SELECT 1
    FROM jsonb_array_elements(COALESCE(w.visuals, '[]'::jsonb)) AS v(item)
    WHERE v.item->>'type' = 'quiz'
      AND v.item->>'lessonCheck' = 'true'
  );

WITH existing_words AS (
  SELECT word
  FROM public.words
),
expanded_related AS (
  SELECT
    w.id,
    mapped.word AS name,
    min(r.ord) AS first_ord
  FROM public.words AS w
  CROSS JOIN LATERAL unnest(COALESCE(w.related_words, '{}'::text[])) WITH ORDINALITY AS r(raw_name, ord)
  CROSS JOIN LATERAL (
    SELECT btrim(r.raw_name) AS candidate
    UNION ALL
    SELECT btrim(regexp_replace(r.raw_name, '\s*\([^)]*\)\s*$', ''))
    UNION ALL
    SELECT btrim(part)
    FROM regexp_split_to_table(r.raw_name, '/') AS part
  ) AS candidates
  JOIN existing_words AS mapped ON mapped.word = candidates.candidate
  WHERE candidates.candidate <> ''
    AND mapped.word <> w.word
  GROUP BY w.id, mapped.word
),
normalized_related AS (
  SELECT
    id,
    array_agg(name ORDER BY first_ord, name) AS related_words
  FROM expanded_related
  GROUP BY id
),
related_updates AS (
  SELECT
    w.id,
    COALESCE(n.related_words, '{}'::text[]) AS related_words
  FROM public.words AS w
  LEFT JOIN normalized_related AS n ON n.id = w.id
  WHERE w.related_words IS NOT NULL
    AND w.related_words IS DISTINCT FROM COALESCE(n.related_words, '{}'::text[])
)
UPDATE public.words AS w
SET related_words = u.related_words
FROM related_updates AS u
WHERE w.id = u.id;
