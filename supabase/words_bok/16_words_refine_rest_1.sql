-- ===== 콘텐츠 정제 1/15 (refine.py 생성 — 손으로 고치지 말고 meanings.py를 고친 뒤 다시 실행) =====
-- 라이브 덤프와 비교해 아직 적용되지 않은 행만. 단문 UPDATE 294행, 본문 UPDATE 64행.
-- 적용 순서: 16_words_refine_1..N -> 17_courses.sql

UPDATE public.words SET word = '고정금리부채권(SB)', meaning = '정해진 날 정해진 이자를 주고 만기에 원금을 갚는 가장 기본형 채권', hint = 'ㄱㅈㄱㄹㅂㅊㄱ', related_words = ARRAY['변동금리부채권(FRN)']::text[] WHERE id = 42;  -- 고정금리부채권(SB)
UPDATE public.words SET word = '고정이하여신비율', meaning = '은행 전체 대출 중 회수가 어려운 부실 대출의 비율', hint = 'ㄱㅈㅇㅎㅇㅅㅂㅇ', related_words = ARRAY['자산건전성 분류']::text[] WHERE id = 43;  -- 고정이하여신비율
UPDATE public.words SET word = '고정자본소모', meaning = '공장·기계가 생산에 쓰이며 닳아 없어진 가치(감가상각)', hint = 'ㄱㅈㅈㅂㅅㅁ', related_words = ARRAY['총고정자본형성']::text[] WHERE id = 44;  -- 고정자본소모
UPDATE public.words SET word = '고정환율제도', meaning = '정부나 중앙은행이 환율을 일정 수준에 묶어 두는 제도', hint = 'ㄱㅈㅎㅇㅈㄷ', related_words = ARRAY['삼불원칙','외환시장','자유변동환율제도']::text[] WHERE id = 45;  -- 고정환율제도/자유변동환율제도
UPDATE public.words SET word = '고통지수', meaning = '물가상승률과 실업률을 더해 국민이 느끼는 삶의 고통을 재는 지수', hint = 'ㄱㅌㅈㅅ', related_words = ARRAY['소비자물가지수(CPI)','실업률']::text[] WHERE id = 46;  -- 고통지수
UPDATE public.words SET word = '골디락스경제', meaning = '인플레이션도 실업도 걱정 없는, 뜨겁지도 차갑지도 않은 이상적 경제', hint = 'ㄱㄷㄹㅅㄱㅈ', related_words = ARRAY['대안정기','장기침체']::text[] WHERE id = 47;  -- 골디락스경제
UPDATE public.words SET word = '공개시장운영', meaning = '중앙은행이 시장에서 채권을 사고팔아 시중 돈의 양과 금리를 조절하는 수단', hint = 'ㄱㄱㅅㅈㅇㅇ', related_words = ARRAY['통화정책수단']::text[] WHERE id = 48;  -- 공개시장운영
UPDATE public.words SET word = '공공재', meaning = '국방·도로처럼 모두가 함께 쓰고 값을 매기기 어려운 재화나 서비스', hint = 'ㄱㄱㅈ', related_words = ARRAY['자유재']::text[] WHERE id = 49;  -- 공공재
UPDATE public.words SET word = '공급병목', meaning = '공급 과정의 한 단계가 막혀 전체 공급망이 지연되는 현상', hint = 'ㄱㄱㅂㅁ', related_words = ARRAY['글로벌 공급망 압력지수','경기']::text[] WHERE id = 50;  -- 공급병목
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
