-- 기초 핵심 10개 레슨 구조: 쉽게 설명 -> 왜 중요할까 -> (기존 그래프·표) -> 경제에 주는 영향 -> 반대로 되면.
-- 기존 visuals는 그대로 두고 text 블록을 앞에, 흐름을 뒤에 붙인다. '쉽게 설명'이 이미 있으면 건너뜀(다시 실행해도 중복 없음).
-- 수요와 공급·시장금리·통화량·환율(새 단어 748~751)은 18_words_new.sql에 레슨이 들어 있다.

-- 인플레이션
UPDATE public.words SET visuals = '[
  {"type":"text","title":"쉽게 설명","body":"작년에 1,000원이던 라면이 올해 1,050원이면 물가가 5% 오른 거예요.\n같은 돈으로 살 수 있는 게 줄어드니 돈의 가치가 떨어진 것과 같아요."},
  {"type":"text","title":"왜 중요할까?","body":"물가가 너무 빨리 오르면 월급과 예금의 실제 가치가 줄어요.\n그래서 한국은행은 물가 상승률 2%를 목표로 금리를 조절해요."}
]'::jsonb || COALESCE(visuals,'[]'::jsonb) || '[
  {"type":"flow","title":"물가가 오르면 이어지는 일","steps":["물가 ↑","같은 돈으로 살 수 있는 양 ↓","임금 인상 요구 ↑","기업 비용 ↑ → 가격 다시 ↑","한국은행 기준금리 인상 검토"],"caption":"물가가 계속 떨어지는 디플레이션도 사람들이 소비를 미루게 만들어 경기에 좋지 않아요."}
]'::jsonb
WHERE id = 454 AND NOT COALESCE(visuals,'[]'::jsonb) @> '[{"title":"쉽게 설명"}]';

-- 기준금리
UPDATE public.words SET visuals = '[
  {"type":"text","title":"쉽게 설명","body":"한국은행이 은행들과 돈을 주고받을 때 기준이 되는 금리예요.\n이 금리가 움직이면 예금·대출 금리가 따라 움직여요."},
  {"type":"text","title":"왜 올리고 내릴까?","body":"물가가 너무 빨리 오르면 돈을 빌리기 어렵게 만들어 소비·투자를 식히려고 올려요.\n경기가 너무 나쁘면 반대로 내려요."}
]'::jsonb || COALESCE(visuals,'[]'::jsonb) || '[
  {"type":"flow","title":"반대로 금리를 내리면","steps":["기준금리 ↓","대출금리 ↓","소비·투자 ↑ 가능","경기 활성화 가능","물가 상승 압력 ↑ 가능"]}
]'::jsonb
WHERE id = 142 AND NOT COALESCE(visuals,'[]'::jsonb) @> '[{"title":"쉽게 설명"}]';

-- 국내총생산(GDP)
UPDATE public.words SET visuals = '[
  {"type":"text","title":"쉽게 설명","body":"우리나라 안에서 1년 동안 새로 만든 물건과 서비스의 값을 모두 더한 거예요.\n중간에 재료로 쓰인 것은 빼고 최종적으로 팔린 것만 더해요."},
  {"type":"text","title":"왜 중요할까?","body":"GDP가 늘어난 비율이 경제성장률이에요.\n경제가 커지고 있는지 뒷걸음질치는지 보여주는 가장 기본 지표예요."},
  {"type":"table","title":"GDP는 누가 쓴 돈으로 이뤄질까","columns":["구성","무엇"],"rows":[["소비","가계가 물건·서비스를 사는 데 쓴 돈"],["투자","기업의 설비·건설, 주택 건설"],["정부지출","정부가 쓰는 돈"],["순수출","수출 - 수입"]]}
]'::jsonb || COALESCE(visuals,'[]'::jsonb) || '[
  {"type":"flow","title":"GDP가 늘면 이어지는 일","steps":["생산 ↑","고용·소득 ↑","소비 ↑","기업 매출 ↑","다시 생산 ↑"],"caption":"반대로 두 분기 연속 GDP가 줄면 흔히 경기침체 신호로 봐요."}
]'::jsonb
WHERE id = 69 AND NOT COALESCE(visuals,'[]'::jsonb) @> '[{"title":"쉽게 설명"}]';

-- 재정정책
UPDATE public.words SET visuals = '[
  {"type":"text","title":"쉽게 설명","body":"정부가 세금을 걷고 돈을 쓰는 방식으로 경기를 조절하는 거예요.\n경기가 나쁘면 더 쓰고 세금을 깎고, 과열되면 덜 써요."},
  {"type":"text","title":"통화정책과 무엇이 다를까?","body":"통화정책은 한국은행이 금리로, 재정정책은 정부가 예산으로 경기를 조절해요."}
]'::jsonb || COALESCE(visuals,'[]'::jsonb) || '[
  {"type":"flow","title":"경기가 나쁠 때 정부가 돈을 더 쓰면","steps":["정부지출 ↑·세금 ↓","가계·기업 소득 ↑","소비·투자 ↑","총수요 ↑","생산·고용 ↑"],"caption":"대신 나랏빚이 늘 수 있고, 정부가 돈을 많이 빌리면 금리가 올라 민간 투자를 밀어낼 수도 있어요(구축효과)."}
]'::jsonb
WHERE id = 491 AND NOT COALESCE(visuals,'[]'::jsonb) @> '[{"title":"쉽게 설명"}]';

-- 통화정책
UPDATE public.words SET visuals = '[
  {"type":"text","title":"쉽게 설명","body":"한국은행이 금리와 시중의 돈의 양을 조절해 물가와 경기를 관리하는 거예요."},
  {"type":"text","title":"어떤 수단을 쓸까?","body":"대표 수단은 기준금리예요.\n국채를 사고팔아 돈을 풀거나 거두는 공개시장운영, 은행이 쌓아 둬야 할 돈을 정하는 지급준비제도도 있어요."}
]'::jsonb || COALESCE(visuals,'[]'::jsonb) || '[
  {"type":"flow","title":"돈줄을 조이면 (긴축)","steps":["기준금리 ↑","시장금리 ↑","대출 ↓·저축 ↑","소비·투자 ↓","물가 상승 압력 ↓"]},
  {"type":"flow","title":"돈줄을 풀면 (완화)","steps":["기준금리 ↓","시장금리 ↓","대출 ↑","소비·투자 ↑","경기 회복, 물가 상승 압력 ↑"]}
]'::jsonb
WHERE id = 617 AND NOT COALESCE(visuals,'[]'::jsonb) @> '[{"title":"쉽게 설명"}]';

-- 복리
UPDATE public.words SET visuals = '[
  {"type":"text","title":"쉽게 설명","body":"이자에도 이자가 붙는 방식이에요.\n작년에 받은 이자가 원금에 더해져 올해는 더 큰 돈에 이자가 붙어요."},
  {"type":"text","title":"쉽게 계산하는 법","body":"72의 법칙: 72 ÷ 연 수익률 = 돈이 2배가 되는 대략의 햇수\n연 6%면 72 ÷ 6 = 약 12년, 연 8%면 약 9년이에요."}
]'::jsonb || COALESCE(visuals,'[]'::jsonb)
WHERE id = 724 AND NOT COALESCE(visuals,'[]'::jsonb) @> '[{"title":"쉽게 설명"}]';

SELECT id, word, jsonb_array_length(visuals) AS n FROM public.words WHERE id IN (69, 142, 454, 491, 617, 724) ORDER BY id;
