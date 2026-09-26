-- ===== 콘텐츠 정제 4/36 (refine.py 생성 — 손으로 고치지 말고 meanings.py를 고친 뒤 다시 실행) =====
-- 뜻 전면 재작성·슬래시 항목 분리(신규 31행)·힌트 기본형 초성·related_words 정리·본문 줄이음 자국 제거.
-- 적용 순서: 16_words_refine_1..N -> 17_courses.sql

UPDATE public.words SET word = '공급사용표(SUT)', meaning = '산업을 기준으로 무엇을 만들고 쓰는지 정리한 산업연관표의 한 종류', hint = 'ㄱㄱㅅㅇㅍ', related_words = ARRAY['국민계정체계(SNA)','국민대차대조표']::text[] WHERE id = 51;  -- 공급사용표(SUT)
UPDATE public.words SET word = '공급탄력성', meaning = '가격이 변할 때 공급량이 얼마나 민감하게 반응하는지 나타낸 값', hint = 'ㄱㄱㅌㄹㅅ', related_words = ARRAY['수요탄력성']::text[] WHERE id = 52;  -- 공급탄력성
UPDATE public.words SET word = '공동부유', meaning = '소수가 아니라 국민 모두가 함께 잘살자는 중국의 정책 방향', hint = 'ㄱㄷㅂㅇ', related_words = ARRAY['독점/과점']::text[] WHERE id = 53;  -- 공동부유
UPDATE public.words SET word = '관리통화제도', meaning = '금 보유량과 상관없이 중앙은행이 통화량을 직접 조절하는 제도', hint = 'ㄱㄹㅌㅎㅈㄷ', related_words = ARRAY['금본위제도']::text[] WHERE id = 54;  -- 관리통화제도
UPDATE public.words SET word = '광의통화(M2)', meaning = '현금·요구불예금에 2년 이내 정기예금 등 쉽게 현금화되는 상품까지 더한 통화량', hint = 'ㄱㅇㅌㅎ', related_words = ARRAY['통화지표','통화량']::text[] WHERE id = 55;  -- 광의통화(M2)
UPDATE public.words SET word = '교환사채(EB)', meaning = '발행회사가 가진 다른 회사 주식과 바꿀 수 있는 권리가 붙은 회사채', hint = 'ㄱㅎㅅㅊ', related_words = ARRAY['신주인수권부사채(BW)','전환사채(CB)']::text[] WHERE id = 56;  -- 교환사채(EB)
UPDATE public.words SET word = '교환성 통화', meaning = '달러처럼 외환시장에서 자유롭게 바꿔 쓸 수 있는 국제 통용 통화', hint = 'ㄱㅎㅅㅌㅎ', related_words = ARRAY['기축통화','특별인출권(SDR)','복수통화바스켓제도']::text[] WHERE id = 57;  -- 교환성 통화
UPDATE public.words SET word = '구독경제', meaning = '제품을 사지 않고 매달 돈을 내며 빌려 쓰는 소비 방식', hint = 'ㄱㄷㄱㅈ', related_words = '{}'::text[] WHERE id = 58;  -- 구독경제
UPDATE public.words SET word = '구매력평가 환율', meaning = '두 나라에서 같은 물건 값이 같아지도록 계산한 이론상 환율(빅맥지수)', hint = 'ㄱㅁㄹㅍㄱㅎㅇ', related_words = ARRAY['빅맥지수','일물일가의 법칙','금리평가이론']::text[] WHERE id = 59;  -- 구매력평가 환율
UPDATE public.words SET word = '구인배수', meaning = '일자리 수를 구직자 수로 나눠 인력 수급을 보는 지표(1 이상이면 일자리 여유)', hint = 'ㄱㅇㅂㅅ', related_words = ARRAY['고용률','실업률갭']::text[] WHERE id = 60;  -- 구인배수
UPDATE public.words SET word = '국가경쟁력', meaning = '한 나라가 성장을 지속하고 국민 삶의 질을 높일 수 있는 능력', hint = 'ㄱㄱㄱㅈㄹ', related_words = '{}'::text[] WHERE id = 61;  -- 국가경쟁력
UPDATE public.words SET word = '국가신용등급', meaning = '한 나라가 빚을 갚을 능력과 의지를 평가해 매긴 등급', hint = 'ㄱㄱㅅㅇㄷㄱ', related_words = ARRAY['무디스','스탠더드&푸어스']::text[] WHERE id = 62;  -- 국가신용등급
UPDATE public.words SET word = '국가채무', meaning = '정부가 재정적자를 메우려고 국내외에서 빌려 진 빚', hint = 'ㄱㄱㅊㅁ', related_words = ARRAY['기대인플레이션']::text[] WHERE id = 63;  -- 국가채무
UPDATE public.words SET word = '국고금 실시간 전자이체', meaning = '정부가 지급할 돈을 수표 대신 받는 사람 계좌로 바로 넣어 주는 방식', hint = 'ㄱㄱㄱㅅㅅㄱㅈㅈㅇㅊ', related_words = ARRAY['국고수표','국고전산망']::text[] WHERE id = 64;  -- 국고금 실시간 전자이체
UPDATE public.words SET word = '국고대리점', meaning = '한국은행 대신 나랏돈을 받아 주도록 지정된 은행 영업점', hint = 'ㄱㄱㄷㄹㅈ', related_words = '{}'::text[] WHERE id = 65;  -- 국고대리점
UPDATE public.words SET word = '국고수표', meaning = '과거 정부가 나랏돈을 지급할 때 쓰던 수표(지금은 비상시에만 사용)', hint = 'ㄱㄱㅅㅍ', related_words = ARRAY['국고금 실시간 전자이체','국고전산망']::text[] WHERE id = 66;  -- 국고수표
UPDATE public.words SET word = '국고전산망', meaning = '정부·한국은행·은행을 연결해 나랏돈 업무를 전자적으로 처리하는 망', hint = 'ㄱㄱㅈㅅㅁ', related_words = ARRAY['국고금 실시간 전자이체']::text[] WHERE id = 67;  -- 국고전산망
UPDATE public.words SET word = '국내공급물가지수', meaning = '생산자물가와 수입물가를 합쳐 국내에 공급되는 물건의 가격 수준을 본 지수', hint = 'ㄱㄴㄱㄱㅁㄱㅈㅅ', related_words = ARRAY['생산자물가지수(PPI)','수출입물가지수']::text[] WHERE id = 68;  -- 국내공급물가지수
UPDATE public.words SET word = '국내총생산(GDP)', meaning = '한 나라 안에서 일정 기간 새로 만들어 낸 부가가치를 모두 더한 값', hint = 'ㄱㄴㅊㅅㅅ', related_words = ARRAY['국민총소득(GNI)']::text[] WHERE id = 69;  -- 국내총생산(GDP)
UPDATE public.words SET word = '국내총투자율', meaning = '나라 전체 처분가능소득 중 공장·설비·재고 등 투자에 쓰인 비율', hint = 'ㄱㄴㅊㅌㅈㅇ', related_words = ARRAY['국민총처분가능소득']::text[] WHERE id = 70;  -- 국내총투자율
UPDATE public.words SET word = '국민계정체계(SNA)', meaning = '나라 경제의 흐름을 기업 회계처럼 통일된 국제 기준으로 기록하는 체계', hint = 'ㄱㅁㄱㅈㅊㄱ', related_words = ARRAY['국내총생산(GDP)','산업연관표(I/O Tables)','국민대차대조표','국제수지표']::text[] WHERE id = 71;  -- 국민계정체계(SNA)
UPDATE public.words SET word = '국민대차대조표', meaning = '특정 시점에 나라 전체가 가진 자산과 부채, 순자산을 정리한 표', hint = 'ㄱㅁㄷㅊㄷㅈㅍ', related_words = ARRAY['국민계정체계(SNA)']::text[] WHERE id = 72;  -- 국민대차대조표
UPDATE public.words SET word = '국민부담률', meaning = '세금과 사회보험료를 합쳐 국내총생산 대비 얼마나 내는지 나타낸 비율', hint = 'ㄱㅁㅂㄷㄹ', related_words = ARRAY['조세부담률']::text[] WHERE id = 73;  -- 국민부담률
UPDATE public.words SET word = '국민소득', meaning = '한 나라 국민이 노동·자본을 제공하고 벌어들인 순수한 소득의 합계', hint = 'ㄱㅁㅅㄷ', related_words = ARRAY['국민총소득(GNI)']::text[] WHERE id = 74;  -- 국민소득
UPDATE public.words SET word = '국민연금', meaning = '일할 때 보험료를 내고 노후에 매달 연금을 받는 공적 연금 제도', hint = 'ㄱㅁㅇㄱ', related_words = ARRAY['합계출산율','인구고령화']::text[] WHERE id = 75;  -- 국민연금
