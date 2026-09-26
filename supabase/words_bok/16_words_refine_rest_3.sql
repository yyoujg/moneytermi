-- ===== 콘텐츠 정제 3/15 (refine.py 생성 — 손으로 고치지 말고 meanings.py를 고친 뒤 다시 실행) =====
-- 라이브 덤프와 비교해 아직 적용되지 않은 행만. 단문 UPDATE 294행, 본문 UPDATE 64행.
-- 적용 순서: 16_words_refine_1..N -> 17_courses.sql

UPDATE public.words SET word = '기대인플레이션', meaning = '사람들이 앞으로 물가가 얼마나 오를 것이라고 예상하는 수준', hint = 'ㄱㄷㅇㅍㄹㅇㅅ', related_words = ARRAY['인플레이션']::text[] WHERE id = 132;  -- 기대인플레이션
UPDATE public.words SET word = '기본자본(Tier 1)', meaning = '은행이 영업을 계속하면서 손실을 흡수할 수 있는 핵심 자기자본', hint = 'ㄱㅂㅈㅂ', related_words = ARRAY['BIS 자기자본비율','보통주자본','기타기본자본','보완자본(Tier 2)']::text[] WHERE id = 133;  -- 기본자본(Tier 1)
UPDATE public.words SET word = '기업간(B2B) 지급시스템', meaning = '기업끼리 상거래에서 생긴 전자채권을 발행하고 결제하는 시스템', hint = 'ㄱㅇㄱ', related_words = '{}'::text[] WHERE id = 134;  -- 기업간(B2B) 지급시스템
UPDATE public.words SET word = '기업경기실사지수(BSI)', meaning = '기업가들에게 경기를 어떻게 보는지 설문해 지수로 만든 것', hint = 'ㄱㅇㄱㄱㅅㅅㅈㅅ', related_words = ARRAY['경제심리지수','소비자동향지수(CSI)']::text[] WHERE id = 135;  -- 기업경기실사지수(BSI)
UPDATE public.words SET word = '기업공개', meaning = '비상장 회사가 주식을 일반 투자자에게 팔아 증시에 상장하는 것', hint = 'ㄱㅇㄱㄱ', related_words = ARRAY['모집']::text[] WHERE id = 136;  -- 기업공개
UPDATE public.words SET word = '기업분할(물적분할, 인적분할)', meaning = '회사의 한 사업부를 떼어 내 새 회사로 만드는 것', hint = 'ㄱㅇㅂㅎ', related_words = '{}'::text[] WHERE id = 137;  -- 기업분할(물적분할, 인적분할)
UPDATE public.words SET word = '기업심리지수(CBSI)', meaning = '기업경기실사지수의 주요 항목을 합성해 기업 심리를 하나로 나타낸 지수', hint = 'ㄱㅇㅅㄹㅈㅅ', related_words = ARRAY['기업경기실사지수(BSI)']::text[] WHERE id = 138;  -- 기업심리지수(CBSI)
UPDATE public.words SET word = '기업어음(CP)', meaning = '신용 좋은 기업이 단기 자금을 빌리려고 자기 신용으로 발행하는 어음', hint = 'ㄱㅇㅇㅇ', related_words = ARRAY['진성어음','융통어음']::text[] WHERE id = 139;  -- 기업어음(CP)
UPDATE public.words SET word = '기업회생절차', meaning = '빚이 많은 기업을 법원이 관리해 살릴 길을 찾는 절차(법정관리)', hint = 'ㄱㅇㅎㅅㅈㅊ', related_words = '{}'::text[] WHERE id = 140;  -- 기업회생절차
UPDATE public.words SET word = '도드-프랭크법', meaning = '2008년 금융위기 재발을 막으려고 2010년 미국이 만든 대대적 금융개혁법', hint = 'ㄷㄷㅍㄹㅋㅂ', related_words = ARRAY['볼커룰']::text[] WHERE id = 182;  -- 도드-프랭크법
UPDATE public.words SET word = '동남아시아국가연합(ASEAN)', meaning = '동남아 10개국이 경제·사회 협력을 위해 만든 지역협력기구', hint = 'ㄷㄴㅇㅅㅇㄱㄱㅇㅎ', related_words = ARRAY['치앙마이 이니셔티브(CMI)','치앙마이 이니셔티브 다자화(CMIM)']::text[] WHERE id = 183;  -- 동남아시아국가연합(ASEAN)
UPDATE public.words SET word = '동아시아 외환위기', meaning = '1997년 태국에서 시작돼 한국까지 번진 아시아 국가들의 외환위기', hint = 'ㄷㅇㅅㅇㅇㅎㅇㄱ', related_words = ARRAY['경기순응성']::text[] WHERE id = 184;  -- 동아시아 외환위기
UPDATE public.words SET word = '동행종합지수', meaning = '광공업생산·소매판매 등 경기와 같이 움직이는 지표로 현재 경기를 보는 지수', hint = 'ㄷㅎㅈㅎㅈㅅ', related_words = ARRAY['경기종합지수','후행종합지수']::text[] WHERE id = 185;  -- 동행종합지수
UPDATE public.words SET word = '듀레이션', meaning = '채권 투자금을 돌려받는 데 걸리는 평균 기간(금리 민감도 지표)', hint = 'ㄷㄹㅇㅅ', related_words = '{}'::text[] WHERE id = 186;  -- 듀레이션
UPDATE public.words SET word = '등록발행', meaning = '실물 채권 없이 등록기관 장부에 권리를 기록하는 방식의 채권 발행', hint = 'ㄷㄹㅂㅎ', related_words = '{}'::text[] WHERE id = 187;  -- 등록발행
UPDATE public.words SET word = '디레버리징', meaning = '빚을 줄여 부채 비중을 낮추는 것', hint = 'ㄷㄹㅂㄹㅈ', related_words = ARRAY['레버리지 효과']::text[] WHERE id = 188;  -- 디레버리징
UPDATE public.words SET word = '디스인플레이션', meaning = '물가는 계속 오르지만 오르는 속도(상승률)는 둔화되는 현상', hint = 'ㄷㅅㅇㅍㄹㅇㅅ', related_words = ARRAY['디플레이션','통화정책']::text[] WHERE id = 189;  -- 디스인플레이션
UPDATE public.words SET word = '디커플링', meaning = '한 나라 경제나 자산이 세계 흐름과 따로 노는 탈동조화 현상', hint = 'ㄷㅋㅍㄹ', related_words = ARRAY['커플링']::text[] WHERE id = 190;  -- 디커플링/커플링
UPDATE public.words SET word = '디플레이션', meaning = '물가가 지속적으로 떨어지는 현상', hint = 'ㄷㅍㄹㅇㅅ', related_words = ARRAY['인플레이션','피셔효과']::text[] WHERE id = 191;  -- 디플레이션
UPDATE public.words SET word = '래퍼곡선', meaning = '세율이 너무 높아지면 오히려 세수가 줄어든다는 역U자 곡선', hint = 'ㄹㅍㄱㅅ', related_words = ARRAY['조세부담률']::text[] WHERE id = 192;  -- 래퍼곡선
UPDATE public.words SET word = '레그테크', meaning = 'IT 기술로 금융 규제 준수 업무를 자동화하는 기술이나 회사', hint = 'ㄹㄱㅌㅋ', related_words = ARRAY['핀테크','고객확인절차(KYC)','블록체인','분산원장기술']::text[] WHERE id = 193;  -- 레그테크
UPDATE public.words SET word = '레버리지 효과', meaning = '빚을 지렛대 삼아 실제 가격 변동보다 몇 배 큰 수익률(또는 손실)을 내는 효과', hint = 'ㄹㅂㄹㅈㅎㄱ', related_words = ARRAY['디레버리징']::text[] WHERE id = 194;  -- 레버리지 효과
UPDATE public.words SET word = '레버리지비율', meaning = '위험가중 없이 총자산 대비 기본자본이 얼마인지 보는 은행 건전성 비율', hint = 'ㄹㅂㄹㅈㅂㅇ', related_words = ARRAY['기본자본(Tier 1)','익스포저','디레버리징']::text[] WHERE id = 195;  -- 레버리지비율/단순기본자본비율
UPDATE public.words SET word = '로렌츠곡선', meaning = '인구 누적비율과 소득 누적비율로 소득 불평등을 그림으로 나타낸 곡선', hint = 'ㄹㄹㅊㄱㅅ', related_words = ARRAY['지니계수']::text[] WHERE id = 196;  -- 로렌츠곡선
UPDATE public.words SET word = '로보어드바이저', meaning = '인공지능 알고리즘이 투자 성향을 분석해 자산관리를 해 주는 서비스', hint = 'ㄹㅂㅇㄷㅂㅇㅈ', related_words = ARRAY['빅데이터','상장지수펀드(ETF)']::text[] WHERE id = 197;  -- 로보어드바이저
