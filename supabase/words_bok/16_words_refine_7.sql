-- ===== 콘텐츠 정제 7/36 (refine.py 생성 — 손으로 고치지 말고 meanings.py를 고친 뒤 다시 실행) =====
-- 뜻 전면 재작성·슬래시 항목 분리(신규 31행)·힌트 기본형 초성·related_words 정리·본문 줄이음 자국 제거.
-- 적용 순서: 16_words_refine_1..N -> 17_courses.sql

UPDATE public.words SET word = '금융지주회사', meaning = '은행·증권·보험 자회사의 지분을 보유해 그룹을 경영하는 모회사', hint = 'ㄱㅇㅈㅈㅎㅅ', related_words = '{}'::text[] WHERE id = 126;  -- 금융지주회사
UPDATE public.words SET word = '금융채', meaning = '은행·카드사 등 금융기관이 장기 자금을 마련하려고 발행하는 채권', hint = 'ㄱㅇㅊ', related_words = ARRAY['자금조달비용지수(COFIX)']::text[] WHERE id = 127;  -- 금융채
UPDATE public.words SET word = '금융취약성지수(FVI)', meaning = '자산가격 과열과 빚 누적 등 금융시스템에 쌓인 약점을 재는 지수', hint = 'ㄱㅇㅊㅇㅅㅈㅅ', related_words = ARRAY['금융불안지수(FSI)']::text[] WHERE id = 128;  -- 금융취약성지수(FVI)
UPDATE public.words SET word = '금융통화위원회', meaning = '기준금리 등 통화정책을 결정하는 한국은행의 최고 의사결정기구', hint = 'ㄱㅇㅌㅎㅇㅇㅎ', related_words = ARRAY['한국은행']::text[] WHERE id = 129;  -- 금융통화위원회
UPDATE public.words SET word = '금전신탁', meaning = '돈을 맡기면 전문가가 대출·채권 등에 굴려 수익을 돌려주는 신탁', hint = 'ㄱㅈㅅㅌ', related_words = '{}'::text[] WHERE id = 130;  -- 금전신탁
UPDATE public.words SET word = '기념화폐', meaning = '국가 행사나 역사적 사건을 기념해 특별히 발행하는 수집용 화폐', hint = 'ㄱㄴㅎㅍ', related_words = ARRAY['화폐 발행','화폐의 액면체계']::text[] WHERE id = 131;  -- 기념화폐
UPDATE public.words SET word = '기대인플레이션', meaning = '사람들이 앞으로 물가가 얼마나 오를 것이라고 예상하는 수준', hint = 'ㄱㄷㅇㅍㄹㅇㅅ', related_words = ARRAY['인플레이션']::text[] WHERE id = 132;  -- 기대인플레이션
UPDATE public.words SET word = '기본자본(Tier 1)', meaning = '은행이 영업을 계속하면서 손실을 흡수할 수 있는 핵심 자기자본', hint = 'ㄱㅂㅈㅂ', related_words = ARRAY['BIS 자기자본비율','보통주자본','기타기본자본','보완자본(Tier 2)']::text[] WHERE id = 133;  -- 기본자본(Tier 1)
UPDATE public.words SET word = '기업간(B2B) 지급시스템', meaning = '기업끼리 상거래에서 생긴 전자채권을 발행하고 결제하는 시스템', hint = 'ㄱㅇㄱ', related_words = '{}'::text[] WHERE id = 134;  -- 기업간(B2B) 지급시스템
UPDATE public.words SET word = '기업경기실사지수(BSI)', meaning = '기업가들에게 경기를 어떻게 보는지 설문해 지수로 만든 것', hint = 'ㄱㅇㄱㄱㅅㅅㅈㅅ', related_words = ARRAY['경제심리지수','소비자동향지수(CSI)']::text[] WHERE id = 135;  -- 기업경기실사지수(BSI)
UPDATE public.words SET word = '기업공개', meaning = '비상장 회사가 주식을 일반 투자자에게 팔아 증시에 상장하는 것', hint = 'ㄱㅇㄱㄱ', related_words = ARRAY['모집']::text[] WHERE id = 136;  -- 기업공개
UPDATE public.words SET word = '기업분할(물적분할, 인적분할)', meaning = '회사의 한 사업부를 떼어 내 새 회사로 만드는 것', hint = 'ㄱㅇㅂㅎ', related_words = '{}'::text[] WHERE id = 137;  -- 기업분할(물적분할, 인적분할)
UPDATE public.words SET word = '기업심리지수(CBSI)', meaning = '기업경기실사지수의 주요 항목을 합성해 기업 심리를 하나로 나타낸 지수', hint = 'ㄱㅇㅅㄹㅈㅅ', related_words = ARRAY['기업경기실사지수(BSI)']::text[] WHERE id = 138;  -- 기업심리지수(CBSI)
UPDATE public.words SET word = '기업어음(CP)', meaning = '신용 좋은 기업이 단기 자금을 빌리려고 자기 신용으로 발행하는 어음', hint = 'ㄱㅇㅇㅇ', related_words = ARRAY['진성어음','융통어음']::text[] WHERE id = 139;  -- 기업어음(CP)
UPDATE public.words SET word = '기업회생절차', meaning = '빚이 많은 기업을 법원이 관리해 살릴 길을 찾는 절차(법정관리)', hint = 'ㄱㅇㅎㅅㅈㅊ', related_words = '{}'::text[] WHERE id = 140;  -- 기업회생절차
UPDATE public.words SET word = '기저효과', meaning = '비교 시점이 유난히 높거나 낮아 증가율이 실제보다 부풀거나 쪼그라드는 착시', hint = 'ㄱㅈㅎㄱ', related_words = ARRAY['계절변동조정시계열']::text[] WHERE id = 141;  -- 기저효과
UPDATE public.words SET word = '기준금리', meaning = '한국은행 금융통화위원회가 정하는 모든 금리의 기준이 되는 정책금리', hint = 'ㄱㅈㄱㄹ', related_words = ARRAY['환매조건부매매(RP)']::text[] WHERE id = 142;  -- 기준금리
UPDATE public.words SET word = '기준순환일', meaning = '경기가 정점이나 저점을 찍고 방향을 바꾼 날짜', hint = 'ㄱㅈㅅㅎㅇ', related_words = ARRAY['경기','경기종합지수','동행종합지수']::text[] WHERE id = 143;  -- 기준순환일
UPDATE public.words SET word = '기준환율', meaning = '다른 통화 환율 계산의 기준이 되는 환율(우리나라는 원/달러)', hint = 'ㄱㅈㅎㅇ', related_words = ARRAY['재정환율']::text[] WHERE id = 144;  -- 기준환율
UPDATE public.words SET word = '기초가격', meaning = '생산자 판매가격에서 세금을 빼고 보조금을 더한, 생산자가 실제로 갖는 몫', hint = 'ㄱㅊㄱㄱ', related_words = ARRAY['국내총생산(GDP)']::text[] WHERE id = 145;  -- 기초가격
UPDATE public.words SET word = '기축통화', meaning = '달러처럼 국제 무역과 금융거래에서 중심 역할을 하는 통화', hint = 'ㄱㅊㅌㅎ', related_words = ARRAY['교환성 통화']::text[] WHERE id = 146;  -- 기축통화
UPDATE public.words SET word = '기타기본자본(Additional Tier 1)', meaning = '보통주 다음 순서로 손실을 메우는, 영구적 성격의 은행 자본', hint = 'ㄱㅌㄱㅂㅈㅂ', related_words = ARRAY['기본자본(Tier 1)','보통주자본(CET1)']::text[] WHERE id = 147;  -- 기타기본자본(Additional Tier 1)
UPDATE public.words SET word = '기펜재', meaning = '가격이 내렸는데도 오히려 수요가 줄어드는 예외적인 재화', hint = 'ㄱㅍㅈ', related_words = ARRAY['밴드웨건효과','베블런효과']::text[] WHERE id = 148;  -- 기펜재
UPDATE public.words SET word = '기회비용', meaning = '하나를 선택하면서 포기한 다른 선택지의 가치', hint = 'ㄱㅎㅂㅇ', related_words = ARRAY['한계비용']::text[] WHERE id = 149;  -- 기회비용
UPDATE public.words SET word = '기후테크', meaning = '기후변화를 막거나 줄이기 위한 청정에너지·탄소포집 등의 기술', hint = 'ㄱㅎㅌㅋ', related_words = ARRAY['에너지 믹스','녹색기후기금(GCF)']::text[] WHERE id = 150;  -- 기후테크
