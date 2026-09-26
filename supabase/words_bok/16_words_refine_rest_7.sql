-- ===== 콘텐츠 정제 7/15 (refine.py 생성 — 손으로 고치지 말고 meanings.py를 고친 뒤 다시 실행) =====
-- 라이브 덤프와 비교해 아직 적용되지 않은 행만. 단문 UPDATE 294행, 본문 UPDATE 64행.
-- 적용 순서: 16_words_refine_1..N -> 17_courses.sql

UPDATE public.words SET word = '오픈뱅킹', meaning = '한 앱에서 여러 은행 계좌를 조회·이체할 수 있게 금융 데이터를 개방하는 제도', hint = 'ㅇㅍㅂㅋ', related_words = '{}'::text[] WHERE id = 395;  -- 오픈뱅킹
UPDATE public.words SET word = '옵션', meaning = '미리 정한 가격에 미래에 사거나 팔 수 있는 권리를 사고파는 계약', hint = 'ㅇㅅ', related_words = ARRAY['콜옵션','풋옵션']::text[] WHERE id = 396;  -- 옵션
UPDATE public.words SET word = '와타나베 부인', meaning = '싼 엔화를 빌려 해외 고금리 자산에 투자하는 일본 개인투자자', hint = 'ㅇㅌㄴㅂㅂㅇ', related_words = '{}'::text[] WHERE id = 397;  -- 와타나베 부인
UPDATE public.words SET word = '완충자본', meaning = '위기 때 손실을 흡수하도록 최소 자기자본 위에 추가로 쌓아 두는 은행 자본', hint = 'ㅇㅊㅈㅂ', related_words = ARRAY['BIS 자기자본비율','기본자본(Tier 1)','보완자본(Tier 2)']::text[] WHERE id = 398;  -- 완충자본
UPDATE public.words SET word = '외국환거래법', meaning = '외환거래의 자유를 원칙으로 하되 필요한 최소한만 규제하는 우리나라 외환 기본법', hint = 'ㅇㄱㅎㄱㄹㅂ', related_words = ARRAY['국제수지(BOP)','자본거래자유화']::text[] WHERE id = 399;  -- 외국환거래법
UPDATE public.words SET word = '외국환은행(외국환업무취급기관)', meaning = '정부에 등록하고 외환 업무를 할 수 있는 은행 등 금융기관', hint = 'ㅇㄱㅎㅇㅎ', related_words = ARRAY['외환전산망']::text[] WHERE id = 400;  -- 외국환업무취급기관/외국환은행
UPDATE public.words SET word = '외국환중개회사', meaning = '은행들 사이의 외환 거래를 중개해 주는 회사', hint = 'ㅇㄱㅎㅈㄱㅎㅅ', related_words = ARRAY['시장평균환율(MAR)']::text[] WHERE id = 401;  -- 외국환중개회사
UPDATE public.words SET word = '외국환평형기금', meaning = '환율 안정을 위해 정부가 외환시장에 개입할 때 쓰는 기금', hint = 'ㅇㄱㅎㅍㅎㄱㄱ', related_words = ARRAY['외환시장']::text[] WHERE id = 402;  -- 외국환평형기금
UPDATE public.words SET word = '외국환포지션', meaning = '보유한 외화자산과 외화부채의 차액(환율 위험에 노출된 정도)', hint = 'ㅇㄱㅎㅍㅈㅅ', related_words = ARRAY['외환시장','외국환포지션한도']::text[] WHERE id = 403;  -- 외국환포지션
UPDATE public.words SET word = '외국환포지션한도', meaning = '은행의 외화자산·부채 차액을 자기자본의 일정 비율 이내로 제한하는 규제', hint = 'ㅇㄱㅎㅍㅈㅅㅎㄷ', related_words = ARRAY['외국환포지션','선물환포지션비율 규제','외환시장']::text[] WHERE id = 404;  -- 외국환포지션한도
UPDATE public.words SET word = '외부자금', meaning = '기업이 은행 대출이나 회사채 발행처럼 밖에서 끌어온 자금', hint = 'ㅇㅂㅈㄱ', related_words = ARRAY['내부자금']::text[] WHERE id = 405;  -- 외부자금
UPDATE public.words SET word = '외부효과', meaning = '한 사람의 행동이 대가 없이 남에게 이익이나 피해를 주는 현상(공해 등)', hint = 'ㅇㅂㅎㄱ', related_words = ARRAY['역선택','정보의 비대칭성']::text[] WHERE id = 406;  -- 외부효과
UPDATE public.words SET word = '외화자금시장', meaning = '외화를 금리를 매개로 빌리고 빌려주는 시장(외환스왑·통화스왑 시장)', hint = 'ㅇㅎㅈㄱㅅㅈ', related_words = ARRAY['외환시장','외환스왑거래','통화스왑']::text[] WHERE id = 407;  -- 외화자금시장
UPDATE public.words SET word = '외환건전성부담금제도', meaning = '은행의 외화 빚에 부담금을 매겨 과도한 외화 차입을 억제하는 제도', hint = 'ㅇㅎㄱㅈㅅㅂㄷㄱㅈㄷ', related_words = ARRAY['외채/대외채권','외국환평형기금']::text[] WHERE id = 408;  -- 외환건전성부담금제도
UPDATE public.words SET word = '외환동시결제(PVP)', meaning = '외환거래에서 두 통화를 동시에 주고받아 결제 위험을 없애는 방식', hint = 'ㅇㅎㄷㅅㄱㅈ', related_words = ARRAY['외환결제리스크','Herstatt 리스크','CLS은행']::text[] WHERE id = 409;  -- 외환동시결제(PVP)
UPDATE public.words SET word = '외환보유액', meaning = '중앙은행과 정부가 비상시에 쓰려고 쌓아 둔 외화 자산', hint = 'ㅇㅎㅂㅇㅇ', related_words = ARRAY['대외지급준비자산','특별인출권(SDR)']::text[] WHERE id = 410;  -- 외환보유액
UPDATE public.words SET word = '외환스왑거래', meaning = '지금 통화를 바꾸고 나중에 미리 정한 환율로 다시 되바꾸는 거래', hint = 'ㅇㅎㅅㅇㄱㄹ', related_words = ARRAY['스왑','선물환거래','통화스왑']::text[] WHERE id = 411;  -- 외환스왑거래
UPDATE public.words SET word = '외환시장', meaning = '서로 다른 나라 통화를 사고파는 시장', hint = 'ㅇㅎㅅㅈ', related_words = ARRAY['외화자금시장']::text[] WHERE id = 412;  -- 외환시장
UPDATE public.words SET word = '외환전산망', meaning = '외환거래 정보를 한국은행에 모아 관계 기관이 함께 쓰는 정보망', hint = 'ㅇㅎㅈㅅㅁ', related_words = ARRAY['국제수지(BOP)','외채/대외채권']::text[] WHERE id = 413;  -- 외환전산망
UPDATE public.words SET word = '요소비용', meaning = '시장가격에서 세금을 빼고 보조금을 더한, 생산요소가 실제로 받는 대가', hint = 'ㅇㅅㅂㅇ', related_words = ARRAY['요소비용 국민소득']::text[] WHERE id = 414;  -- 요소비용
UPDATE public.words SET word = '요소비용 국민소득', meaning = '임금과 영업잉여를 합친, 국민이 생산요소를 제공하고 실제로 번 순수 소득', hint = 'ㅇㅅㅂㅇㄱㅁㅅㄷ', related_words = ARRAY['영업잉여','피용자보수']::text[] WHERE id = 415;  -- 요소비용 국민소득
UPDATE public.words SET word = '우발부채(채무)', meaning = '지급보증·소송처럼 미래 사건에 따라 갚아야 할 수도 있는 잠재적 빚', hint = 'ㅇㅂㅂㅊ', related_words = '{}'::text[] WHERE id = 416;  -- 우발부채(채무)
UPDATE public.words SET word = '우발전환사채(코코본드)', meaning = '은행이 부실해지면 주식으로 바뀌거나 상각되는 조건이 붙은 채권', hint = 'ㅇㅂㅈㅎㅅㅊ', related_words = ARRAY['자기자본비율']::text[] WHERE id = 417;  -- 우발전환사채(코코본드)
UPDATE public.words SET word = '운영리스크', meaning = '내부 절차·사람·시스템의 실수나 외부 사건으로 손실이 날 위험', hint = 'ㅇㅇㄹㅅㅋ', related_words = '{}'::text[] WHERE id = 418;  -- 운영리스크
UPDATE public.words SET word = '워싱턴 컨센서스', meaning = '1990년대 미국이 중남미에 제시한 시장개방·민영화 중심의 미국식 경제 처방', hint = 'ㅇㅅㅌㅋㅅㅅㅅ', related_words = ARRAY['국제통화기금(IMF)','세계은행(World Bank)','동아시아 외환위기']::text[] WHERE id = 419;  -- 워싱턴 컨센서스
