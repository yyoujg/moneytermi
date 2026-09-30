-- 기초 핵심 10개 용어의 레슨 끝 상황 확인 문제. 앱이 lessonCheck와 explanation을 읽는 버전부터 적용한다.
-- 각 용어에 같은 목적의 문제가 이미 있으면 추가하지 않는다.

UPDATE public.words SET visuals = COALESCE(visuals, '[]'::jsonb) || '[
  {"type":"quiz","lessonCheck":true,"q":"붕어빵을 사려는 사람이 늘었는데 굽는 양은 그대로예요. 시장 가격은 어떻게 될 가능성이 클까요?","options":["오른다","내린다","반드시 그대로다","거래가 중단된다"],"answer":0,"explanation":"사려는 양이 늘고 팔려는 양이 그대로면 같은 가격에서 부족해져요. 더 높은 가격에서 수요와 공급이 다시 맞춰질 가능성이 커요."}
]'::jsonb
WHERE id = 748 AND NOT COALESCE(visuals, '[]'::jsonb) @> '[{"type":"quiz","lessonCheck":true}]'::jsonb;

UPDATE public.words SET visuals = COALESCE(visuals, '[]'::jsonb) || '[
  {"type":"quiz","lessonCheck":true,"q":"한국은행의 기준금리는 그대로인데 국고채를 사려는 사람이 줄었어요. 국고채 시장금리는 어떻게 될 수 있을까요?","options":["오를 수 있다","반드시 그대로다","반드시 0%가 된다","기준금리와 늘 정확히 같다"],"answer":0,"explanation":"채권을 사려는 사람이 줄면 채권 가격이 내려가고 수익률인 시장금리는 오를 수 있어요. 시장금리는 기준금리의 영향을 받지만 수급에도 따라 움직여요."}
]'::jsonb
WHERE id = 749 AND NOT COALESCE(visuals, '[]'::jsonb) @> '[{"type":"quiz","lessonCheck":true}]'::jsonb;

UPDATE public.words SET visuals = COALESCE(visuals, '[]'::jsonb) || '[
  {"type":"quiz","lessonCheck":true,"q":"사람들이 지갑의 현금을 은행의 입출금 예금으로 옮겼어요. 통화량을 볼 때 이 예금은 어떻게 다뤄야 할까요?","options":["돈의 범위에 포함한다","현금이 아니므로 무조건 뺀다","주식으로 계산한다","나라의 빚으로만 계산한다"],"answer":0,"explanation":"통화량은 지폐와 동전만 세지 않아요. 언제든 꺼내 쓸 수 있는 입출금 예금도 돈의 범위에 포함돼요."}
]'::jsonb
WHERE id = 750 AND NOT COALESCE(visuals, '[]'::jsonb) @> '[{"type":"quiz","lessonCheck":true}]'::jsonb;

UPDATE public.words SET visuals = COALESCE(visuals, '[]'::jsonb) || '[
  {"type":"quiz","lessonCheck":true,"q":"1달러를 사는 데 1,300원 대신 1,400원이 필요해졌어요. 원화 가치에는 어떤 변화가 생겼나요?","options":["원화 가치가 떨어졌다","원화 가치가 올랐다","원화 가치는 변하지 않았다","달러가 없어졌다"],"answer":0,"explanation":"같은 1달러를 사는 데 더 많은 원화가 필요해졌으므로 원화 가치가 떨어진 거예요. 이를 원화 약세라고 해요."}
]'::jsonb
WHERE id = 751 AND NOT COALESCE(visuals, '[]'::jsonb) @> '[{"type":"quiz","lessonCheck":true}]'::jsonb;

UPDATE public.words SET visuals = COALESCE(visuals, '[]'::jsonb) || '[
  {"type":"quiz","lessonCheck":true,"q":"월급은 그대로인데 생활에 필요한 물건 가격이 전반적으로 올랐어요. 같은 월급으로 살 수 있는 양은 어떻게 될까요?","options":["줄어든다","늘어난다","반드시 그대로다","물건값과 관계없다"],"answer":0,"explanation":"물가가 전반적으로 오르면 같은 돈으로 살 수 있는 물건과 서비스가 줄어요. 인플레이션이 구매력을 낮추는 이유예요."}
]'::jsonb
WHERE id = 454 AND NOT COALESCE(visuals, '[]'::jsonb) @> '[{"type":"quiz","lessonCheck":true}]'::jsonb;

UPDATE public.words SET visuals = COALESCE(visuals, '[]'::jsonb) || '[
  {"type":"quiz","lessonCheck":true,"q":"물가가 지나치게 빠르게 오를 때 한국은행이 소비와 투자를 식히려고 쓸 수 있는 조치는?","options":["기준금리를 올린다","기준금리를 없앤다","정부 예산을 직접 삭감한다","모든 물건의 가격을 정한다"],"answer":0,"explanation":"기준금리를 올리면 대출 비용이 높아지고 소비와 투자가 줄 수 있어요. 한국은행이 물가 상승 압력을 낮추는 데 쓰는 대표적인 수단이에요."}
]'::jsonb
WHERE id = 142 AND NOT COALESCE(visuals, '[]'::jsonb) @> '[{"type":"quiz","lessonCheck":true}]'::jsonb;

UPDATE public.words SET visuals = COALESCE(visuals, '[]'::jsonb) || '[
  {"type":"quiz","lessonCheck":true,"q":"빵집이 밀가루를 사서 빵을 만들어 손님에게 팔았어요. 이 밀가루와 빵을 GDP에 어떻게 더할까요?","options":["최종 생산물인 빵의 가치만 더한다","밀가루와 빵의 가치를 모두 더한다","밀가루 가치만 더한다","둘 다 GDP에서 뺀다"],"answer":0,"explanation":"밀가루 값은 빵값에 이미 들어 있어요. 두 값을 모두 더하면 같은 생산을 중복 계산하므로 최종 생산물인 빵의 가치만 더해요."}
]'::jsonb
WHERE id = 69 AND NOT COALESCE(visuals, '[]'::jsonb) @> '[{"type":"quiz","lessonCheck":true}]'::jsonb;

UPDATE public.words SET visuals = COALESCE(visuals, '[]'::jsonb) || '[
  {"type":"quiz","lessonCheck":true,"q":"경기가 나빠지자 정부가 도로 건설 예산을 늘렸어요. 이 조치는 어떤 정책에 해당할까요?","options":["재정정책","통화정책","환율 고정","기업의 가격 정책"],"answer":0,"explanation":"정부가 예산을 더 쓰거나 세금을 조정해 경기에 영향을 주는 것은 재정정책이에요. 금리와 통화량을 조절하는 통화정책은 한국은행의 영역이에요."}
]'::jsonb
WHERE id = 491 AND NOT COALESCE(visuals, '[]'::jsonb) @> '[{"type":"quiz","lessonCheck":true}]'::jsonb;

UPDATE public.words SET visuals = COALESCE(visuals, '[]'::jsonb) || '[
  {"type":"quiz","lessonCheck":true,"q":"물가 상승 압력을 낮추려고 한국은행이 기준금리를 올렸어요. 이는 어떤 정책일까요?","options":["긴축 통화정책","확장 재정정책","정부의 감세 정책","기업의 할인 정책"],"answer":0,"explanation":"한국은행이 금리를 올려 돈을 빌리고 쓰는 양을 줄이려는 것은 긴축 통화정책이에요. 정부의 예산이나 세금 조정과 구분해요."}
]'::jsonb
WHERE id = 617 AND NOT COALESCE(visuals, '[]'::jsonb) @> '[{"type":"quiz","lessonCheck":true}]'::jsonb;

UPDATE public.words SET visuals = COALESCE(visuals, '[]'::jsonb) || '[
  {"type":"quiz","lessonCheck":true,"q":"100만 원에 연 10% 복리를 적용해 이자를 다시 맡겼어요. 2년 뒤 돈은 얼마일까요?","options":["121만 원","120만 원","110만 원","100만 원"],"answer":0,"explanation":"첫해에 100만 원이 110만 원이 되고, 둘째 해에는 110만 원의 10%인 11만 원이 붙어요. 합계는 121만 원이에요."}
]'::jsonb
WHERE id = 724 AND NOT COALESCE(visuals, '[]'::jsonb) @> '[{"type":"quiz","lessonCheck":true}]'::jsonb;

SELECT id, word, visuals @> '[{"type":"quiz","lessonCheck":true}]'::jsonb AS has_lesson_check
FROM public.words WHERE id IN (69, 142, 454, 491, 617, 724, 748, 749, 750, 751) ORDER BY id;
