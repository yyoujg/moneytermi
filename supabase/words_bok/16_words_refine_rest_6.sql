-- ===== 콘텐츠 정제 6/15 (refine.py 생성 — 손으로 고치지 말고 meanings.py를 고친 뒤 다시 실행) =====
-- 라이브 덤프와 비교해 아직 적용되지 않은 행만. 단문 UPDATE 294행, 본문 UPDATE 64행.
-- 적용 순서: 16_words_refine_1..N -> 17_courses.sql

UPDATE public.words SET word = '스무딩오퍼레이션', meaning = '환율이 너무 급하게 움직일 때 외환당국이 개입해 속도를 늦추는 미세조정', hint = 'ㅅㅁㄷㅇㅍㄹㅇㅅ', related_words = ARRAY['외환시장','고정환율제도','자유변동환율제도','평가절상/평가절하']::text[] WHERE id = 330;  -- 스무딩오퍼레이션
UPDATE public.words SET word = '스왑', meaning = '두 당사자가 미리 정한 조건으로 일정 기간 이자나 원금 흐름을 서로 바꾸는 계약', hint = 'ㅅㅇ', related_words = ARRAY['금리스왑','통화스왑']::text[] WHERE id = 331;  -- 스왑
UPDATE public.words SET word = '스왑레이트', meaning = '선물환율과 현물환율의 차이를 연율로 나타낸 값(두 나라 금리차와 일치)', hint = 'ㅅㅇㄹㅇㅌ', related_words = ARRAY['금리평가이론']::text[] WHERE id = 332;  -- 스왑레이트
UPDATE public.words SET word = '스왑베이시스', meaning = '통화스왑 금리와 금리스왑 금리의 차이(달러 조달 사정을 보여줌)', hint = 'ㅅㅇㅂㅇㅅㅅ', related_words = ARRAY['금리스왑','통화스왑','SOFR']::text[] WHERE id = 333;  -- 스왑베이시스
UPDATE public.words SET word = '스태그플레이션', meaning = '경기는 침체인데 물가는 오르는 현상', hint = 'ㅅㅌㄱㅍㄹㅇㅅ', related_words = ARRAY['디플레이션','장기침체']::text[] WHERE id = 334;  -- 스태그플레이션
UPDATE public.words SET word = '스탠더드&푸어스(S&P)', meaning = '무디스·피치와 함께 세계 3대 국제신용평가기관인 미국 회사', hint = 'ㅅㅌㄷㄷㅍㅇㅅ', related_words = ARRAY['무디스']::text[] WHERE id = 335;  -- 스탠더드&푸어스(S&P)
UPDATE public.words SET word = '스테이블코인', meaning = '달러 등 다른 자산에 가치를 연동해 가격 변동을 최소화한 가상자산', hint = 'ㅅㅌㅇㅂㅋㅇ', related_words = ARRAY['가상자산','비트코인']::text[] WHERE id = 336;  -- 스테이블코인
UPDATE public.words SET word = '스톡옵션', meaning = '임직원에게 나중에 회사 주식을 미리 정한 가격에 살 수 있게 주는 권리', hint = 'ㅅㅌㅇㅅ', related_words = ARRAY['옵션']::text[] WHERE id = 337;  -- 스톡옵션
UPDATE public.words SET word = '스트레스 DSR', meaning = '금리가 오를 것을 가정해 가산금리를 얹어 대출 한도를 더 보수적으로 정하는 제도', hint = 'ㅅㅌㄹㅅD', related_words = '{}'::text[] WHERE id = 338;  -- 스트레스 DSR
UPDATE public.words SET word = '스트레스 테스트(위기상황분석)', meaning = '극단적이지만 가능한 위기 상황을 가정해 금융회사가 버틸 수 있는지 점검하는 기법', hint = 'ㅅㅌㄹㅅㅌㅅㅌ', related_words = '{}'::text[] WHERE id = 339;  -- 스트레스 테스트(위기상황분석)
UPDATE public.words SET word = '시뇨리지', meaning = '화폐를 찍어 내는 중앙은행이나 국가가 액면가와 제조비용 차이로 얻는 이득', hint = 'ㅅㄴㄹㅈ', related_words = ARRAY['중앙은행']::text[] WHERE id = 340;  -- 시뇨리지
UPDATE public.words SET word = '시스템 리스크', meaning = '금융시스템의 일부가 무너져 자금 중개 기능 전체가 마비될 위험', hint = 'ㅅㅅㅌㄹㅅㅋ', related_words = ARRAY['시스템적으로 중요한 금융기관']::text[] WHERE id = 341;  -- 시스템 리스크
UPDATE public.words SET word = '시스템적으로 중요한 금융기관', meaning = '덩치가 크고 연결이 많아 망하면 금융시스템 전체가 흔들리는 대형 금융회사', hint = 'ㅅㅅㅌㅈㅇㄹㅈㅇㅎㄱㅇㄱㄱ', related_words = ARRAY['시스템 리스크']::text[] WHERE id = 342;  -- 시스템적으로 중요한 금융기관
UPDATE public.words SET word = '시장리스크', meaning = '금리·주가·환율 변동으로 은행이 보유한 금융상품 가격이 떨어질 위험', hint = 'ㅅㅈㄹㅅㅋ', related_words = ARRAY['VaR(Value at Risk)']::text[] WHERE id = 343;  -- 시장리스크
UPDATE public.words SET word = '시장평균환율(MAR)', meaning = '전날 은행 간 거래 환율을 거래량으로 가중평균해 만든 오늘의 기준환율', hint = 'ㅅㅈㅍㄱㅎㅇ', related_words = ARRAY['시장평균환율제도']::text[] WHERE id = 344;  -- 시장평균환율(MAR)
UPDATE public.words SET word = '시장평균환율제도', meaning = '전날 평균환율 기준 일정 범위 안에서만 환율이 움직이게 한 1990년대 제도', hint = 'ㅅㅈㅍㄱㅎㅇㅈㄷ', related_words = ARRAY['고정환율제도','자유변동환율제도','미달러화페그제도']::text[] WHERE id = 345;  -- 시장평균환율제도
UPDATE public.words SET word = '시카고 연준 금융상황지수', meaning = '미국 연준이 만든, 미국 금융시장이 긴축적인지 완화적인지 보여주는 지수', hint = 'ㅅㅋㄱㅇㅈㄱㅇㅅㅎㅈㅅ', related_words = '{}'::text[] WHERE id = 346;  -- 시카고 연준 금융상황지수
UPDATE public.words SET word = '시카고상업거래소(CME)', meaning = '농산물·금융상품 선물을 거래하는 세계 최대 파생상품 거래소', hint = 'ㅅㅋㄱㅅㅇㄱㄹㅅ', related_words = '{}'::text[] WHERE id = 347;  -- 시카고상업거래소(CME)
UPDATE public.words SET word = '신용경색', meaning = '돈줄이 막혀 기업과 가계가 자금을 구하지 못하는 현상', hint = 'ㅅㅇㄱㅅ', related_words = ARRAY['신용위험(신용리스크)','유동성리스크']::text[] WHERE id = 348;  -- 신용경색
UPDATE public.words SET word = '신용레버리지', meaning = '수익을 키우려고 빚(신용)을 얼마나 끌어다 쓰고 있는지의 정도', hint = 'ㅅㅇㄹㅂㄹㅈ', related_words = ARRAY['레버리지 효과']::text[] WHERE id = 349;  -- 신용레버리지
UPDATE public.words SET word = '신용스프레드', meaning = '회사채 금리와 국고채 금리의 차이(신용위험이 클수록 벌어짐)', hint = 'ㅅㅇㅅㅍㄹㄷ', related_words = ARRAY['신용위험(신용리스크)']::text[] WHERE id = 350;  -- 신용스프레드
UPDATE public.words SET word = '예대금리차(예대마진)', meaning = '은행이 받는 대출금리와 주는 예금금리의 차이(은행 수익의 원천)', hint = 'ㅇㄷㄱㄹㅊ', related_words = ARRAY['순이자마진(NIM)']::text[] WHERE id = 391;  -- 예대금리차(예대마진)
UPDATE public.words SET word = '예대율', meaning = '예금 대비 대출이 얼마인지의 비율(100% 이하로 규제)', hint = 'ㅇㄷㅇ', related_words = '{}'::text[] WHERE id = 392;  -- 예대율
UPDATE public.words SET word = '예상손실', meaning = '일정 기간 평균적으로 발생할 것으로 예상되는 손실 금액', hint = 'ㅇㅅㅅㅅ', related_words = ARRAY['VaR(Value at Risk)','대손충당금적립비율','신용위험(신용리스크)']::text[] WHERE id = 393;  -- 예상손실
UPDATE public.words SET word = '예약자금이체제도', meaning = '미래 특정 시점에 자동으로 결제되도록 미리 이체를 예약해 두는 제도', hint = 'ㅇㅇㅈㄱㅇㅊㅈㄷ', related_words = ARRAY['일중당좌대출제도']::text[] WHERE id = 394;  -- 예약자금이체제도
