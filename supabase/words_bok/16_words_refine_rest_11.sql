-- ===== 콘텐츠 정제 11/15 (refine.py 생성 — 손으로 고치지 말고 meanings.py를 고친 뒤 다시 실행) =====
-- 라이브 덤프와 비교해 아직 적용되지 않은 행만. 단문 UPDATE 294행, 본문 UPDATE 64행.
-- 적용 순서: 16_words_refine_1..N -> 17_courses.sql

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
UPDATE public.words SET word = '특수목적기구(SPV)', meaning = '자산유동화증권을 발행하려고 자산을 넘겨받는 서류상 회사', hint = 'ㅌㅅㅁㅈㄱㄱ', related_words = ARRAY['자산유동화']::text[] WHERE id = 626;  -- 특수목적기구(SPV)
UPDATE public.words SET word = '파레토최적', meaning = '누군가의 효용을 줄이지 않고는 다른 사람의 효용을 늘릴 수 없는 최적 상태', hint = 'ㅍㄹㅌㅊㅈ', related_words = ARRAY['한계비용','한계효용']::text[] WHERE id = 627;  -- 파레토최적
UPDATE public.words SET word = '파생금융상품', meaning = '통화·채권·주식 등 기초자산 가치에 따라 값이 정해지는 선물·옵션·스왑 상품', hint = 'ㅍㅅㄱㅇㅅㅍ', related_words = ARRAY['옵션','스왑']::text[] WHERE id = 628;  -- 파생금융상품
UPDATE public.words SET word = '페더럴펀드', meaning = '미국 은행들이 지급준비금 과부족을 조절하려고 서로 빌리는 초단기 자금', hint = 'ㅍㄷㄹㅍㄷ', related_words = '{}'::text[] WHERE id = 629;  -- 페더럴펀드
UPDATE public.words SET word = '평잔', meaning = '일정 기간 매일 잔액의 평균', hint = 'ㅍㅈ', related_words = ARRAY['말잔']::text[] WHERE id = 630;  -- 평잔/말잔
UPDATE public.words SET word = '환차손', meaning = '환율 변동으로 외화 자산·부채를 원화로 환산할 때 생긴 손실', hint = 'ㅎㅊㅅ', related_words = ARRAY['외국환포지션','환차익']::text[] WHERE id = 672;  -- 환차손/환차익
UPDATE public.words SET word = '회사채', meaning = '민간 기업이 장기 자금을 마련하려고 발행하는 채권', hint = 'ㅎㅅㅊ', related_words = ARRAY['신용스프레드']::text[] WHERE id = 673;  -- 회사채
UPDATE public.words SET word = '후방연쇄효과', meaning = '한 산업이 성장하면 그 산업에 원자재·부품을 대는 산업도 함께 커지는 효과', hint = 'ㅎㅂㅇㅅㅎㄱ', related_words = ARRAY['생산유발효과','전방연쇄효과']::text[] WHERE id = 674;  -- 후방연쇄효과
UPDATE public.words SET word = '후순위금융채', meaning = '은행이 망하면 예금자보다 나중에 갚는 채권(보완자본으로 인정)', hint = 'ㅎㅅㅇㄱㅇㅊ', related_words = ARRAY['BIS 자기자본비율','보완자본(Tier 2)']::text[] WHERE id = 675;  -- 후순위금융채
UPDATE public.words SET word = '후행종합지수', meaning = '재고·소비지출 등 경기보다 뒤늦게 움직이는 지표로 지난 경기를 확인하는 지수', hint = 'ㅎㅎㅈㅎㅈㅅ', related_words = ARRAY['경기종합지수','동행종합지수','선행종합지수']::text[] WHERE id = 676;  -- 후행종합지수
UPDATE public.words SET word = '4차 산업혁명', meaning = '인공지능·빅데이터·사물인터넷이 산업과 사회를 근본적으로 바꾸는 변화', hint = '4ㅊㅅㅇㅎㅁ', related_words = ARRAY['빅데이터']::text[] WHERE id = 677;  -- 4차 산업혁명
UPDATE public.words SET word = 'BIS 자기자본비율', meaning = '위험가중자산 대비 자기자본 비율로 은행 건전성을 재는 국제 기준(8% 이상)', hint = 'Bㅈㄱㅈㅂㅂㅇ', related_words = ARRAY['위험가중자산','보통주자본','기타기본자본','기본자본']::text[] WHERE id = 678;  -- BIS 자기자본비율
UPDATE public.words SET word = 'CAMEL-IR 방식', meaning = '금융감독당국이 은행 본점의 경영실태를 평가하는 방식', hint = 'CIㅂㅅ', related_words = ARRAY['경영실태평가']::text[] WHERE id = 679;  -- CAMEL-IR 방식/ROCA 방식/ CACREL 방식
UPDATE public.words SET word = 'CDS프리미엄', meaning = '채권 부도에 대비한 보험료 성격의 수수료(높을수록 부도 위험이 큼)', hint = 'Cㅍㄹㅁㅇ', related_words = ARRAY['신용파생상품']::text[] WHERE id = 680;  -- CDS프리미엄
UPDATE public.words SET word = 'CLS은행', meaning = '주요 통화의 외환거래를 동시결제해 결제 위험을 없애는 국제 외환결제 전문은행', hint = 'Cㅇㅎ', related_words = ARRAY['Herstatt 리스크','외환동시결제(PVP)']::text[] WHERE id = 681;  -- CLS은행
