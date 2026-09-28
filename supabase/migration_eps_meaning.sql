-- 주당순이익(EPS) 뜻을 쉬운 말로 (meanings.py 527과 같은 내용)
UPDATE public.words SET meaning = '회사가 1년 동안 번 순이익을 주식 수로 나눈 값. 주식 1주가 1년에 번 돈' WHERE id = 527;

SELECT id, word, meaning FROM public.words WHERE id = 527;
