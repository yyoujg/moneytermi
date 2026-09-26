-- ===== 콘텐츠 정제 9/15 (refine.py 생성 — 손으로 고치지 말고 meanings.py를 고친 뒤 다시 실행) =====
-- 라이브 덤프와 비교해 아직 적용되지 않은 행만. 단문 UPDATE 294행, 본문 UPDATE 64행.
-- 적용 순서: 16_words_refine_1..N -> 17_courses.sql

UPDATE public.words SET word = '장기침체', meaning = '투자 부족과 수요 부족으로 경제가 오랫동안 저성장에 머무는 상태', hint = 'ㅈㄱㅊㅊ', related_words = ARRAY['경기조절정책(경제안정화정책)','골디락스경제','대안정기']::text[] WHERE id = 485;  -- 장기침체
UPDATE public.words SET word = '장내시장', meaning = '한국거래소처럼 표준화된 규칙에 따라 거래하는 조직화된 시장', hint = 'ㅈㄴㅅㅈ', related_words = ARRAY['장외시장']::text[] WHERE id = 486;  -- 장내시장
UPDATE public.words SET word = '장단기금리차', meaning = '장기금리와 단기금리의 차이(경기 전망 지표)', hint = 'ㅈㄷㄱㄱㄹㅊ', related_words = ARRAY['기준금리']::text[] WHERE id = 487;  -- 장단기금리차
UPDATE public.words SET word = '장외시장', meaning = '거래소 밖에서 중개기관을 통해 개별적으로 거래하는 시장', hint = 'ㅈㅇㅅㅈ', related_words = ARRAY['장내시장']::text[] WHERE id = 488;  -- 장외시장
UPDATE public.words SET word = '재산소득', meaning = '금융자산이나 토지를 빌려주고 받는 이자·배당·임대료 소득', hint = 'ㅈㅅㅅㄷ', related_words = ARRAY['본원소득']::text[] WHERE id = 489;  -- 재산소득
UPDATE public.words SET word = '재정수지', meaning = '정부 수입과 지출의 차이', hint = 'ㅈㅈㅅㅈ', related_words = ARRAY['국채']::text[] WHERE id = 490;  -- 재정수지
UPDATE public.words SET word = '중간소비', meaning = '생산 과정에서 원재료·연료처럼 다 써 버리는 재화와 서비스', hint = 'ㅈㄱㅅㅂ', related_words = ARRAY['최종수요','중간수요']::text[] WHERE id = 531;  -- 중간소비
UPDATE public.words SET word = '중개무역', meaning = '제3국 상인이 수출자와 수입자 사이에서 거래를 중개하고 수수료를 받는 무역', hint = 'ㅈㄱㅁㅇ', related_words = ARRAY['중계무역']::text[] WHERE id = 532;  -- 중개무역
UPDATE public.words SET word = '중계무역', meaning = '물건을 수입해 국내에 들이지 않고 그대로 제3국에 되파는 무역', hint = 'ㅈㄱㅁㅇ', related_words = ARRAY['중개무역']::text[] WHERE id = 533;  -- 중계무역
UPDATE public.words SET word = '중앙거래당사자', meaning = '모든 거래의 상대방이 되어 청산과 결제 이행을 보증하는 기관', hint = 'ㅈㅇㄱㄹㄷㅅㅈ', related_words = ARRAY['지급결제시스템']::text[] WHERE id = 534;  -- 중앙거래당사자
UPDATE public.words SET word = '중앙예탁기관', meaning = '증권을 한곳에 모아 보관하고 계좌대체로 권리를 이전해 주는 기관(한국예탁결제원)', hint = 'ㅈㅇㅇㅌㄱㄱ', related_words = ARRAY['계좌대체']::text[] WHERE id = 535;  -- 중앙예탁기관
UPDATE public.words SET word = '중앙은행', meaning = '돈을 발행하고 은행의 은행·정부의 은행 역할을 하며 물가를 안정시키는 기관', hint = 'ㅈㅇㅇㅎ', related_words = ARRAY['금융안정','금본위제']::text[] WHERE id = 536;  -- 중앙은행
UPDATE public.words SET word = '중앙은행 디지털화폐(CBDC)', meaning = '중앙은행이 직접 발행하는 전자 형태의 법정화폐', hint = 'ㅈㅇㅇㅎㄷㅈㅌㅎㅍ', related_words = ARRAY['스테이블코인','분산원장 기술','지준예치금']::text[] WHERE id = 537;  -- 중앙은행 디지털화폐(CBDC)
UPDATE public.words SET word = '증거금', meaning = '주식·선물 거래 약정을 지키겠다는 보증으로 증권사에 미리 맡기는 돈', hint = 'ㅈㄱㄱ', related_words = ARRAY['증권결제리스크']::text[] WHERE id = 538;  -- 증거금
UPDATE public.words SET word = '증권결제리스크', meaning = '증권 인도나 대금 지급이 예정대로 안 돼 손실이 날 위험', hint = 'ㅈㄱㄱㅈㄹㅅㅋ', related_words = ARRAY['증권대금동시결제(DVP)','분리결제']::text[] WHERE id = 539;  -- 증권결제리스크
UPDATE public.words SET word = '증권대금동시결제(DVP)', meaning = '증권을 넘겨야 돈을 주고 돈을 줘야 증권을 넘기는 동시 결제 방식', hint = 'ㅈㄱㄷㄱㄷㅅㄱㅈ', related_words = ARRAY['분리결제','외환동시결제(PVP)']::text[] WHERE id = 540;  -- 증권대금동시결제(DVP)
UPDATE public.words SET word = '증권커스터디서비스', meaning = '투자자 대신 증권을 보관하고 배당 수령 등 관리 업무를 해 주는 서비스', hint = 'ㅈㄱㅋㅅㅌㄷㅅㅂㅅ', related_words = '{}'::text[] WHERE id = 541;  -- 증권커스터디서비스
UPDATE public.words SET word = '증시주변자금', meaning = '주식시장 밖에서 언제든 유입될 수 있는 대기 자금(예탁금·MMF 등)', hint = 'ㅈㅅㅈㅂㅈㄱ', related_words = '{}'::text[] WHERE id = 542;  -- 증시주변자금
UPDATE public.words SET word = '지급결제 및 시장인프라 위원회 (BIS CPMI)', meaning = '국제결제은행 산하에서 지급결제 국제기준을 만드는 위원회', hint = 'ㅈㄱㄱㅈㅁㅅㅈㅇㅍㄹㅇㅇㅎ', related_words = ARRAY['국제결제은행(BIS)','지급결제시스템']::text[] WHERE id = 543;  -- 지급결제 및 시장인프라 위원회 (BIS CPMI)
UPDATE public.words SET word = '지급결제보고서', meaning = '한국은행이 매년 국내 지급결제제도 운영 현황을 정리해 내는 보고서', hint = 'ㅈㄱㄱㅈㅂㄱㅅ', related_words = ARRAY['지급결제시스템']::text[] WHERE id = 544;  -- 지급결제보고서
UPDATE public.words SET word = '지급결제시스템', meaning = '지급·청산·결제가 원활히 이뤄지도록 하는 중앙은행·은행·법규·지급수단의 체계', hint = 'ㅈㄱㄱㅈㅅㅅㅌ', related_words = ARRAY['거액지급시스템','소액지급시스템','지급수단']::text[] WHERE id = 545;  -- 지급결제시스템
UPDATE public.words SET word = '지급결제제도 감시', meaning = '중앙은행이 지급결제시스템을 모니터링·평가하고 개선을 유도하는 기능', hint = 'ㅈㄱㄱㅈㅈㄷㄱㅅ', related_words = ARRAY['지급결제 및 시장인프라 위원회(BIS CPMI)','결제리스크']::text[] WHERE id = 546;  -- 지급결제제도 감시
UPDATE public.words SET word = '지급수단', meaning = '현금·계좌이체·카드·수표처럼 돈을 지급하는 데 쓰는 수단', hint = 'ㅈㄱㅅㄷ', related_words = ARRAY['지급결제시스템']::text[] WHERE id = 547;  -- 지급수단
UPDATE public.words SET word = '지급여력비율(K-ICS)', meaning = '보험사가 예상 밖 손실에도 보험금을 줄 수 있는지 보는 자본 건전성 비율', hint = 'ㅈㄱㅇㄹㅂㅇ', related_words = '{}'::text[] WHERE id = 548;  -- 지급여력비율/K-ICS비율
UPDATE public.words SET word = '지급준비자산제도', meaning = '한국은행이 은행에 예금지급준비금 외에 국채 등 준비자산을 더 갖게 하는 제도', hint = 'ㅈㄱㅈㅂㅈㅅㅈㄷ', related_words = '{}'::text[] WHERE id = 549;  -- 지급준비자산제도
