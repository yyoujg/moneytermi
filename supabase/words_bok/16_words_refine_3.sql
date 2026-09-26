-- ===== 콘텐츠 정제 3/36 (refine.py 생성 — 손으로 고치지 말고 meanings.py를 고친 뒤 다시 실행) =====
-- 뜻 전면 재작성·슬래시 항목 분리(신규 31행)·힌트 기본형 초성·related_words 정리·본문 줄이음 자국 제거.
-- 적용 순서: 16_words_refine_1..N -> 17_courses.sql

UPDATE public.words SET word = '경상수지', meaning = '외국과 상품·서비스를 사고팔아 번 돈과 쓴 돈의 차이', hint = 'ㄱㅅㅅㅈ', related_words = ARRAY['상품수지','서비스수지','본원소득수지','이전소득수지']::text[] WHERE id = 26;  -- 경상수지
UPDATE public.words SET word = '경영실태평가', meaning = '감독당국이 금융회사의 건전성·경영능력을 점검해 등급을 매기는 제도', hint = 'ㄱㅇㅅㅌㅍㄱ', related_words = ARRAY['CAMEL-IR 방식/ROCA 방식/CACREL 방식']::text[] WHERE id = 27;  -- 경영실태평가/은행경영실태 평가등급제도
UPDATE public.words SET word = '경제 서프라이즈 지수', meaning = '발표된 경제지표가 시장 예상보다 좋았는지 나빴는지 수치로 나타낸 지수', hint = 'ㄱㅈㅅㅍㄹㅇㅈㅈㅅ', related_words = '{}'::text[] WHERE id = 28;  -- 경제 서프라이즈 지수
UPDATE public.words SET word = '경제성장률', meaning = '한 나라의 실질 국내총생산이 1년 또는 분기 동안 늘어난 비율', hint = 'ㄱㅈㅅㅈㄹ', related_words = ARRAY['잠재GDP성장률']::text[] WHERE id = 29;  -- 경제성장률
UPDATE public.words SET word = '경제심리지수', meaning = '기업과 소비자가 느끼는 경기 인식을 합쳐 지수로 만든 것', hint = 'ㄱㅈㅅㄹㅈㅅ', related_words = ARRAY['기업경기실사지수(BSI)','소비자동향지수(CSI)']::text[] WHERE id = 30;  -- 경제심리지수
UPDATE public.words SET word = '경제전망보고서', meaning = '앞으로 성장·물가·고용·환율이 어떻게 될지 분석해 내놓는 보고서', hint = 'ㄱㅈㅈㅁㅂㄱㅅ', related_words = ARRAY['경제성장률','인플레이션','경상수지','경기']::text[] WHERE id = 31;  -- 경제전망보고서
UPDATE public.words SET word = '경제협력개발기구(OECD)', meaning = '선진국들이 경제성장과 세계무역 확대를 위해 협력하는 국제기구', hint = 'ㄱㅈㅎㄹㄱㅂㄱㄱ', related_words = '{}'::text[] WHERE id = 32;  -- 경제협력개발기구(OECD)
UPDATE public.words SET word = '경제활동인구', meaning = '15세 이상 중 일할 능력과 의사가 있는 사람(취업자+실업자)', hint = 'ㄱㅈㅎㄷㅇㄱ', related_words = ARRAY['고용보조지표','잠재경제활동인구','비경제활동인구','경제활동참가율']::text[] WHERE id = 33;  -- 경제활동인구/비경제활동인구/ 경제활동참가율
UPDATE public.words SET word = '경제후생지표', meaning = '국민총소득에 여가·가사노동·공해를 반영해 삶의 질을 재려는 지표', hint = 'ㄱㅈㅎㅅㅈㅍ', related_words = ARRAY['국민총소득(GNI)']::text[] WHERE id = 34;  -- 경제후생지표
UPDATE public.words SET word = '경직적 물가지수', meaning = '공공요금처럼 가격이 잘 안 바뀌는 품목만 모아 만든 물가지수', hint = 'ㄱㅈㅈㅁㄱㅈㅅ', related_words = ARRAY['근원인플레이션율']::text[] WHERE id = 35;  -- 경직적 물가지수
UPDATE public.words SET word = '계절변동조정시계열', meaning = '명절·기후처럼 매년 반복되는 계절 요인을 걷어낸 통계 자료', hint = 'ㄱㅈㅂㄷㅈㅈㅅㄱㅇ', related_words = ARRAY['경제성장률']::text[] WHERE id = 36;  -- 계절변동조정시계열
UPDATE public.words SET word = '계좌대체', meaning = '실물 증권 대신 예탁기관 장부의 계좌 간 이전으로 처리하는 방식', hint = 'ㄱㅈㄷㅊ', related_words = ARRAY['중앙예탁기관']::text[] WHERE id = 37;  -- 계좌대체
UPDATE public.words SET word = '고객확인절차(KYC)', meaning = '자금세탁을 막기 위해 금융회사가 고객 신원을 확인하는 절차', hint = 'ㄱㄱㅎㅇㅈㅊ', related_words = ARRAY['가상통화','비트코인']::text[] WHERE id = 38;  -- 고객확인절차(KYC)
UPDATE public.words SET word = '고용률', meaning = '15세 이상 인구 중 취업자가 차지하는 비율', hint = 'ㄱㅇㄹ', related_words = ARRAY['고용보조지표','실업률']::text[] WHERE id = 39;  -- 고용률
UPDATE public.words SET word = '고용보조지표', meaning = '공식 실업률이 못 잡는 숨은 실업까지 넓게 보여주는 보조 지표', hint = 'ㄱㅇㅂㅈㅈㅍ', related_words = ARRAY['실업률','잠재경제활동인구']::text[] WHERE id = 40;  -- 고용보조지표
UPDATE public.words SET word = '고정금리', meaning = '만기까지 처음 약정한 이자율이 그대로 유지되는 금리', hint = 'ㄱㅈㄱㄹ', related_words = ARRAY['변동금리','양도성예금증서(CD)']::text[] WHERE id = 41;  -- 고정금리
UPDATE public.words SET word = '고정금리부채권(SB)', meaning = '정해진 날 정해진 이자를 주고 만기에 원금을 갚는 가장 기본형 채권', hint = 'ㄱㅈㄱㄹㅂㅊㄱ', related_words = ARRAY['변동금리부채권(FRN)']::text[] WHERE id = 42;  -- 고정금리부채권(SB)
UPDATE public.words SET word = '고정이하여신비율', meaning = '은행 전체 대출 중 회수가 어려운 부실 대출의 비율', hint = 'ㄱㅈㅇㅎㅇㅅㅂㅇ', related_words = ARRAY['자산건전성 분류']::text[] WHERE id = 43;  -- 고정이하여신비율
UPDATE public.words SET word = '고정자본소모', meaning = '공장·기계가 생산에 쓰이며 닳아 없어진 가치(감가상각)', hint = 'ㄱㅈㅈㅂㅅㅁ', related_words = ARRAY['총고정자본형성']::text[] WHERE id = 44;  -- 고정자본소모
UPDATE public.words SET word = '고정환율제도', meaning = '정부나 중앙은행이 환율을 일정 수준에 묶어 두는 제도', hint = 'ㄱㅈㅎㅇㅈㄷ', related_words = ARRAY['삼불원칙','외환시장','자유변동환율제도']::text[] WHERE id = 45;  -- 고정환율제도/자유변동환율제도
UPDATE public.words SET word = '고통지수', meaning = '물가상승률과 실업률을 더해 국민이 느끼는 삶의 고통을 재는 지수', hint = 'ㄱㅌㅈㅅ', related_words = ARRAY['소비자물가지수(CPI)','실업률']::text[] WHERE id = 46;  -- 고통지수
UPDATE public.words SET word = '골디락스경제', meaning = '인플레이션도 실업도 걱정 없는, 뜨겁지도 차갑지도 않은 이상적 경제', hint = 'ㄱㄷㄹㅅㄱㅈ', related_words = ARRAY['대안정기','장기침체']::text[] WHERE id = 47;  -- 골디락스경제
UPDATE public.words SET word = '공개시장운영', meaning = '중앙은행이 시장에서 채권을 사고팔아 시중 돈의 양과 금리를 조절하는 수단', hint = 'ㄱㄱㅅㅈㅇㅇ', related_words = ARRAY['통화정책수단']::text[] WHERE id = 48;  -- 공개시장운영
UPDATE public.words SET word = '공공재', meaning = '국방·도로처럼 모두가 함께 쓰고 값을 매기기 어려운 재화나 서비스', hint = 'ㄱㄱㅈ', related_words = ARRAY['자유재']::text[] WHERE id = 49;  -- 공공재
UPDATE public.words SET word = '공급병목', meaning = '공급 과정의 한 단계가 막혀 전체 공급망이 지연되는 현상', hint = 'ㄱㄱㅂㅁ', related_words = ARRAY['글로벌 공급망 압력지수','경기']::text[] WHERE id = 50;  -- 공급병목
