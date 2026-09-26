-- ===== 콘텐츠 정제 17/36 (refine.py 생성 — 손으로 고치지 말고 meanings.py를 고친 뒤 다시 실행) =====
-- 뜻 전면 재작성·슬래시 항목 분리(신규 31행)·힌트 기본형 초성·related_words 정리·본문 줄이음 자국 제거.
-- 적용 순서: 16_words_refine_1..N -> 17_courses.sql

UPDATE public.words SET word = '업무지속계획', meaning = '재해나 비상사태가 나도 업무가 끊기지 않도록 미리 세워 두는 대책', hint = 'ㅇㅁㅈㅅㄱㅎ', related_words = '{}'::text[] WHERE id = 376;  -- 업무지속계획
UPDATE public.words SET word = '에너지 믹스', meaning = '원자력·화력·재생에너지 등 에너지원을 어떤 비율로 섞어 쓸지의 구성', hint = 'ㅇㄴㅈㅁㅅ', related_words = ARRAY['탄소배출권']::text[] WHERE id = 377;  -- 에너지 믹스
UPDATE public.words SET word = '엥겔의 법칙', meaning = '소득이 낮을수록 지출에서 식료품비 비중이 높다는 법칙', hint = 'ㅇㄱㅇㅂㅊ', related_words = '{}'::text[] WHERE id = 378;  -- 엥겔의 법칙
UPDATE public.words SET word = '여신전문금융회사', meaning = '예금은 받지 않고 대출·할부·리스만 하는 카드사·캐피탈 같은 금융회사', hint = 'ㅇㅅㅈㅁㄱㅇㅎㅅ', related_words = '{}'::text[] WHERE id = 379;  -- 여신전문금융회사
UPDATE public.words SET word = '역모기지론', meaning = '집을 담보로 맡기고 죽을 때까지 매달 연금처럼 돈을 받는 대출(주택연금)', hint = 'ㅇㅁㄱㅈㄹ', related_words = ARRAY['모기지대출']::text[] WHERE id = 380;  -- 역모기지론
UPDATE public.words SET word = '역외펀드', meaning = '외국 법률에 따라 외국에서 만들어진 펀드', hint = 'ㅇㅇㅍㄷ', related_words = '{}'::text[] WHERE id = 381;  -- 역외펀드
UPDATE public.words SET word = '연구개발(R&D)', meaning = '새 제품·서비스·기술을 만들기 위한 체계적인 연구와 개발 활동', hint = 'ㅇㄱㄱㅂ', related_words = ARRAY['국민소득']::text[] WHERE id = 382;  -- 연구개발(R&D)
UPDATE public.words SET word = '연방준비제도(FRS)', meaning = '미국의 중앙은행 제도(연준)', hint = 'ㅇㅂㅈㅂㅈㄷ', related_words = ARRAY['중앙은행','연방준비은행(FRB)']::text[] WHERE id = 383;  -- 연방준비제도(FRS)/ 연방준비은행(FRB)
UPDATE public.words SET word = '연지급수입', meaning = '물건이나 서류를 받고 일정 기간 뒤에 대금을 치르는 조건의 수입', hint = 'ㅇㅈㄱㅅㅇ', related_words = '{}'::text[] WHERE id = 384;  -- 연지급수입
UPDATE public.words SET word = '연차보고서', meaning = '한국은행이 1년간의 경제 동향과 정책 운용을 정리해 국회에 내는 법정 보고서', hint = 'ㅇㅊㅂㄱㅅ', related_words = '{}'::text[] WHERE id = 385;  -- 연차보고서
UPDATE public.words SET word = '영끌', meaning = '영혼까지 끌어모은다는 뜻으로, 가능한 모든 대출을 동원해 투자하는 행위', hint = 'ㅇㄲ', related_words = '{}'::text[] WHERE id = 386;  -- 영끌
UPDATE public.words SET word = '영업잉여', meaning = '생산으로 생긴 소득 중 노동자 몫을 빼고 자본과 경영에 돌아가는 몫', hint = 'ㅇㅇㅇㅇ', related_words = ARRAY['피용자보수']::text[] WHERE id = 387;  -- 영업잉여
UPDATE public.words SET word = '예금보험제도', meaning = '은행이 망해도 예금보험공사가 일정 한도까지 예금을 대신 갚아 주는 제도', hint = 'ㅇㄱㅂㅎㅈㄷ', related_words = ARRAY['뱅크런','지급준비제도']::text[] WHERE id = 388;  -- 예금보험제도
UPDATE public.words SET word = '예금취급기관', meaning = '예금을 받아 대출을 해 주는 은행·저축은행·신협 등 금융기관', hint = 'ㅇㄱㅊㄱㄱㄱ', related_words = ARRAY['중앙은행']::text[] WHERE id = 389;  -- 예금취급기관
UPDATE public.words SET word = '예금토큰', meaning = '은행 예금을 담보로 블록체인 위에 발행한 디지털 화폐', hint = 'ㅇㄱㅌㅋ', related_words = ARRAY['분산원장기술']::text[] WHERE id = 390;  -- 예금토큰
UPDATE public.words SET word = '예대금리차(예대마진)', meaning = '은행이 받는 대출금리와 주는 예금금리의 차이(은행 수익의 원천)', hint = 'ㅇㄷㄱㄹㅊ', related_words = ARRAY['순이자마진(NIM)']::text[] WHERE id = 391;  -- 예대금리차(예대마진)
UPDATE public.words SET word = '예대율', meaning = '예금 대비 대출이 얼마인지의 비율(100% 이하로 규제)', hint = 'ㅇㄷㅇ', related_words = '{}'::text[] WHERE id = 392;  -- 예대율
UPDATE public.words SET word = '예상손실', meaning = '일정 기간 평균적으로 발생할 것으로 예상되는 손실 금액', hint = 'ㅇㅅㅅㅅ', related_words = ARRAY['VaR(Value at Risk)','대손충당금적립비율','신용위험(신용리스크)']::text[] WHERE id = 393;  -- 예상손실
UPDATE public.words SET word = '예약자금이체제도', meaning = '미래 특정 시점에 자동으로 결제되도록 미리 이체를 예약해 두는 제도', hint = 'ㅇㅇㅈㄱㅇㅊㅈㄷ', related_words = ARRAY['일중당좌대출제도']::text[] WHERE id = 394;  -- 예약자금이체제도
UPDATE public.words SET word = '오픈뱅킹', meaning = '한 앱에서 여러 은행 계좌를 조회·이체할 수 있게 금융 데이터를 개방하는 제도', hint = 'ㅇㅍㅂㅋ', related_words = '{}'::text[] WHERE id = 395;  -- 오픈뱅킹
UPDATE public.words SET word = '옵션', meaning = '미리 정한 가격에 미래에 사거나 팔 수 있는 권리를 사고파는 계약', hint = 'ㅇㅅ', related_words = ARRAY['콜옵션','풋옵션']::text[] WHERE id = 396;  -- 옵션
UPDATE public.words SET word = '와타나베 부인', meaning = '싼 엔화를 빌려 해외 고금리 자산에 투자하는 일본 개인투자자', hint = 'ㅇㅌㄴㅂㅂㅇ', related_words = '{}'::text[] WHERE id = 397;  -- 와타나베 부인
UPDATE public.words SET word = '완충자본', meaning = '위기 때 손실을 흡수하도록 최소 자기자본 위에 추가로 쌓아 두는 은행 자본', hint = 'ㅇㅊㅈㅂ', related_words = ARRAY['BIS 자기자본비율','기본자본(Tier 1)','보완자본(Tier 2)']::text[] WHERE id = 398;  -- 완충자본
UPDATE public.words SET word = '외국환거래법', meaning = '외환거래의 자유를 원칙으로 하되 필요한 최소한만 규제하는 우리나라 외환 기본법', hint = 'ㅇㄱㅎㄱㄹㅂ', related_words = ARRAY['국제수지(BOP)','자본거래자유화']::text[] WHERE id = 399;  -- 외국환거래법
UPDATE public.words SET word = '외국환은행(외국환업무취급기관)', meaning = '정부에 등록하고 외환 업무를 할 수 있는 은행 등 금융기관', hint = 'ㅇㄱㅎㅇㅎ', related_words = ARRAY['외환전산망']::text[] WHERE id = 400;  -- 외국환업무취급기관/외국환은행
