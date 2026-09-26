-- ===== 콘텐츠 정제 8/15 (refine.py 생성 — 손으로 고치지 말고 meanings.py를 고친 뒤 다시 실행) =====
-- 라이브 덤프와 비교해 아직 적용되지 않은 행만. 단문 UPDATE 294행, 본문 UPDATE 64행.
-- 적용 순서: 16_words_refine_1..N -> 17_courses.sql

UPDATE public.words SET word = '워크아웃', meaning = '부실기업을 채권 은행과 협의해 빚을 조정하며 살려 내는 절차', hint = 'ㅇㅋㅇㅇ', related_words = '{}'::text[] WHERE id = 420;  -- 워크아웃
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
UPDATE public.words SET word = '자연독점', meaning = '규모의 경제 때문에 한 기업만 남게 되는 자연스러운 독점(전기·수도)', hint = 'ㅈㅇㄷㅈ', related_words = ARRAY['규모의 경제']::text[] WHERE id = 476;  -- 자연독점
UPDATE public.words SET word = '자연실업률', meaning = '물가를 자극하지 않으면서 유지할 수 있는 가장 낮은 실업률', hint = 'ㅈㅇㅅㅇㄹ', related_words = ARRAY['실업률갭','필립스곡선']::text[] WHERE id = 477;  -- 자연실업률
UPDATE public.words SET word = '자원민족주의', meaning = '자원 보유국이 석유·광물 통제를 강화해 영향력을 키우려는 경향', hint = 'ㅈㅇㅁㅈㅈㅇ', related_words = '{}'::text[] WHERE id = 478;  -- 자원민족주의
UPDATE public.words SET word = '자유무역협정(FTA)', meaning = '협정을 맺은 나라끼리 관세와 무역장벽을 없애는 협정', hint = 'ㅈㅇㅁㅇㅎㅈ', related_words = ARRAY['상계관세']::text[] WHERE id = 479;  -- 자유무역협정(FTA)
UPDATE public.words SET word = '자유재', meaning = '공기처럼 대가 없이 얼마든지 얻을 수 있는 재화', hint = 'ㅈㅇㅈ', related_words = ARRAY['기펜재']::text[] WHERE id = 480;  -- 자유재
UPDATE public.words SET word = '작업증명', meaning = '컴퓨터 연산 작업을 수행했음을 증명해 블록체인 거래를 검증하는 방식(채굴)', hint = 'ㅈㅇㅈㅁ', related_words = ARRAY['비트코인']::text[] WHERE id = 481;  -- 작업증명
UPDATE public.words SET word = '잠재GDP성장률', meaning = '노동·자본을 최대로 활용했을 때 달성 가능한 경제의 최대 성장률', hint = 'ㅈㅈGㅅㅈㄹ', related_words = ARRAY['GDP갭']::text[] WHERE id = 482;  -- 잠재GDP성장률
UPDATE public.words SET word = '잠재경제활동인구', meaning = '지금은 비경제활동인구지만 사실상 구직자로 볼 수 있는 잠재 취업자·구직자', hint = 'ㅈㅈㄱㅈㅎㄷㅇㄱ', related_words = ARRAY['경제활동인구/비경제활동인구/경제활동참가율']::text[] WHERE id = 483;  -- 잠재경제활동인구
UPDATE public.words SET word = '장기금융시장(자본시장)', meaning = '1년 이상 장기 채권과 주식이 거래되는 시장', hint = 'ㅈㄱㄱㅇㅅㅈ', related_words = ARRAY['단기금융시장']::text[] WHERE id = 484;  -- 장기금융시장(자본시장)
