-- ===== 콘텐츠 정제 5/36 (refine.py 생성 — 손으로 고치지 말고 meanings.py를 고친 뒤 다시 실행) =====
-- 뜻 전면 재작성·슬래시 항목 분리(신규 31행)·힌트 기본형 초성·related_words 정리·본문 줄이음 자국 제거.
-- 적용 순서: 16_words_refine_1..N -> 17_courses.sql

UPDATE public.words SET word = '국민처분가능소득(NDI)', meaning = '나라 전체가 소비나 저축에 자유롭게 쓸 수 있는 소득', hint = 'ㄱㅁㅊㅂㄱㄴㅅㄷ', related_words = ARRAY['국민총소득(GNI)','국민총처분가능소득(GNDI)']::text[] WHERE id = 76;  -- 국민처분가능소득(NDI)/ 국민총처분가능소득(GNDI)
UPDATE public.words SET word = '국민총소득(GNI)', meaning = '한 나라 국민이 국내외에서 일정 기간 벌어들인 소득의 합계', hint = 'ㄱㅁㅊㅅㄷ', related_words = ARRAY['국내총생산(GDP)','국외순수취요소소득']::text[] WHERE id = 77;  -- 국민총소득(GNI)
UPDATE public.words SET word = '국부펀드', meaning = '나라가 보유한 돈을 국내외 자산에 투자해 굴리는 국가 투자기금', hint = 'ㄱㅂㅍㄷ', related_words = ARRAY['외환보유액','헤지펀드']::text[] WHERE id = 78;  -- 국부펀드
UPDATE public.words SET word = '국외투자율', meaning = '나라 전체 소득 중 국내에 투자하고 남아 해외로 나간 저축의 비율', hint = 'ㄱㅇㅌㅈㅇ', related_words = ARRAY['국민총처분가능소득','총투자율','국내총투자율','총저축률']::text[] WHERE id = 79;  -- 국외투자율
UPDATE public.words SET word = '국제결제은행(BIS)', meaning = '각국 중앙은행들이 협력하는, 세계에서 가장 오래된 국제금융기구', hint = 'ㄱㅈㄱㅈㅇㅎ', related_words = '{}'::text[] WHERE id = 80;  -- 국제결제은행(BIS)
UPDATE public.words SET word = '국제금융시장', meaning = '국경을 넘어 자금을 빌리고 빌려주는 거래가 이뤄지는 시장', hint = 'ㄱㅈㄱㅇㅅㅈ', related_words = ARRAY['국제금융중심지']::text[] WHERE id = 81;  -- 국제금융시장
UPDATE public.words SET word = '국제금융중심지', meaning = '뉴욕·런던처럼 세계 금융회사와 국제 금융거래가 몰리는 도시', hint = 'ㄱㅈㄱㅇㅈㅅㅈ', related_words = ARRAY['국제금융시장']::text[] WHERE id = 82;  -- 국제금융중심지
UPDATE public.words SET word = '국제산업연관표', meaning = '여러 나라의 산업연관표를 수출입으로 연결해 하나로 만든 표', hint = 'ㄱㅈㅅㅇㅇㄱㅍ', related_words = ARRAY['산업연관표(I/O Tables)']::text[] WHERE id = 83;  -- 국제산업연관표
UPDATE public.words SET word = '국제수지(BOP)', meaning = '일정 기간 한 나라가 외국과 거래하며 받은 돈과 준 돈의 차이', hint = 'ㄱㅈㅅㅈ', related_words = ARRAY['경상수지','국제수지표']::text[] WHERE id = 84;  -- 국제수지(BOP)
UPDATE public.words SET word = '국제수지표', meaning = '한 나라와 외국 사이의 모든 경제 거래를 국제 기준에 따라 기록한 표', hint = 'ㄱㅈㅅㅈㅍ', related_words = ARRAY['국제수지(BOP)','경상수지']::text[] WHERE id = 85;  -- 국제수지표
UPDATE public.words SET word = '국제원유가격', meaning = '서부텍사스유·브렌트유·두바이유 등 대표 유종의 국제 거래 가격', hint = 'ㄱㅈㅇㅇㄱㄱ', related_words = ARRAY['선물거래']::text[] WHERE id = 86;  -- 국제원유가격
UPDATE public.words SET word = '국제증권감독기구(IOSCO)', meaning = '세계 각국 증권 감독기관이 모여 공통 규제 기준을 만드는 국제기구', hint = 'ㄱㅈㅈㄱㄱㄷㄱㄱ', related_words = ARRAY['금융시장인프라(FMI)']::text[] WHERE id = 87;  -- 국제증권감독기구(IOSCO)
UPDATE public.words SET word = '국제통화기금(IMF)', meaning = '외환위기에 빠진 나라에 돈을 빌려주고 국제통화 안정을 돕는 국제기구', hint = 'ㄱㅈㅌㅎㄱㄱ', related_words = ARRAY['IMF 쿼타','특별인출권(SDR)']::text[] WHERE id = 88;  -- 국제통화기금(IMF)
UPDATE public.words SET word = '국제통화시장(IMM)', meaning = '시카고상업거래소 안에 만들어진 세계 최초의 통화선물 거래소', hint = 'ㄱㅈㅌㅎㅅㅈ', related_words = ARRAY['시카고상업거래소']::text[] WHERE id = 89;  -- 국제통화시장(IMM)
UPDATE public.words SET word = '국제투자대조표(IIP)', meaning = '특정 시점에 한 나라가 외국에 가진 금융자산과 진 금융부채의 잔액표', hint = 'ㄱㅈㅌㅈㄷㅈㅍ', related_words = ARRAY['국제수지(BOP)']::text[] WHERE id = 90;  -- 국제투자대조표(IIP)
UPDATE public.words SET word = '국제회계기준', meaning = '나라마다 다른 회계 처리를 통일하려고 만든 국제 공통 회계 기준', hint = 'ㄱㅈㅎㄱㄱㅈ', related_words = '{}'::text[] WHERE id = 91;  -- 국제회계기준
UPDATE public.words SET word = '국채', meaning = '정부가 나랏돈을 마련하려고 발행하는 채권', hint = 'ㄱㅊ', related_words = '{}'::text[] WHERE id = 92;  -- 국채
UPDATE public.words SET word = '국채선물', meaning = '국채를 기초자산으로 미래 가격을 미리 정해 사고파는 선물거래', hint = 'ㄱㅊㅅㅁ', related_words = ARRAY['채권시가평가제도','시카고상업거래소(CME)']::text[] WHERE id = 93;  -- 국채선물
UPDATE public.words SET word = '규모의 경제', meaning = '많이 만들수록 제품 하나당 평균 비용이 낮아지는 현상', hint = 'ㄱㅁㅇㄱㅈ', related_words = ARRAY['범위의 경제']::text[] WHERE id = 94;  -- 규모의 경제
UPDATE public.words SET word = '규제 샌드박스', meaning = '핀테크 기업이 규제를 잠시 면제받고 새 서비스를 시험해 볼 수 있는 제도', hint = 'ㄱㅈㅅㄷㅂㅅ', related_words = ARRAY['핀테크','로보어드바이저']::text[] WHERE id = 95;  -- 규제 샌드박스
UPDATE public.words SET word = '그램-리치-블라일리법', meaning = '1999년 미국이 은행·증권·보험의 겸업을 다시 허용한 금융서비스현대화법', hint = 'ㄱㄹㄹㅊㅂㄹㅇㄹㅂ', related_words = ARRAY['글래스-스티걸법','투자은행']::text[] WHERE id = 96;  -- 그램-리치-블라일리법
UPDATE public.words SET word = '그린본드', meaning = '조달한 돈을 기후·환경 사업에만 쓰기로 하고 발행하는 채권', hint = 'ㄱㄹㅂㄷ', related_words = '{}'::text[] WHERE id = 97;  -- 그린본드
UPDATE public.words SET word = '그림자금융(NBFI)', meaning = '은행처럼 돈을 중개하지만 은행 규제와 예금자보호는 받지 않는 금융', hint = 'ㄱㄹㅈㄱㅇ', related_words = '{}'::text[] WHERE id = 98;  -- 그림자금융/비은행금융중개(NBFI)
UPDATE public.words SET word = '근원인플레이션율', meaning = '농산물·석유처럼 일시적으로 출렁이는 품목을 뺀 기조적 물가상승률', hint = 'ㄱㅇㅇㅍㄹㅇㅅㅇ', related_words = ARRAY['기대인플레이션','인플레이션']::text[] WHERE id = 99;  -- 근원인플레이션율
UPDATE public.words SET word = '글래스-스티걸법', meaning = '1933년 미국이 은행과 증권 업무를 분리시킨 은행법', hint = 'ㄱㄹㅅㅅㅌㄱㅂ', related_words = ARRAY['그램-리치-블라일리법','투자은행']::text[] WHERE id = 100;  -- 글래스-스티걸법
