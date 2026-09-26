-- ===== 콘텐츠 정제 14/36 (refine.py 생성 — 손으로 고치지 말고 meanings.py를 고친 뒤 다시 실행) =====
-- 뜻 전면 재작성·슬래시 항목 분리(신규 31행)·힌트 기본형 초성·related_words 정리·본문 줄이음 자국 제거.
-- 적용 순서: 16_words_refine_1..N -> 17_courses.sql

UPDATE public.words SET word = '세계국채지수(WGBI)', meaning = '주요 선진국 국채로 구성된 대표적인 글로벌 채권지수', hint = 'ㅅㄱㄱㅊㅈㅅ', related_words = ARRAY['국채 신뢰도']::text[] WHERE id = 301;  -- 세계국채지수(WGBI)
UPDATE public.words SET word = '세계무역기구(WTO)', meaning = '국제무역 규칙을 정하고 회원국 간 통상분쟁을 해결하는 국제기구', hint = 'ㅅㄱㅁㅇㄱㄱ', related_words = '{}'::text[] WHERE id = 302;  -- 세계무역기구(WTO)
UPDATE public.words SET word = '세계은행(World Bank)', meaning = '개발도상국에 장기 개발자금을 빌려주는 국제금융기구(IBRD와 IDA)', hint = 'ㅅㄱㅇㅎ', related_words = ARRAY['국제통화기금(IMF)']::text[] WHERE id = 303;  -- 세계은행(World Bank)
UPDATE public.words SET word = '소득5분위배율', meaning = '소득 상위 20% 평균소득을 하위 20% 평균소득으로 나눈 불평등 지표', hint = 'ㅅㄷ5ㅂㅇㅂㅇ', related_words = ARRAY['상대적 빈곤율','지니계수']::text[] WHERE id = 304;  -- 소득5분위배율
UPDATE public.words SET word = '소득교역조건지수', meaning = '수출로 번 돈으로 수입할 수 있는 상품의 양이 얼마나 늘었는지 보는 지수', hint = 'ㅅㄷㄱㅇㅈㄱㅈㅅ', related_words = ARRAY['순상품교역조건지수']::text[] WHERE id = 305;  -- 소득교역조건지수
UPDATE public.words SET word = '소득대체율', meaning = '은퇴 후 받는 연금이 은퇴 전 소득의 몇 %인지 나타낸 비율', hint = 'ㅅㄷㄷㅊㅇ', related_words = ARRAY['사회보장제도','국민연금']::text[] WHERE id = 306;  -- 소득대체율
UPDATE public.words SET word = '소매판매', meaning = '최종 소비자인 개인·가계에 물건을 파는 것(내수 경기 지표)', hint = 'ㅅㅁㅍㅁ', related_words = ARRAY['최종수요','중간수요']::text[] WHERE id = 307;  -- 소매판매
UPDATE public.words SET word = '소비의 비가역성', meaning = '소득이 줄어도 이미 높아진 소비 수준을 쉽게 낮추지 못하는 성질', hint = 'ㅅㅂㅇㅂㄱㅇㅅ', related_words = ARRAY['한계소비성향']::text[] WHERE id = 308;  -- 소비의 비가역성
UPDATE public.words SET word = '소비자동향지수(CSI)', meaning = '소비자에게 경기와 살림살이 전망을 설문해 지수로 만든 것', hint = 'ㅅㅂㅈㄷㅎㅈㅅ', related_words = ARRAY['경제심리지수','기업경기실사지수(BSI)']::text[] WHERE id = 309;  -- 소비자동향지수(CSI)
UPDATE public.words SET word = '소비자물가지수(CPI)', meaning = '가계가 사는 상품·서비스 가격이 얼마나 올랐는지 재는 대표 물가지수', hint = 'ㅅㅂㅈㅁㄱㅈㅅ', related_words = ARRAY['생산자물가지수(PPI)','인플레이션']::text[] WHERE id = 310;  -- 소비자물가지수(CPI)
UPDATE public.words SET word = '소비자심리지수', meaning = '소비자 설문으로 만든 여러 지수를 합쳐 소비자의 경기 심리를 하나로 보여주는 지수', hint = 'ㅅㅂㅈㅅㄹㅈㅅ', related_words = ARRAY['경제심리지수','기업경기실사지수(BSI)']::text[] WHERE id = 311;  -- 소비자심리지수
UPDATE public.words SET word = '소액지급시스템', meaning = '개인·기업의 소액 거래(이체·카드·지로)를 처리하는 지급시스템', hint = 'ㅅㅇㅈㄱㅅㅅㅌ', related_words = ARRAY['거액지급시스템','지급결제시스템','전자화폐']::text[] WHERE id = 312;  -- 소액지급시스템
UPDATE public.words SET word = '소프트랜딩', meaning = '과열된 경기가 큰 충격 없이 서서히 식는 연착륙', hint = 'ㅅㅍㅌㄹㄷ', related_words = ARRAY['경기','최종수요','중간수요','하드랜딩']::text[] WHERE id = 313;  -- 소프트랜딩/하드랜딩
UPDATE public.words SET word = '소형모듈원자로(SMR)', meaning = '공장에서 모듈로 만들어 현장에서 조립하는 출력이 작은 원자력 발전소', hint = 'ㅅㅎㅁㄷㅇㅈㄹ', related_words = '{}'::text[] WHERE id = 314;  -- 소형모듈원자로(SMR)
UPDATE public.words SET word = '속물효과(스놉효과)', meaning = '남들이 많이 사는 물건은 오히려 안 사는 개성 추구 소비 현상', hint = 'ㅅㅁㅎㄱ', related_words = ARRAY['기펜재','밴드웨건효과','베블런효과']::text[] WHERE id = 315;  -- 속물효과(스놉효과)
UPDATE public.words SET word = '수요견인 인플레이션', meaning = '경기 과열로 수요가 넘쳐 물가가 오르는 인플레이션', hint = 'ㅅㅇㄱㅇㅇㅍㄹㅇㅅ', related_words = ARRAY['비용인상 인플레이션']::text[] WHERE id = 316;  -- 수요견인 인플레이션
UPDATE public.words SET word = '수요탄력성', meaning = '가격이 변할 때 수요량이 얼마나 민감하게 반응하는지 나타낸 값', hint = 'ㅅㅇㅌㄹㅅ', related_words = ARRAY['공급탄력성']::text[] WHERE id = 317;  -- 수요탄력성
UPDATE public.words SET word = '수익률곡선', meaning = '채권 만기별 수익률을 짧은 것부터 긴 것까지 이어 그린 곡선', hint = 'ㅅㅇㄹㄱㅅ', related_words = ARRAY['장단기금리차']::text[] WHERE id = 318;  -- 수익률곡선
UPDATE public.words SET word = '수입유발계수', meaning = '최종수요가 한 단위 늘 때 직·간접으로 수입이 얼마나 늘어나는지 나타낸 계수', hint = 'ㅅㅇㅇㅂㄱㅅ', related_words = ARRAY['생산유발효과']::text[] WHERE id = 319;  -- 수입유발계수
UPDATE public.words SET word = '수출경합도지수', meaning = '두 나라의 수출 품목 구조가 얼마나 비슷해 서로 경쟁하는지 재는 지표', hint = 'ㅅㅊㄱㅎㄷㅈㅅ', related_words = ARRAY['현시비교우위지수(RCA)']::text[] WHERE id = 320;  -- 수출경합도지수
UPDATE public.words SET word = '수출보험', meaning = '수입업자 부도나 수입국 사정으로 수출대금을 못 받을 위험을 보상하는 보험', hint = 'ㅅㅊㅂㅎ', related_words = '{}'::text[] WHERE id = 321;  -- 수출보험
UPDATE public.words SET word = '수출입물가지수', meaning = '수출품과 수입품의 가격 변동을 재는 물가지수', hint = 'ㅅㅊㅇㅁㄱㅈㅅ', related_words = ARRAY['수출입물량지수']::text[] WHERE id = 322;  -- 수출입물가지수
UPDATE public.words SET word = '수출입물량지수', meaning = '가격 변동을 걷어내고 수출입 물량이 얼마나 늘고 줄었는지 보는 지수', hint = 'ㅅㅊㅇㅁㄹㅈㅅ', related_words = ARRAY['수출입물가지수']::text[] WHERE id = 323;  -- 수출입물량지수
UPDATE public.words SET word = '수확체감의 법칙', meaning = '다른 요소는 그대로 두고 노동만 늘리면 추가 생산량이 점점 줄어든다는 법칙', hint = 'ㅅㅎㅊㄱㅇㅂㅊ', related_words = ARRAY['한계비용']::text[] WHERE id = 324;  -- 수확체감의 법칙
UPDATE public.words SET word = '순상품교역조건지수', meaning = '수출 1단위로 수입할 수 있는 상품의 양이 기준시점보다 얼마나 변했는지 보는 지수', hint = 'ㅅㅅㅍㄱㅇㅈㄱㅈㅅ', related_words = ARRAY['무역지수','수출입물가지수']::text[] WHERE id = 325;  -- 순상품교역조건지수
