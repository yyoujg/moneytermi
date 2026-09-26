-- ===== 콘텐츠 정제 20/36 (refine.py 생성 — 손으로 고치지 말고 meanings.py를 고친 뒤 다시 실행) =====
-- 뜻 전면 재작성·슬래시 항목 분리(신규 31행)·힌트 기본형 초성·related_words 정리·본문 줄이음 자국 제거.
-- 적용 순서: 16_words_refine_1..N -> 17_courses.sql

UPDATE public.words SET word = '인구고령화', meaning = '평균수명이 늘고 출산율이 줄어 고령자 비중이 높아지는 현상', hint = 'ㅇㄱㄱㄹㅎ', related_words = ARRAY['합계출산율']::text[] WHERE id = 451;  -- 인구고령화
UPDATE public.words SET word = '인적자본', meaning = '교육과 훈련으로 쌓인 개인의 능력·기술·지식(노동의 질)', hint = 'ㅇㅈㅈㅂ', related_words = ARRAY['노동생산성']::text[] WHERE id = 452;  -- 인적자본
UPDATE public.words SET word = '인터넷뱅킹', meaning = '인터넷으로 계좌조회·이체 같은 은행 업무를 보는 서비스', hint = 'ㅇㅌㄴㅂㅋ', related_words = ARRAY['모바일뱅킹','텔레뱅킹(폰뱅킹)']::text[] WHERE id = 453;  -- 인터넷뱅킹
UPDATE public.words SET word = '인플레이션', meaning = '물가가 지속적으로 오르는 현상', hint = 'ㅇㅍㄹㅇㅅ', related_words = ARRAY['디스인플레이션','디플레이션']::text[] WHERE id = 454;  -- 인플레이션
UPDATE public.words SET word = '인플레이션감축법(IRA)', meaning = '미국이 2022년 청정에너지 지원과 의약품 가격 인하 등을 담아 만든 법', hint = 'ㅇㅍㄹㅇㅅㄱㅊㅂ', related_words = '{}'::text[] WHERE id = 455;  -- 인플레이션감축법(IRA)
UPDATE public.words SET word = '일대일로', meaning = '아시아·아프리카·유럽을 육로와 해로로 잇겠다는 중국의 경제권 구상', hint = 'ㅇㄷㅇㄹ', related_words = '{}'::text[] WHERE id = 456;  -- 일대일로
UPDATE public.words SET word = '일물일가의 법칙', meaning = '완전경쟁 시장에서는 같은 상품의 가격이 어디서나 같아진다는 법칙', hint = 'ㅇㅁㅇㄱㅇㅂㅊ', related_words = ARRAY['구매력평가환율']::text[] WHERE id = 457;  -- 일물일가의 법칙
UPDATE public.words SET word = '일반특혜관세', meaning = '선진국이 개발도상국 수입품에 조건 없이 관세를 깎아 주는 특혜', hint = 'ㅇㅂㅌㅎㄱㅅ', related_words = ARRAY['상계관세','할당관세제도']::text[] WHERE id = 458;  -- 일반특혜관세
UPDATE public.words SET word = '일중RP제도', meaning = '중앙은행이 당일 되사기로 하고 은행에 낮 동안 결제 자금을 빌려주는 제도', hint = 'ㅇㅈRㅈㄷ', related_words = ARRAY['총액결제시스템','한은금융망(BOK-Wire+)']::text[] WHERE id = 459;  -- 일중RP제도
UPDATE public.words SET word = '일중당좌대출제도', meaning = '영업시간 중 은행의 결제 자금이 잠시 모자라면 한국은행이 자동으로 빌려주는 제도', hint = 'ㅇㅈㄷㅈㄷㅊㅈㄷ', related_words = ARRAY['거액지급시스템','결제리스크','일중RP제도']::text[] WHERE id = 460;  -- 일중당좌대출제도
UPDATE public.words SET word = '자금결제시스템', meaning = '은행 안에서 고객 계좌 간 이체만으로 결제를 끝내는 시스템', hint = 'ㅈㄱㄱㅈㅅㅅㅌ', related_words = '{}'::text[] WHERE id = 461;  -- 자금결제시스템
UPDATE public.words SET word = '자금관리서비스(CMS)공동망', meaning = '학원비·회비 등을 여러 계좌에서 한꺼번에 출금·입금하는 공동 지급망', hint = 'ㅈㄱㄱㄹㅅㅂㅅ', related_words = ARRAY['입금이체','출금이체']::text[] WHERE id = 462;  -- 자금관리서비스(CMS)공동망
UPDATE public.words SET word = '자금조달비용지수(COFIX)', meaning = '은행들의 평균 자금조달 금리로, 변동금리 대출의 기준이 되는 지수', hint = 'ㅈㄱㅈㄷㅂㅇㅈㅅ', related_words = '{}'::text[] WHERE id = 463;  -- 자금조달비용지수(COFIX)
UPDATE public.words SET word = '자기띠 카드', meaning = '뒷면 검은 띠에 정보를 기록한 옛 방식의 카드', hint = 'ㅈㄱㄸㅋㄷ', related_words = ARRAY['IC 카드']::text[] WHERE id = 464;  -- 자기띠 카드
UPDATE public.words SET word = '자기자본비율', meaning = '총자산 중 자기자본이 차지하는 비중(재무 안정성 지표)', hint = 'ㅈㄱㅈㅂㅂㅇ', related_words = ARRAY['BIS 자기자본비율']::text[] WHERE id = 465;  -- 자기자본비율
UPDATE public.words SET word = '자기자본이익률(ROE)', meaning = '자기자본으로 얼마나 많은 순이익을 냈는지 보는 수익성 지표', hint = 'ㅈㄱㅈㅂㅇㅇㄹ', related_words = ARRAY['주당순이익(EPS)']::text[] WHERE id = 466;  -- 자기자본이익률(ROE)
UPDATE public.words SET word = '자동안정화장치', meaning = '누진세·실업급여처럼 정부가 손대지 않아도 경기 진폭을 자동으로 줄여 주는 장치', hint = 'ㅈㄷㅇㅈㅎㅈㅊ', related_words = ARRAY['경기조절정책(경제안정화정책)','사회보험']::text[] WHERE id = 467;  -- 자동안정화장치
UPDATE public.words SET word = '자발적 실업', meaning = '일할 능력은 있지만 임금이 낮다고 스스로 일하지 않는 실업', hint = 'ㅈㅂㅈㅅㅇ', related_words = ARRAY['마찰적 실업','실망실업자']::text[] WHERE id = 468;  -- 자발적 실업
UPDATE public.words SET word = '자본거래자유화', meaning = '국경을 넘는 자본 이동에 대한 규제를 없애는 것', hint = 'ㅈㅂㄱㄹㅈㅇㅎ', related_words = ARRAY['외국환거래법','경제협력개발기구(OECD)']::text[] WHERE id = 469;  -- 자본거래자유화
UPDATE public.words SET word = '자본생산성', meaning = '투입한 자본 한 단위당 얼마나 생산했는지의 비율', hint = 'ㅈㅂㅅㅅㅅ', related_words = ARRAY['노동생산성']::text[] WHERE id = 470;  -- 자본생산성
UPDATE public.words SET word = '자본시장법', meaning = '증권거래법 등 6개 법을 합쳐 2009년 시행된 자본시장 통합법', hint = 'ㅈㅂㅅㅈㅂ', related_words = ARRAY['간접금융','직접금융']::text[] WHERE id = 471;  -- 자본시장법
UPDATE public.words SET word = '자본적정성', meaning = '금융회사가 손실을 견딜 만큼 충분한 자본을 갖췄는지의 정도', hint = 'ㅈㅂㅈㅈㅅ', related_words = '{}'::text[] WHERE id = 472;  -- 자본적정성
UPDATE public.words SET word = '자본적지출', meaning = '기계·건물의 수명을 늘리거나 성능을 크게 높이는 데 쓴 지출(투자로 처리)', hint = 'ㅈㅂㅈㅈㅊ', related_words = ARRAY['국내총투자율']::text[] WHERE id = 473;  -- 자본적지출
UPDATE public.words SET word = '자산건전성 분류', meaning = '금융회사 자산을 정상·요주의·고정·회수의문·추정손실 5단계로 나누는 것', hint = 'ㅈㅅㄱㅈㅅㅂㄹ', related_words = ARRAY['대손충당금적립비율']::text[] WHERE id = 474;  -- 자산건전성 분류
UPDATE public.words SET word = '자산유동화', meaning = '대출채권 등을 특수목적회사에 넘겨 이를 담보로 증권을 발행하는 것', hint = 'ㅈㅅㅇㄷㅎ', related_words = ARRAY['특수목적기구(SPV)','주택저당증권(MBS)']::text[] WHERE id = 475;  -- 자산유동화
