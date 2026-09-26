-- ===== 콘텐츠 정제 10/36 (refine.py 생성 — 손으로 고치지 말고 meanings.py를 고친 뒤 다시 실행) =====
-- 뜻 전면 재작성·슬래시 항목 분리(신규 31행)·힌트 기본형 초성·related_words 정리·본문 줄이음 자국 제거.
-- 적용 순서: 16_words_refine_1..N -> 17_courses.sql

UPDATE public.words SET word = '마스트리히트조약', meaning = '1992년 유럽 12개국이 유럽연합과 단일통화(유로) 출범에 합의한 조약', hint = 'ㅁㅅㅌㄹㅎㅌㅈㅇ', related_words = ARRAY['유럽연합(EU)','유럽중앙은행(ECB)']::text[] WHERE id = 201;  -- 마스트리히트조약
UPDATE public.words SET word = '마찰적 실업', meaning = '더 나은 일자리를 찾거나 옮기는 과정에서 잠시 생기는 자발적 실업', hint = 'ㅁㅊㅈㅅㅇ', related_words = ARRAY['실망실업자','자발적 실업']::text[] WHERE id = 202;  -- 마찰적 실업
UPDATE public.words SET word = '만기수익률', meaning = '채권을 만기까지 들고 있을 때 얻는 연평균 예상 수익률', hint = 'ㅁㄱㅅㅇㄹ', related_words = ARRAY['이표채']::text[] WHERE id = 203;  -- 만기수익률
UPDATE public.words SET word = '매매보호 서비스(Escrow)', meaning = '거래가 끝날 때까지 중립적인 제3자가 결제대금을 맡아 두는 안전거래 서비스', hint = 'ㅁㅁㅂㅎㅅㅂㅅ', related_words = '{}'::text[] WHERE id = 204;  -- 매매보호 서비스(Escrow)
UPDATE public.words SET word = '매몰비용', meaning = '이미 써 버려서 어떤 선택을 해도 되돌릴 수 없는 비용', hint = 'ㅁㅁㅂㅇ', related_words = ARRAY['기회비용']::text[] WHERE id = 205;  -- 매몰비용
UPDATE public.words SET word = '매입외환', meaning = '은행이 고객에게서 사들인 수출환어음·외화수표 같은 외화 자산', hint = 'ㅁㅇㅇㅎ', related_words = ARRAY['내국신용장','환가료']::text[] WHERE id = 206;  -- 매입외환/환가료
UPDATE public.words SET word = '매출액영업이익률', meaning = '영업이익을 매출액으로 나눠 본업으로 얼마나 효율적으로 버는지 보는 비율', hint = 'ㅁㅊㅇㅇㅇㅇㅇㄹ', related_words = '{}'::text[] WHERE id = 207;  -- 매출액영업이익률
UPDATE public.words SET word = '머니마켓펀드(MMF)', meaning = '여윳돈을 국공채·어음 등 안전한 단기상품에 굴려 수시로 넣고 빼는 펀드', hint = 'ㅁㄴㅁㅋㅍㄷ', related_words = ARRAY['단기금융시장','채권시가평가','펀드']::text[] WHERE id = 208;  -- 머니마켓펀드(MMF)
UPDATE public.words SET word = '명목GDP목표제', meaning = '물가 대신 명목 국내총생산 증가율을 목표로 삼는 통화정책 방식', hint = 'ㅁㅁGㅁㅍㅈ', related_words = ARRAY['물가안정목표제','제로금리정책','양적완화정책']::text[] WHERE id = 209;  -- 명목GDP목표제
UPDATE public.words SET word = '명목국내총생산', meaning = '그해 가격으로 계산한 국내총생산(물가 상승분 포함)', hint = 'ㅁㅁㄱㄴㅊㅅㅅ', related_words = ARRAY['연쇄가중법','계절변동조정시계열','경제성장률','실질국내총생산']::text[] WHERE id = 210;  -- 명목국내총생산/실질국내총생산
UPDATE public.words SET word = '명목금리', meaning = '물가 변동을 고려하지 않은 겉으로 표시된 금리', hint = 'ㅁㅁㄱㄹ', related_words = ARRAY['피셔효과','실질금리']::text[] WHERE id = 211;  -- 명목금리/실질금리
UPDATE public.words SET word = '명목소득', meaning = '물가를 고려하지 않고 받은 금액 그대로의 소득', hint = 'ㅁㅁㅅㄷ', related_words = ARRAY['실질임금','실질소득']::text[] WHERE id = 212;  -- 명목소득/실질소득
UPDATE public.words SET word = '모기지대출', meaning = '집이나 부동산을 담보로 은행에서 장기간 돈을 빌리는 대출', hint = 'ㅁㄱㅈㄷㅊ', related_words = ARRAY['주택저당증권(MBS)','자산유동화']::text[] WHERE id = 213;  -- 모기지대출
UPDATE public.words SET word = '모바일뱅킹', meaning = '휴대전화로 계좌조회·이체 같은 은행 업무를 보는 서비스', hint = 'ㅁㅂㅇㅂㅋ', related_words = ARRAY['인터넷뱅킹','텔레뱅킹(폰뱅킹)']::text[] WHERE id = 214;  -- 모바일뱅킹
UPDATE public.words SET word = '무디스', meaning = '1909년 설립된 미국의 세계 3대 국제신용평가기관 중 하나', hint = 'ㅁㄷㅅ', related_words = ARRAY['스탠더드&푸어스']::text[] WHERE id = 215;  -- 무디스
UPDATE public.words SET word = '무역지수', meaning = '수출입 변동을 가격 요인과 물량 요인으로 나눠 보기 위해 만든 지수', hint = 'ㅁㅇㅈㅅ', related_words = ARRAY['순상품교역조건지수','수출입물량지수']::text[] WHERE id = 216;  -- 무역지수
UPDATE public.words SET word = '무위험지표금리(KOFR)', meaning = '국채를 담보로 한 하루짜리 환매조건부매매 금리로 만든 우리나라의 무위험 기준금리', hint = 'ㅁㅇㅎㅈㅍㄱㄹ', related_words = ARRAY['지표금리','환매조건부채권(RP)']::text[] WHERE id = 217;  -- 무위험지표금리(KOFR)
UPDATE public.words SET word = '물가안정목표제', meaning = '중앙은행이 물가상승률 목표를 미리 공표하고 거기에 맞춰 통화정책을 펴는 방식', hint = 'ㅁㄱㅇㅈㅁㅍㅈ', related_words = ARRAY['통화정책 운영체제(monetary policy regime)']::text[] WHERE id = 218;  -- 물가안정목표제
UPDATE public.words SET word = '물가지수', meaning = '기준연도 물가를 100으로 놓고 지금 물가가 얼마나 올랐는지 나타낸 수치', hint = 'ㅁㄱㅈㅅ', related_words = ARRAY['국내공급물가지수','근원인플레이션']::text[] WHERE id = 219;  -- 물가지수
UPDATE public.words SET word = '뮤추얼펀드', meaning = '투자자 돈을 모아 회사를 만들고 그 회사가 투자해 수익을 배당하는 회사형 펀드', hint = 'ㅁㅊㅇㅍㄷ', related_words = ARRAY['펀드']::text[] WHERE id = 220;  -- 뮤추얼펀드
UPDATE public.words SET word = '미달러화지수', meaning = '유로·엔 등 주요 6개 통화 대비 미국 달러의 가치를 나타낸 지수', hint = 'ㅁㄷㄹㅎㅈㅅ', related_words = ARRAY['브레튼우즈체제']::text[] WHERE id = 221;  -- 미달러화지수
UPDATE public.words SET word = '미달러화페그제도', meaning = '자국 통화 환율을 미국 달러에 고정해 두는 환율제도', hint = 'ㅁㄷㄹㅎㅍㄱㅈㄷ', related_words = ARRAY['고정환율제도','자유변동환율제도','복수통화바스켓제도']::text[] WHERE id = 222;  -- 미달러화페그제도
UPDATE public.words SET word = '미발행화폐', meaning = '한국은행이 발행하지 않고 금고에 보관 중인 새 지폐와 동전', hint = 'ㅁㅂㅎㅎㅍ', related_words = '{}'::text[] WHERE id = 223;  -- 미발행화폐
UPDATE public.words SET word = '미분양주택', meaning = '분양을 시작했지만 정해진 기간 안에 팔리지 않은 새 집', hint = 'ㅁㅂㅇㅈㅌ', related_words = ARRAY['주택경기','주택청약','준공 후 미분양주택']::text[] WHERE id = 224;  -- 미분양주택
UPDATE public.words SET word = '바젤은행감독위원회(BCBS)', meaning = '각국 은행 감독당국이 모여 국제 은행 건전성 기준(바젤 규제)을 만드는 기구', hint = 'ㅂㅈㅇㅎㄱㄷㅇㅇㅎ', related_words = '{}'::text[] WHERE id = 225;  -- 바젤은행감독위원회/ 바젤위원회(BCBS)
