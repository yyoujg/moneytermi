-- ===== 콘텐츠 정제 13/36 (refine.py 생성 — 손으로 고치지 말고 meanings.py를 고친 뒤 다시 실행) =====
-- 뜻 전면 재작성·슬래시 항목 분리(신규 31행)·힌트 기본형 초성·related_words 정리·본문 줄이음 자국 제거.
-- 적용 순서: 16_words_refine_1..N -> 17_courses.sql

UPDATE public.words SET word = '사회보험', meaning = '건강보험·국민연금처럼 사회적 위험에 대비해 국가가 운영하는 보험', hint = 'ㅅㅎㅂㅎ', related_words = ARRAY['사회보장제도']::text[] WHERE id = 276;  -- 사회보험
UPDATE public.words SET word = '산업연관표(I/O Tables)', meaning = '한 나라 산업들이 서로 무엇을 사고파는지 한눈에 정리한 종합 통계표', hint = 'ㅅㅇㅇㄱㅍ', related_words = ARRAY['고용유발효과/취업유발효과','생산유발효과']::text[] WHERE id = 277;  -- 산업연관표(I/O Tables)
UPDATE public.words SET word = '삼불원칙', meaning = '고정환율·자유로운 자본이동·독자적 통화정책 셋을 동시에 가질 수 없다는 원칙', hint = 'ㅅㅂㅇㅊ', related_words = ARRAY['고정환율제도','자유변동환율제도']::text[] WHERE id = 278;  -- 삼불원칙
UPDATE public.words SET word = '상계관세', meaning = '수출국 정부의 보조금을 받아 싸게 들어온 수입품에 맞서 매기는 관세', hint = 'ㅅㄱㄱㅅ', related_words = ARRAY['긴급수입제한조치']::text[] WHERE id = 279;  -- 상계관세
UPDATE public.words SET word = '상장지수펀드(ETF)', meaning = '주가지수 등을 따라가는 인덱스펀드를 주식처럼 거래소에서 사고팔게 한 상품', hint = 'ㅅㅈㅈㅅㅍㄷ', related_words = '{}'::text[] WHERE id = 280;  -- 상장지수펀드(ETF)
UPDATE public.words SET word = '상품공동기금(CFC)', meaning = '1차산품 가격 안정과 개발도상국 지원을 위한 국제 기금', hint = 'ㅅㅍㄱㄷㄱㄱ', related_words = ARRAY['세계무역기구(WTO)']::text[] WHERE id = 281;  -- 상품공동기금(CFC)
UPDATE public.words SET word = '상품수지', meaning = '상품 수출액과 수입액의 차이(경상수지의 핵심 항목)', hint = 'ㅅㅍㅅㅈ', related_words = ARRAY['경상수지']::text[] WHERE id = 282;  -- 상품수지
UPDATE public.words SET word = '상호관세', meaning = '상대국이 우리 제품에 높은 관세를 매기면 똑같이 되갚아 매기는 관세', hint = 'ㅅㅎㄱㅅ', related_words = ARRAY['보편관세']::text[] WHERE id = 283;  -- 상호관세
UPDATE public.words SET word = '생산세', meaning = '부가가치세처럼 생산이나 판매 과정에 매기는 세금(옛 간접세)', hint = 'ㅅㅅㅅ', related_words = '{}'::text[] WHERE id = 284;  -- 생산세
UPDATE public.words SET word = '생산유발효과', meaning = '소비·수출 같은 최종수요가 늘어날 때 연쇄적으로 생산이 늘어나는 효과', hint = 'ㅅㅅㅇㅂㅎㄱ', related_words = ARRAY['고용유발효과/취업유발효과']::text[] WHERE id = 285;  -- 생산유발효과
UPDATE public.words SET word = '생산자물가지수(PPI)', meaning = '생산자가 국내에 공급하는 상품·서비스 가격의 변동을 재는 물가지수', hint = 'ㅅㅅㅈㅁㄱㅈㅅ', related_words = ARRAY['소비자물가지수(CPI)','기초가격']::text[] WHERE id = 286;  -- 생산자물가지수(PPI)
UPDATE public.words SET word = '생산자제품재고지수', meaning = '생산자가 창고에 쌓아 둔 완제품 재고의 변동을 나타낸 지수', hint = 'ㅅㅅㅈㅈㅍㅈㄱㅈㅅ', related_words = ARRAY['경기종합지수']::text[] WHERE id = 287;  -- 생산자제품재고지수
UPDATE public.words SET word = '생산자제품출하지수', meaning = '광공업 제품이 공장 밖으로 얼마나 팔려 나갔는지 나타낸 지수', hint = 'ㅅㅅㅈㅈㅍㅊㅎㅈㅅ', related_words = ARRAY['경기종합지수']::text[] WHERE id = 288;  -- 생산자제품출하지수/생산자출하지수
UPDATE public.words SET word = '생산확산지수', meaning = '전월보다 생산이 늘어난 업종이 전체의 몇 %인지로 경기 확산을 보는 지수', hint = 'ㅅㅅㅎㅅㅈㅅ', related_words = ARRAY['경기종합지수']::text[] WHERE id = 289;  -- 생산확산지수
UPDATE public.words SET word = '생성형 인공지능(AI)', meaning = '학습한 데이터를 바탕으로 글·그림·코드 등 새 콘텐츠를 만들어 내는 인공지능', hint = 'ㅅㅅㅎㅇㄱㅈㄴ', related_words = '{}'::text[] WHERE id = 290;  -- 생성형 인공지능(AI)
UPDATE public.words SET word = '생활물가지수', meaning = '자주 사는 생필품만 골라 체감 물가를 재는 물가지수', hint = 'ㅅㅎㅁㄱㅈㅅ', related_words = ARRAY['물가지수','소비자물가지수(CPI)']::text[] WHERE id = 291;  -- 생활물가지수
UPDATE public.words SET word = '서비스수지', meaning = '운송·여행·금융 등 서비스를 외국과 거래해 번 돈과 쓴 돈의 차이', hint = 'ㅅㅂㅅㅅㅈ', related_words = ARRAY['경상수지']::text[] WHERE id = 292;  -- 서비스수지
UPDATE public.words SET word = '서킷브레이커', meaning = '주가가 급등락할 때 거래를 잠시 멈추는 증시 매매거래중단 제도', hint = 'ㅅㅋㅂㄹㅇㅋ', related_words = '{}'::text[] WHERE id = 293;  -- 서킷브레이커
UPDATE public.words SET word = '서학개미', meaning = '미국 등 해외 주식에 직접 투자하는 한국 개인투자자', hint = 'ㅅㅎㄱㅁ', related_words = '{}'::text[] WHERE id = 294;  -- 서학개미
UPDATE public.words SET word = '선물거래', meaning = '표준화된 상품을 거래소에서 미래 정해진 날에 인수·결제하기로 하는 거래', hint = 'ㅅㅁㄱㄹ', related_words = ARRAY['옵션','스왑']::text[] WHERE id = 295;  -- 선물거래
UPDATE public.words SET word = '선물환거래', meaning = '지금 정한 환율로 미래 특정일에 외화를 주고받기로 하는 거래', hint = 'ㅅㅁㅎㄱㄹ', related_words = ARRAY['차액결제선물환(NDF) 거래']::text[] WHERE id = 296;  -- 선물환거래
UPDATE public.words SET word = '선물환포지션비율 규제', meaning = '은행의 선물환 보유액을 자기자본의 일정 비율 이내로 묶는 규제', hint = 'ㅅㅁㅎㅍㅈㅅㅂㅇㄱㅈ', related_words = '{}'::text[] WHERE id = 297;  -- 선물환포지션비율 규제
UPDATE public.words SET word = '선불카드(선불전자지급수단)', meaning = '미리 돈을 충전해 두고 쓸 때마다 차감되는 카드', hint = 'ㅅㅂㅋㄷ', related_words = ARRAY['지급수단','직불카드','전자화폐']::text[] WHERE id = 298;  -- 선불카드/선불전자지급수단
UPDATE public.words SET word = '선행종합지수', meaning = '재고순환·장단기금리차 등 경기에 앞서 움직이는 지표로 미래 경기를 예측하는 지수', hint = 'ㅅㅎㅈㅎㅈㅅ', related_words = ARRAY['경기종합지수','후행종합지수']::text[] WHERE id = 299;  -- 선행종합지수
UPDATE public.words SET word = '세계경제포럼(다보스포럼)', meaning = '매년 스위스 다보스에 세계 경제 리더들이 모여 토론하는 국제회의', hint = 'ㅅㄱㄱㅈㅍㄹ', related_words = '{}'::text[] WHERE id = 300;  -- 세계경제포럼(다보스포럼)
