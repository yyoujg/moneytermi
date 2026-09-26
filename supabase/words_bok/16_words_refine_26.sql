-- ===== 콘텐츠 정제 26/36 (refine.py 생성 — 손으로 고치지 말고 meanings.py를 고친 뒤 다시 실행) =====
-- 뜻 전면 재작성·슬래시 항목 분리(신규 31행)·힌트 기본형 초성·related_words 정리·본문 줄이음 자국 제거.
-- 적용 순서: 16_words_refine_1..N -> 17_courses.sql

UPDATE public.words SET word = '크라우드펀딩', meaning = '온라인 플랫폼에서 다수의 개인에게 소액씩 자금을 모으는 방식', hint = 'ㅋㄹㅇㄷㅍㄷ', related_words = ARRAY['P2P대출']::text[] WHERE id = 601;  -- 크라우드펀딩
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
UPDATE public.words SET word = '통화유통속도', meaning = '돈 한 단위가 1년 동안 몇 번 거래에 쓰였는지 나타내는 지표', hint = 'ㅌㅎㅇㅌㅅㄷ', related_words = ARRAY['마샬의 k']::text[] WHERE id = 616;  -- 통화유통속도
UPDATE public.words SET word = '통화정책', meaning = '중앙은행이 통화량과 금리를 조절해 물가와 금융을 안정시키는 정책', hint = 'ㅌㅎㅈㅊ', related_words = '{}'::text[] WHERE id = 617;  -- 통화정책
UPDATE public.words SET word = '통화정책 운영체제 (Monetary Policy Regime)', meaning = '통화량·환율·물가 중 무엇을 기준 지표로 삼느냐에 따른 통화정책의 틀', hint = 'ㅌㅎㅈㅊㅇㅇㅊㅈ', related_words = ARRAY['통화정책체계(monetary policy framework)','물가안정목표제']::text[] WHERE id = 618;  -- 통화정책 운영체제 (Monetary Policy Regime)
UPDATE public.words SET word = '통화정책 파급경로', meaning = '금리·자산가격·환율·기대·신용 경로 등 통화정책이 실물경제에 전달되는 길', hint = 'ㅌㅎㅈㅊㅍㄱㄱㄹ', related_words = '{}'::text[] WHERE id = 619;  -- 통화정책 파급경로
UPDATE public.words SET word = '통화정책수단', meaning = '지급준비제도·공개시장운영·여수신제도 등 중앙은행이 쓰는 정책 도구', hint = 'ㅌㅎㅈㅊㅅㄷ', related_words = ARRAY['지급준비제도','공개시장운영']::text[] WHERE id = 620;  -- 통화정책수단
UPDATE public.words SET word = '통화정책체계 (Monetary Policy Framework)', meaning = '정책 수단과 최종 목표를 중간 지표로 이어 주는 통화정책의 전체 구조', hint = 'ㅌㅎㅈㅊㅊㄱ', related_words = ARRAY['통화정책 운영체제(monetary policy regime)']::text[] WHERE id = 621;  -- 통화정책체계 (Monetary Policy Framework)
UPDATE public.words SET word = '통화지표', meaning = '시중에 유통되는 돈의 양을 재는 척도(M1·M2 등)', hint = 'ㅌㅎㅈㅍ', related_words = '{}'::text[] WHERE id = 622;  -- 통화지표
UPDATE public.words SET word = '투입계수', meaning = '한 단위를 생산하는 데 다른 산업의 중간재가 얼마나 들어가는지 나타낸 계수', hint = 'ㅌㅇㄱㅅ', related_words = ARRAY['최종수요','중간수요']::text[] WHERE id = 623;  -- 투입계수
UPDATE public.words SET word = '투자율', meaning = '국민총처분가능소득 중 투자에 쓰인 비율', hint = 'ㅌㅈㅇ', related_words = ARRAY['총고정자본형성']::text[] WHERE id = 624;  -- 투자율
UPDATE public.words SET word = '특별인출권(SDR)', meaning = '국제통화기금이 만든 국제 준비통화(회원국 출자 비율에 따라 배분)', hint = 'ㅌㅂㅇㅊㄱ', related_words = ARRAY['국제통화기금(IMF)','복수통화바스켓제도','IMF 쿼타']::text[] WHERE id = 625;  -- 특별인출권(SDR)
