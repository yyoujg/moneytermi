-- ===== 콘텐츠 정제 24/36 (refine.py 생성 — 손으로 고치지 말고 meanings.py를 고친 뒤 다시 실행) =====
-- 뜻 전면 재작성·슬래시 항목 분리(신규 31행)·힌트 기본형 초성·related_words 정리·본문 줄이음 자국 제거.
-- 적용 순서: 16_words_refine_1..N -> 17_courses.sql

UPDATE public.words SET word = '지니계수', meaning = '0(완전 평등)에서 1(완전 불평등) 사이 값으로 소득 불평등을 나타내는 지수', hint = 'ㅈㄴㄱㅅ', related_words = ARRAY['상대적 빈곤율','소득5분위배율']::text[] WHERE id = 551;  -- 지니계수
UPDATE public.words SET word = '지로(GIRO)', meaning = '공과금·회비처럼 다수의 소액 수납·지급을 중계센터를 통해 처리하는 지급수단', hint = 'ㅈㄹ', related_words = ARRAY['입금이체','출금이체']::text[] WHERE id = 552;  -- 지로(GIRO)
UPDATE public.words SET word = '지방은행공동망', meaning = '지방은행들이 공동으로 전국 입출금·조회 서비스를 제공하는 지급망', hint = 'ㅈㅂㅇㅎㄱㄷㅁ', related_words = ARRAY['소액지급시스템']::text[] WHERE id = 553;  -- 지방은행공동망
UPDATE public.words SET word = '지분형 모기지', meaning = '공공기관이 집의 지분 일부를 투자해 구매자 부담을 덜어 주는 주택금융 제도', hint = 'ㅈㅂㅎㅁㄱㅈ', related_words = ARRAY['주택금융제도','한국주택금융공사']::text[] WHERE id = 554;  -- 지분형 모기지
UPDATE public.words SET word = '지식서비스 무역통계', meaning = '지식재산권 사용료·정보통신 등 지식 기반 서비스의 국가 간 거래 통계', hint = 'ㅈㅅㅅㅂㅅㅁㅇㅌㄱ', related_words = ARRAY['국제수지']::text[] WHERE id = 555;  -- 지식서비스 무역통계
UPDATE public.words SET word = '지식재산권', meaning = '특허·상표·저작권처럼 창작물에 대해 주어지는 독점적 권리', hint = 'ㅈㅅㅈㅅㄱ', related_words = '{}'::text[] WHERE id = 556;  -- 지식재산권
UPDATE public.words SET word = '지식재산생산물투자', meaning = '연구개발·소프트웨어·예술작품 같은 무형자산에 대한 투자', hint = 'ㅈㅅㅈㅅㅅㅅㅁㅌㅈ', related_words = '{}'::text[] WHERE id = 557;  -- 지식재산생산물투자
UPDATE public.words SET word = '지정시점처리제도', meaning = '어음교환·타행환 같은 차액결제를 영업시간 중 정해진 시각에 일괄 처리하는 제도', hint = 'ㅈㅈㅅㅈㅊㄹㅈㄷ', related_words = ARRAY['차액결제시스템']::text[] WHERE id = 558;  -- 지정시점처리제도
UPDATE public.words SET word = '지주회사', meaning = '다른 회사 주식을 소유해 그 회사를 지배하는 것이 주된 사업인 회사', hint = 'ㅈㅈㅎㅅ', related_words = ARRAY['M&A']::text[] WHERE id = 559;  -- 지주회사
UPDATE public.words SET word = '직불카드', meaning = '결제 즉시 내 예금계좌에서 돈이 빠져나가는 카드', hint = 'ㅈㅂㅋㄷ', related_words = ARRAY['지급수단','직불카드공동망']::text[] WHERE id = 560;  -- 직불카드
UPDATE public.words SET word = '직불카드공동망', meaning = '직불카드 결제 대금을 고객 은행에서 판매자 은행으로 옮기는 지급시스템', hint = 'ㅈㅂㅋㄷㄱㄷㅁ', related_words = ARRAY['소액지급시스템','직불카드']::text[] WHERE id = 561;  -- 직불카드공동망
UPDATE public.words SET word = '직접투자', meaning = '해외 현지법인의 경영에 직접 참여할 목적으로 자본·기술을 국외로 옮기는 투자', hint = 'ㅈㅈㅌㅈ', related_words = '{}'::text[] WHERE id = 562;  -- 직접투자
UPDATE public.words SET word = '진성어음', meaning = '실제 상거래 대금 결제용으로 발행되는 어음(상업어음)', hint = 'ㅈㅅㅇㅇ', related_words = ARRAY['기업어음(CP)','융통어음']::text[] WHERE id = 563;  -- 진성어음/융통어음
UPDATE public.words SET word = '집단대출', meaning = '신규 분양·재건축 입주자 전체를 개별 심사 없이 일괄 승인하는 주택담보대출', hint = 'ㅈㄷㄷㅊ', related_words = '{}'::text[] WHERE id = 564;  -- 집단대출
UPDATE public.words SET word = '집중도 지수(HHI)', meaning = '기업별 시장점유율을 제곱해 더한 값으로 시장 집중도를 재는 지수', hint = 'ㅈㅈㄷㅈㅅ', related_words = '{}'::text[] WHERE id = 565;  -- 집중도 지수(HHI)
UPDATE public.words SET word = '차액결제선물환(NDF) 거래', meaning = '만기에 원금 교환 없이 약정환율과 실제환율의 차액만 결제하는 선물환 거래', hint = 'ㅊㅇㄱㅈㅅㅁㅎ', related_words = ARRAY['선물환거래','환리스크 헤지']::text[] WHERE id = 566;  -- 차액결제선물환(NDF) 거래
UPDATE public.words SET word = '차액결제시스템', meaning = '하루 동안 주고받을 금액을 상계한 뒤 차액만 이체해 결제하는 시스템', hint = 'ㅊㅇㄱㅈㅅㅅㅌ', related_words = ARRAY['소액지급시스템','지정시점처리제도']::text[] WHERE id = 567;  -- 차액결제시스템
UPDATE public.words SET word = '차입매수(LBO)', meaning = '인수할 회사의 자산을 담보로 돈을 빌려 그 회사를 사는 방식', hint = 'ㅊㅇㅁㅅ', related_words = '{}'::text[] WHERE id = 568;  -- 차입매수(LBO)
UPDATE public.words SET word = '채권시가평가', meaning = '보유 채권을 장부가가 아니라 시장 가격으로 평가하는 것', hint = 'ㅊㄱㅅㄱㅍㄱ', related_words = '{}'::text[] WHERE id = 569;  -- 채권시가평가
UPDATE public.words SET word = '채권시장', meaning = '채권이 발행되고 거래되는 시장', hint = 'ㅊㄱㅅㅈ', related_words = ARRAY['유통시장','발행시장']::text[] WHERE id = 570;  -- 채권시장
UPDATE public.words SET word = '채권시장안정펀드', meaning = '2008년 금융위기 때 채권시장 경색을 풀려고 금융기관들이 출자해 만든 펀드', hint = 'ㅊㄱㅅㅈㅇㅈㅍㄷ', related_words = '{}'::text[] WHERE id = 571;  -- 채권시장안정펀드
UPDATE public.words SET word = '채무불이행', meaning = '빚을 약속대로 갚지 못하거나 갚을 수 없는 상태(디폴트)', hint = 'ㅊㅁㅂㅇㅎ', related_words = '{}'::text[] WHERE id = 572;  -- 채무불이행
UPDATE public.words SET word = '청년실업률', meaning = '15~29세 청년 경제활동인구 중 실업자의 비율', hint = 'ㅊㄴㅅㅇㄹ', related_words = ARRAY['고용보조지표','실망실업자']::text[] WHERE id = 573;  -- 청년실업률
UPDATE public.words SET word = '청산', meaning = '거래 뒤 은행끼리 주고받을 금액을 계산해 확정하는 과정', hint = 'ㅊㅅ', related_words = ARRAY['지급','결제']::text[] WHERE id = 574;  -- 청산
UPDATE public.words SET word = '청산소', meaning = '금융기관 간 거래의 채권·채무를 모아 정산하는 기관', hint = 'ㅊㅅㅅ', related_words = ARRAY['결제','청산']::text[] WHERE id = 575;  -- 청산소
