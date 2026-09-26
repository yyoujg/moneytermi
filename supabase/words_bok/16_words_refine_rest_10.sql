-- ===== 콘텐츠 정제 10/15 (refine.py 생성 — 손으로 고치지 말고 meanings.py를 고친 뒤 다시 실행) =====
-- 라이브 덤프와 비교해 아직 적용되지 않은 행만. 단문 UPDATE 294행, 본문 UPDATE 64행.
-- 적용 순서: 16_words_refine_1..N -> 17_courses.sql

UPDATE public.words SET word = '지급준비제도', meaning = '은행이 예금의 일정 비율을 중앙은행에 의무적으로 맡기게 하는 제도', hint = 'ㅈㄱㅈㅂㅈㄷ', related_words = ARRAY['통화정책수단']::text[] WHERE id = 550;  -- 지급준비제도
UPDATE public.words SET word = '지니계수', meaning = '0(완전 평등)에서 1(완전 불평등) 사이 값으로 소득 불평등을 나타내는 지수', hint = 'ㅈㄴㄱㅅ', related_words = ARRAY['상대적 빈곤율','소득5분위배율']::text[] WHERE id = 551;  -- 지니계수
UPDATE public.words SET word = '지로(GIRO)', meaning = '공과금·회비처럼 다수의 소액 수납·지급을 중계센터를 통해 처리하는 지급수단', hint = 'ㅈㄹ', related_words = ARRAY['입금이체','출금이체']::text[] WHERE id = 552;  -- 지로(GIRO)
UPDATE public.words SET word = '지방은행공동망', meaning = '지방은행들이 공동으로 전국 입출금·조회 서비스를 제공하는 지급망', hint = 'ㅈㅂㅇㅎㄱㄷㅁ', related_words = ARRAY['소액지급시스템']::text[] WHERE id = 553;  -- 지방은행공동망
UPDATE public.words SET word = '지분형 모기지', meaning = '공공기관이 집의 지분 일부를 투자해 구매자 부담을 덜어 주는 주택금융 제도', hint = 'ㅈㅂㅎㅁㄱㅈ', related_words = ARRAY['주택금융제도','한국주택금융공사']::text[] WHERE id = 554;  -- 지분형 모기지
UPDATE public.words SET word = '지식서비스 무역통계', meaning = '지식재산권 사용료·정보통신 등 지식 기반 서비스의 국가 간 거래 통계', hint = 'ㅈㅅㅅㅂㅅㅁㅇㅌㄱ', related_words = ARRAY['국제수지']::text[] WHERE id = 555;  -- 지식서비스 무역통계
UPDATE public.words SET word = '지식재산권', meaning = '특허·상표·저작권처럼 창작물에 대해 주어지는 독점적 권리', hint = 'ㅈㅅㅈㅅㄱ', related_words = '{}'::text[] WHERE id = 556;  -- 지식재산권
UPDATE public.words SET word = '지식재산생산물투자', meaning = '연구개발·소프트웨어·예술작품 같은 무형자산에 대한 투자', hint = 'ㅈㅅㅈㅅㅅㅅㅁㅌㅈ', related_words = '{}'::text[] WHERE id = 557;  -- 지식재산생산물투자
UPDATE public.words SET word = '지정시점처리제도', meaning = '어음교환·타행환 같은 차액결제를 영업시간 중 정해진 시각에 일괄 처리하는 제도', hint = 'ㅈㅈㅅㅈㅊㄹㅈㄷ', related_words = ARRAY['차액결제시스템']::text[] WHERE id = 558;  -- 지정시점처리제도
UPDATE public.words SET word = '지주회사', meaning = '다른 회사 주식을 소유해 그 회사를 지배하는 것이 주된 사업인 회사', hint = 'ㅈㅈㅎㅅ', related_words = ARRAY['M&A']::text[] WHERE id = 559;  -- 지주회사
UPDATE public.words SET word = '직불카드', meaning = '결제 즉시 내 예금계좌에서 돈이 빠져나가는 카드', hint = 'ㅈㅂㅋㄷ', related_words = ARRAY['지급수단','직불카드공동망']::text[] WHERE id = 560;  -- 직불카드
UPDATE public.words SET word = '탄소국경세(Carbon Border Adjustment Mechanism, CBAM)', meaning = '유럽연합이 수입품의 탄소 배출량에 따라 매기는 사실상의 관세', hint = 'ㅌㅅㄱㄱㅅ', related_words = '{}'::text[] WHERE id = 602;  -- 탄소국경세(Carbon Border Adjustment Mechanism, CBAM)
UPDATE public.words SET word = '탄소배출권', meaning = '정해진 양만큼 온실가스를 배출할 수 있는 권리(남으면 사고팔 수 있음)', hint = 'ㅌㅅㅂㅊㄱ', related_words = '{}'::text[] WHERE id = 603;  -- 탄소배출권
UPDATE public.words SET word = '탄소중립경제', meaning = '온실가스 순배출량을 0으로 만드는 것을 목표로 하는 경제 체제', hint = 'ㅌㅅㅈㄹㄱㅈ', related_words = '{}'::text[] WHERE id = 604;  -- 탄소중립경제
UPDATE public.words SET word = '탈세계화(De-globalization)', meaning = '나라 간 교류가 줄고 자국 중심 정책이 강해지는, 세계화의 반대 흐름', hint = 'ㅌㅅㄱㅎ', related_words = '{}'::text[] WHERE id = 605;  -- 탈세계화(De-globalization)
UPDATE public.words SET word = '테이퍼링(Tapering)', meaning = '중앙은행이 채권 매입 규모를 서서히 줄여 양적완화를 축소하는 것', hint = 'ㅌㅇㅍㄹ', related_words = ARRAY['양적완화정책']::text[] WHERE id = 606;  -- 테이퍼링(Tapering)
UPDATE public.words SET word = '테일러 준칙(Taylor’s Rule)', meaning = '물가갭과 국내총생산갭을 반영해 적정 기준금리를 계산하는 금리 준칙', hint = 'ㅌㅇㄹㅈㅊ', related_words = '{}'::text[] WHERE id = 607;  -- 테일러 준칙(Taylor’s Rule)
UPDATE public.words SET word = '토빈세(Tobin Tax)', meaning = '단기 투기성 외환거래에 세금을 매겨 급격한 자본 이동을 막자는 구상', hint = 'ㅌㅂㅅ', related_words = '{}'::text[] WHERE id = 608;  -- 토빈세(Tobin Tax)
UPDATE public.words SET word = '통상임금', meaning = '정기적·일률적으로 지급되는 임금으로 각종 수당 계산의 기준', hint = 'ㅌㅅㅇㄱ', related_words = ARRAY['의중임금','최저임금제']::text[] WHERE id = 609;  -- 통상임금
UPDATE public.words SET word = '통합발행제도', meaning = '일정 기간 발행하는 국채의 만기·금리를 같게 맞춰 한 종목으로 묶는 제도', hint = 'ㅌㅎㅂㅎㅈㄷ', related_words = '{}'::text[] WHERE id = 610;  -- 통합발행제도
UPDATE public.words SET word = '통화스왑', meaning = '서로 다른 통화의 원금을 바꾸고 이자를 주고받다 만기에 원금을 되바꾸는 거래', hint = 'ㅌㅎㅅㅇ', related_words = ARRAY['외환스왑거래','파생금융상품']::text[] WHERE id = 611;  -- 통화스왑
UPDATE public.words SET word = '통화승수', meaning = '중앙은행이 푼 본원통화가 몇 배의 통화량으로 불어났는지 나타내는 배수', hint = 'ㅌㅎㅅㅅ', related_words = ARRAY['중앙은행','본원통화','지급준비제도']::text[] WHERE id = 612;  -- 통화승수
UPDATE public.words SET word = '통화신용정책보고서', meaning = '한국은행이 통화정책 결정 내용과 방향을 정리해 연 2회 국회에 내는 보고서', hint = 'ㅌㅎㅅㅇㅈㅊㅂㄱㅅ', related_words = '{}'::text[] WHERE id = 613;  -- 통화신용정책보고서
UPDATE public.words SET word = '통화안정계정', meaning = '한국은행이 시중 여유 자금을 흡수하려고 은행에서 받는 기한부 예금', hint = 'ㅌㅎㅇㅈㄱㅈ', related_words = '{}'::text[] WHERE id = 614;  -- 통화안정계정
UPDATE public.words SET word = '통화안정증권', meaning = '한국은행이 시중 통화량을 조절하려고 발행하는 채권', hint = 'ㅌㅎㅇㅈㅈㄱ', related_words = ARRAY['환매조건부매매(RP)','통화안정계정','공개시장운영']::text[] WHERE id = 615;  -- 통화안정증권
