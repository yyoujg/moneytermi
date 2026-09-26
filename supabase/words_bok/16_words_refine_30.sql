-- ===== 콘텐츠 정제 30/36 (refine.py 생성 — 손으로 고치지 말고 meanings.py를 고친 뒤 다시 실행) =====
-- 뜻 전면 재작성·슬래시 항목 분리(신규 31행)·힌트 기본형 초성·related_words 정리·본문 줄이음 자국 제거.
-- 적용 순서: 16_words_refine_1..N -> 17_courses.sql

UPDATE public.words SET word = 'KP스프레드', meaning = '한국 기관이 해외에서 발행한 외화채권 금리와 미국 국채 금리의 차이', hint = 'Kㅅㅍㄹㄷ', related_words = ARRAY['국채']::text[] WHERE id = 701;  -- KP스프레드
UPDATE public.words SET word = 'M&A', meaning = '기업을 사들이거나 합쳐 지배권을 얻는 인수합병', hint = 'MA', related_words = '{}'::text[] WHERE id = 702;  -- M&A
UPDATE public.words SET word = 'MOVE', meaning = '미국 국채 옵션 가격으로 채권시장의 변동성 기대를 나타낸 지수', hint = 'M', related_words = ARRAY['VIX','CVIX','옵션']::text[] WHERE id = 703;  -- MOVE
UPDATE public.words SET word = 'MSCI 지수', meaning = '미국 모건스탠리캐피털인터내셔널이 발표하는 세계 주가지수', hint = 'Mㅈㅅ', related_words = ARRAY['FTSE 지수']::text[] WHERE id = 704;  -- MSCI 지수
UPDATE public.words SET word = 'N-B SRS', meaning = '은행 간 거래 연결망을 통해 번지는 시스템 리스크를 측정하는 지표', hint = 'NBS', related_words = ARRAY['금융시스템 상호연계성','시스템 리스크']::text[] WHERE id = 705;  -- N-B SRS
UPDATE public.words SET word = 'NFC(Near Field Communication) 기술', meaning = '10cm 이내 가까운 거리에서 기기끼리 데이터를 주고받는 근거리 무선통신', hint = 'N', related_words = ARRAY['간편 송금']::text[] WHERE id = 706;  -- NFC(Near Field Communication) 기술
UPDATE public.words SET word = 'Nowcasting', meaning = '실시간 데이터로 지금 또는 아주 가까운 미래의 경제 상황을 추정하는 기법', hint = 'N', related_words = ARRAY['경제전망보고서','국내총생산(GDP)','실업률','소비자심리지수']::text[] WHERE id = 707;  -- Nowcasting
UPDATE public.words SET word = 'OIS', meaning = '하루짜리 초단기 금리와 고정금리를 교환하는 금리스왑', hint = 'O', related_words = ARRAY['금리스왑']::text[] WHERE id = 708;  -- OIS
UPDATE public.words SET word = 'P2P대출', meaning = '금융회사 없이 온라인 플랫폼에서 개인끼리 돈을 빌려주고 빌리는 대출', hint = 'Pㄷㅊ', related_words = ARRAY['자산유동화증권','Secondary-CBO']::text[] WHERE id = 709;  -- P2P대출
UPDATE public.words SET word = 'PF-ABCP', meaning = '부동산 개발 사업 대출을 기초자산으로 발행한 자산유동화 기업어음', hint = 'PA', related_words = ARRAY['특수목적기구(SPV)']::text[] WHERE id = 710;  -- PF-ABCP
UPDATE public.words SET word = 'SOFR', meaning = '미국 국채를 담보로 하루 동안 돈을 빌릴 때의 실거래 기준금리', hint = 'S', related_words = '{}'::text[] WHERE id = 711;  -- SOFR
UPDATE public.words SET word = 'SWIFT', meaning = '전 세계 은행이 송금·결제 메시지를 주고받는 국제금융통신망', hint = 'S', related_words = '{}'::text[] WHERE id = 712;  -- SWIFT
UPDATE public.words SET word = 'Treasury Bill(T/B)', meaning = '미국 재무부가 발행하는 만기 1년 이하의 할인식 단기국채', hint = 'TB', related_words = '{}'::text[] WHERE id = 713;  -- Treasury Bill(T/B)
UPDATE public.words SET word = 'V-KOSPI', meaning = '코스피200 옵션 가격으로 계산한 한국 증시의 변동성 지수(공포지수)', hint = 'VK', related_words = ARRAY['코스피200','변동성지수(VIX)','공포지수(Fear Index)']::text[] WHERE id = 714;  -- V-KOSPI
UPDATE public.words SET word = 'VAN사업자', meaning = '카드 결제 정보를 가맹점과 카드사 사이에서 중계하는 부가가치통신망 사업자', hint = 'Vㅅㅇㅈ', related_words = ARRAY['지급','전자금융']::text[] WHERE id = 715;  -- VAN사업자
UPDATE public.words SET word = 'VaR(Value at Risk)', meaning = '일정 기간·신뢰수준에서 발생할 수 있는 최대 손실 예상 금액', hint = 'V', related_words = ARRAY['예상손실']::text[] WHERE id = 716;  -- VaR(Value at Risk)
