-- ===== 콘텐츠 정제 11/36 (refine.py 생성 — 손으로 고치지 말고 meanings.py를 고친 뒤 다시 실행) =====
-- 뜻 전면 재작성·슬래시 항목 분리(신규 31행)·힌트 기본형 초성·related_words 정리·본문 줄이음 자국 제거.
-- 적용 순서: 16_words_refine_1..N -> 17_courses.sql

UPDATE public.words SET word = '반대매매', meaning = '빚으로 산 주식의 담보가치가 떨어지면 증권사가 강제로 팔아 버리는 것', hint = 'ㅂㄷㅁㅁ', related_words = ARRAY['신용거래','담보비율']::text[] WHERE id = 226;  -- 반대매매
UPDATE public.words SET word = '발행시장', meaning = '기업이나 정부가 주식·채권을 새로 발행해 처음 투자자에게 파는 시장', hint = 'ㅂㅎㅅㅈ', related_words = ARRAY['유통시장']::text[] WHERE id = 227;  -- 발행시장
UPDATE public.words SET word = '발행어음', meaning = '증권사 등이 고객에게 돈을 빌리고 대신 써 주는 만기 1년 이내 어음', hint = 'ㅂㅎㅇㅇ', related_words = ARRAY['자본시장법','종합금융투자사업자']::text[] WHERE id = 228;  -- 발행어음
UPDATE public.words SET word = '발행중지화폐', meaning = '더 이상 새로 찍지는 않지만 여전히 쓸 수 있는 화폐', hint = 'ㅂㅎㅈㅈㅎㅍ', related_words = ARRAY['제1차 통화조치','제2차 통화조치','유통정지화폐']::text[] WHERE id = 229;  -- 발행중지화폐/유통정지화폐
UPDATE public.words SET word = '방카슈랑스', meaning = '은행 창구에서 보험상품을 파는 것', hint = 'ㅂㅋㅅㄹㅅ', related_words = ARRAY['범위의 경제']::text[] WHERE id = 230;  -- 방카슈랑스
UPDATE public.words SET word = '배당할인모형', meaning = '앞으로 받을 배당금을 현재가치로 할인해 주식의 적정 가치를 구하는 모형', hint = 'ㅂㄷㅎㅇㅁㅎ', related_words = ARRAY['배당금','할인율']::text[] WHERE id = 231;  -- 배당할인모형
UPDATE public.words SET word = '밴드웨건효과', meaning = '남들이 많이 사니까 나도 따라 사는 유행 편승 소비 현상', hint = 'ㅂㄷㅇㄱㅎㄱ', related_words = ARRAY['속물효과(스놉효과)','베블런효과']::text[] WHERE id = 232;  -- 밴드웨건효과
UPDATE public.words SET word = '뱅크런', meaning = '은행이 불안해 보이자 예금자들이 한꺼번에 돈을 빼 가는 사태', hint = 'ㅂㅋㄹ', related_words = ARRAY['예금보험제도']::text[] WHERE id = 233;  -- 뱅크런
UPDATE public.words SET word = '범위의 경제', meaning = '한 기업이 여러 제품을 함께 만들 때 평균 비용이 줄어드는 현상', hint = 'ㅂㅇㅇㄱㅈ', related_words = ARRAY['규모의 경제']::text[] WHERE id = 234;  -- 범위의 경제
UPDATE public.words SET word = '법정화폐', meaning = '법으로 지급 효력을 인정해 누구나 받아야 하는 화폐(한국은행권과 주화)', hint = 'ㅂㅈㅎㅍ', related_words = '{}'::text[] WHERE id = 235;  -- 법정화폐
UPDATE public.words SET word = '베버리지곡선', meaning = '실업률과 빈일자리율의 관계로 노동시장 효율을 보여주는 곡선', hint = 'ㅂㅂㄹㅈㄱㅅ', related_words = '{}'::text[] WHERE id = 236;  -- 베버리지곡선
UPDATE public.words SET word = '베블런효과', meaning = '명품처럼 비쌀수록 과시 욕구 때문에 오히려 더 사는 소비 현상', hint = 'ㅂㅂㄹㅎㄱ', related_words = ARRAY['기펜재','밴드웨건효과']::text[] WHERE id = 237;  -- 베블런효과
UPDATE public.words SET word = '변동금리', meaning = '일정 주기마다 시장금리에 맞춰 약정 이자율이 바뀌는 금리', hint = 'ㅂㄷㄱㄹ', related_words = ARRAY['고정금리','자금조달비용지수(COFIX)']::text[] WHERE id = 238;  -- 변동금리
UPDATE public.words SET word = '보복소비', meaning = '오랫동안 억눌렸던 소비가 한꺼번에 터져 나오는 현상', hint = 'ㅂㅂㅅㅂ', related_words = '{}'::text[] WHERE id = 239;  -- 보복소비
UPDATE public.words SET word = '보완자본(Tier 2)', meaning = '은행이 망할 때 예금자보다 먼저 손실을 떠안는 후순위 성격의 보조 자본', hint = 'ㅂㅇㅈㅂ', related_words = ARRAY['BIS 자기자본비율','기본자본(Tier 1)']::text[] WHERE id = 240;  -- 보완자본(Tier 2)
UPDATE public.words SET word = '보완재', meaning = '자동차와 휘발유처럼 함께 써야 효용이 생기는 짝꿍 재화', hint = 'ㅂㅇㅈ', related_words = ARRAY['대체재']::text[] WHERE id = 241;  -- 보완재
UPDATE public.words SET word = '보통주자본(Common Equity Tier 1)', meaning = '보통주와 이익잉여금으로 이뤄진, 손실을 가장 먼저 흡수하는 은행의 핵심 자본', hint = 'ㅂㅌㅈㅈㅂ', related_words = ARRAY['기본자본(Tier 1)','기타기본자본(Additional Tier 1)']::text[] WHERE id = 242;  -- 보통주자본(Common Equity Tier 1)
UPDATE public.words SET word = '보편관세', meaning = '모든 나라와 품목에 똑같은 세율을 매기는 관세', hint = 'ㅂㅍㄱㅅ', related_words = '{}'::text[] WHERE id = 243;  -- 보편관세
UPDATE public.words SET word = '보호무역주의', meaning = '자국 산업을 지키려고 관세·수입 제한으로 외국 상품을 막는 정책', hint = 'ㅂㅎㅁㅇㅈㅇ', related_words = ARRAY['긴급수입제한조치']::text[] WHERE id = 244;  -- 보호무역주의
UPDATE public.words SET word = '복수통화바스켓제도', meaning = '교역 비중이 큰 여러 나라 통화를 묶어 그 가치 변동에 따라 환율을 정하는 제도', hint = 'ㅂㅅㅌㅎㅂㅅㅋㅈㄷ', related_words = ARRAY['고정환율제도','자유변동환율제도','미달러화페그제도']::text[] WHERE id = 245;  -- 복수통화바스켓제도
UPDATE public.words SET word = '본드포워드거래', meaning = '미래 특정 시점에 정해진 가격으로 채권을 사고팔기로 미리 약속하는 장외 계약', hint = 'ㅂㄷㅍㅇㄷㄱㄹ', related_words = '{}'::text[] WHERE id = 246;  -- 본드포워드거래
UPDATE public.words SET word = '본원소득', meaning = '생산에 참여하거나 자산을 빌려주고 받는 임금·이자·배당 등의 소득', hint = 'ㅂㅇㅅㄷ', related_words = ARRAY['영업잉여','피용자보수']::text[] WHERE id = 247;  -- 본원소득
UPDATE public.words SET word = '본원소득수지', meaning = '외국과 주고받은 임금·이자·배당의 차이(경상수지의 한 항목)', hint = 'ㅂㅇㅅㄷㅅㅈ', related_words = ARRAY['본원소득']::text[] WHERE id = 248;  -- 본원소득수지
UPDATE public.words SET word = '부가가치', meaning = '생산 과정에서 새로 만들어 낸 가치(총산출에서 중간재 투입을 뺀 것)', hint = 'ㅂㄱㄱㅊ', related_words = ARRAY['총산출','글로벌가치사슬(GVC)']::text[] WHERE id = 249;  -- 부가가치
UPDATE public.words SET word = '부가가치기준 무역(TiVA)', meaning = '수출액이 아니라 각 나라가 실제 만든 부가가치 기준으로 무역을 재는 통계', hint = 'ㅂㄱㄱㅊㄱㅈㅁㅇ', related_words = ARRAY['산업연관표(I/O Tables)']::text[] WHERE id = 250;  -- 부가가치기준 무역(TiVA)
