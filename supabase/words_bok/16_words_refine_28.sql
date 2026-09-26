-- ===== 콘텐츠 정제 28/36 (refine.py 생성 — 손으로 고치지 말고 meanings.py를 고친 뒤 다시 실행) =====
-- 뜻 전면 재작성·슬래시 항목 분리(신규 31행)·힌트 기본형 초성·related_words 정리·본문 줄이음 자국 제거.
-- 적용 순서: 16_words_refine_1..N -> 17_courses.sql

UPDATE public.words SET word = '해외외국환업무취급기관(RFI)', meaning = '국내 지점 없이도 등록만 하면 국내 외환시장에 참여할 수 있는 해외 금융회사', hint = 'ㅎㅇㅇㄱㅎㅇㅁㅊㄱㄱㄱ', related_words = ARRAY['외국환은행(외국환업무취급기관)']::text[] WHERE id = 651;  -- 해외외국환업무취급기관(RFI)
UPDATE public.words SET word = '헤지펀드', meaning = '소수 거액 투자자의 돈으로 고수익을 노려 공격적으로 운용하는 사모펀드', hint = 'ㅎㅈㅍㄷ', related_words = ARRAY['뮤추얼펀드']::text[] WHERE id = 652;  -- 헤지펀드
UPDATE public.words SET word = '현금자동인출기(CD)공동망', meaning = '다른 은행의 현금인출기에서도 출금·이체가 되게 은행들을 연결한 공동망', hint = 'ㅎㄱㅈㄷㅇㅊㄱ', related_words = ARRAY['소액지급시스템']::text[] WHERE id = 653;  -- 현금자동인출기(CD)공동망
UPDATE public.words SET word = '현시비교우위지수(RCA)', meaning = '한 나라가 특정 품목 수출에서 상대적으로 얼마나 경쟁력이 있는지 보는 지수', hint = 'ㅎㅅㅂㄱㅇㅇㅈㅅ', related_words = ARRAY['수출경합도지수']::text[] WHERE id = 654;  -- 현시비교우위지수(RCA)
UPDATE public.words SET word = '현용화폐', meaning = '지금 법적으로 통용되는 한국은행권 지폐와 동전', hint = 'ㅎㅇㅎㅍ', related_words = ARRAY['미발행화폐','실물화폐','명목화폐']::text[] WHERE id = 655;  -- 현용화폐
UPDATE public.words SET word = '현지금융', meaning = '국내 기업의 해외 지점·법인이 외국에서 외화를 빌리거나 보증받는 것', hint = 'ㅎㅈㄱㅇ', related_words = ARRAY['현지법인']::text[] WHERE id = 656;  -- 현지금융
UPDATE public.words SET word = '현지법인', meaning = '국내 기업이 외국 법에 따라 해외에 세운 회사', hint = 'ㅎㅈㅂㅇ', related_words = ARRAY['외국환거래법']::text[] WHERE id = 657;  -- 현지법인
UPDATE public.words SET word = '협의통화(M1)', meaning = '현금과 언제든 찾을 수 있는 예금만 합친 가장 좁은 범위의 통화량', hint = 'ㅎㅇㅌㅎ', related_words = ARRAY['통화지표','통화량']::text[] WHERE id = 658;  -- 협의통화(M1)
UPDATE public.words SET word = '혼합형결제시스템', meaning = '실시간총액결제의 안전성과 차액결제의 유동성 절약을 합친 결제시스템', hint = 'ㅎㅎㅎㄱㅈㅅㅅㅌ', related_words = ARRAY['총액결제시스템','차액결제시스템']::text[] WHERE id = 659;  -- 혼합형결제시스템
UPDATE public.words SET word = '홀로그램', meaning = '기울이면 무늬가 바뀌는 지폐의 3차원 위조방지 장치', hint = 'ㅎㄹㄱㄹ', related_words = '{}'::text[] WHERE id = 660;  -- 홀로그램
UPDATE public.words SET word = '화폐교환', meaning = '찢어지거나 낡은 돈을 한국은행이나 은행에서 새 돈으로 바꿔 주는 것', hint = 'ㅎㅍㄱㅎ', related_words = '{}'::text[] WHERE id = 661;  -- 화폐교환
UPDATE public.words SET word = '화폐발행액', meaning = '한국은행이 발행해 시중에 나가 있는 지폐와 동전의 총액', hint = 'ㅎㅍㅂㅎㅇ', related_words = ARRAY['화폐환수']::text[] WHERE id = 662;  -- 화폐발행/화폐발행액
UPDATE public.words SET word = '화폐의 액면체계', meaning = '천원·오천원·만원처럼 한 나라 화폐 액면 종류의 구성', hint = 'ㅎㅍㅇㅇㅁㅊㄱ', related_words = '{}'::text[] WHERE id = 663;  -- 화폐의 액면체계
UPDATE public.words SET word = '환경계정', meaning = '경제활동과 환경의 관계를 국민계정에 덧붙여 기록한 환경경제통합계정', hint = 'ㅎㄱㄱㅈ', related_words = ARRAY['녹색GDP','환경권']::text[] WHERE id = 664;  -- 환경계정
UPDATE public.words SET word = '환경권', meaning = '모든 국민이 건강하고 쾌적한 환경에서 살 권리', hint = 'ㅎㄱㄱ', related_words = ARRAY['탄소배출권','환경계정']::text[] WHERE id = 665;  -- 환경권
UPDATE public.words SET word = '환리스크', meaning = '환율이 예상과 다르게 움직여 외화 자산·부채 가치가 변할 위험', hint = 'ㅎㄹㅅㅋ', related_words = ARRAY['외환결제리스크']::text[] WHERE id = 666;  -- 환리스크
UPDATE public.words SET word = '환리스크 헤지', meaning = '선물환·통화옵션 등으로 환율 변동 위험을 미리 없애는 것', hint = 'ㅎㄹㅅㅋㅎㅈ', related_words = ARRAY['환리스크','외환결제리스크']::text[] WHERE id = 667;  -- 환리스크 헤지
UPDATE public.words SET word = '환매조건부매매(RP)', meaning = '나중에 정해진 가격으로 되사기로 약속하고 채권을 파는 단기 자금거래', hint = 'ㅎㅁㅈㄱㅂㅁㅁ', related_words = ARRAY['공개시장운영']::text[] WHERE id = 668;  -- 환매조건부매매/RP/Repo
UPDATE public.words SET word = '환어음', meaning = '발행인이 제3자(지급인)에게 돈을 지급하도록 위탁하는 어음', hint = 'ㅎㅇㅇ', related_words = ARRAY['지급수단']::text[] WHERE id = 669;  -- 환어음
UPDATE public.words SET word = '환율조작국', meaning = '미국이 대미 무역흑자와 외환시장 개입이 과도하다고 지정한 나라', hint = 'ㅎㅇㅈㅈㄱ', related_words = ARRAY['스무딩오퍼레이션']::text[] WHERE id = 670;  -- 환율조작국
UPDATE public.words SET word = '환전영업자(환전상)', meaning = '외국 돈과 여행자수표를 사고파는 환전소', hint = 'ㅎㅈㅇㅇㅈ', related_words = '{}'::text[] WHERE id = 671;  -- 환전영업자(환전상)
UPDATE public.words SET word = '환차손', meaning = '환율 변동으로 외화 자산·부채를 원화로 환산할 때 생긴 손실', hint = 'ㅎㅊㅅ', related_words = ARRAY['외국환포지션','환차익']::text[] WHERE id = 672;  -- 환차손/환차익
UPDATE public.words SET word = '회사채', meaning = '민간 기업이 장기 자금을 마련하려고 발행하는 채권', hint = 'ㅎㅅㅊ', related_words = ARRAY['신용스프레드']::text[] WHERE id = 673;  -- 회사채
UPDATE public.words SET word = '후방연쇄효과', meaning = '한 산업이 성장하면 그 산업에 원자재·부품을 대는 산업도 함께 커지는 효과', hint = 'ㅎㅂㅇㅅㅎㄱ', related_words = ARRAY['생산유발효과','전방연쇄효과']::text[] WHERE id = 674;  -- 후방연쇄효과
UPDATE public.words SET word = '후순위금융채', meaning = '은행이 망하면 예금자보다 나중에 갚는 채권(보완자본으로 인정)', hint = 'ㅎㅅㅇㄱㅇㅊ', related_words = ARRAY['BIS 자기자본비율','보완자본(Tier 2)']::text[] WHERE id = 675;  -- 후순위금융채
