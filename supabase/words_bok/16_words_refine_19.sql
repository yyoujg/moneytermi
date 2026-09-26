-- ===== 콘텐츠 정제 19/36 (refine.py 생성 — 손으로 고치지 말고 meanings.py를 고친 뒤 다시 실행) =====
-- 뜻 전면 재작성·슬래시 항목 분리(신규 31행)·힌트 기본형 초성·related_words 정리·본문 줄이음 자국 제거.
-- 적용 순서: 16_words_refine_1..N -> 17_courses.sql

UPDATE public.words SET word = '위험회피심리', meaning = '같은 기대수익이면 덜 위험한 쪽을 고르려는 투자자의 성향', hint = 'ㅇㅎㅎㅍㅅㄹ', related_words = '{}'::text[] WHERE id = 426;  -- 위험회피심리
UPDATE public.words SET word = '유동비율', meaning = '유동자산을 유동부채로 나눠 1년 안에 갚을 빚을 감당할 수 있는지 보는 비율', hint = 'ㅇㄷㅂㅇ', related_words = '{}'::text[] WHERE id = 427;  -- 유동비율
UPDATE public.words SET word = '유동성 함정', meaning = '금리를 아무리 내려도 돈이 돌지 않아 통화정책이 효과를 잃는 상태', hint = 'ㅇㄷㅅㅎㅈ', related_words = ARRAY['유동성']::text[] WHERE id = 428;  -- 유동성 함정
UPDATE public.words SET word = '유동성리스크', meaning = '일시적으로 돈이 부족해 제때 결제하지 못할 위험', hint = 'ㅇㄷㅅㄹㅅㅋ', related_words = ARRAY['신용위험(신용리스크)']::text[] WHERE id = 429;  -- 유동성리스크
UPDATE public.words SET word = '유동성커버리지비율', meaning = '30일간 위기 상황을 버틸 만큼 은행이 고유동성 자산을 갖고 있는지 보는 비율', hint = 'ㅇㄷㅅㅋㅂㄹㅈㅂㅇ', related_words = ARRAY['유동성리스크','순안정자금조달비율']::text[] WHERE id = 430;  -- 유동성커버리지비율
UPDATE public.words SET word = '유럽부흥개발은행(EBRD)', meaning = '중·동부 유럽 국가의 시장경제 전환을 돕는 국제금융기구', hint = 'ㅇㄹㅂㅎㄱㅂㅇㅎ', related_words = ARRAY['유럽연합(EU)']::text[] WHERE id = 431;  -- 유럽부흥개발은행(EBRD)
UPDATE public.words SET word = '유럽연합(EU)', meaning = '유럽 국가들이 경제·정치 통합을 위해 만든 공동체', hint = 'ㅇㄹㅇㅎ', related_words = ARRAY['유럽중앙은행(ECB)','마스트리히트조약']::text[] WHERE id = 432;  -- 유럽연합(EU)
UPDATE public.words SET word = '유럽중앙은행(ECB)', meaning = '유로화를 쓰는 나라들의 통화정책을 맡는 유럽의 중앙은행', hint = 'ㅇㄹㅈㅇㅇㅎ', related_words = ARRAY['유럽연합(EU)']::text[] WHERE id = 433;  -- 유럽중앙은행(ECB)
UPDATE public.words SET word = '유로달러(Euro dollar)', meaning = '미국 밖의 은행에 예치돼 거래되는 미국 달러', hint = 'ㅇㄹㄷㄹ', related_words = ARRAY['유로마켓(Euro market)']::text[] WHERE id = 434;  -- 유로달러(Euro dollar)
UPDATE public.words SET word = '유로마켓(Euro market)', meaning = '어떤 통화가 그 발행국 밖에서 거래되는 국제금융시장', hint = 'ㅇㄹㅁㅋ', related_words = ARRAY['유로달러(Euro dollar)']::text[] WHERE id = 435;  -- 유로마켓(Euro market)
UPDATE public.words SET word = '유통시장', meaning = '이미 발행된 주식·채권을 투자자끼리 사고파는 시장', hint = 'ㅇㅌㅅㅈ', related_words = ARRAY['발행시장','채권시장','주식시장']::text[] WHERE id = 436;  -- 유통시장
UPDATE public.words SET word = '은선', meaning = '지폐 용지 속에 넣은 위조방지용 가는 금속·플라스틱 선', hint = 'ㅇㅅ', related_words = ARRAY['숨은 그림(은화)']::text[] WHERE id = 437;  -- 은선
UPDATE public.words SET word = '은행경영공시제도', meaning = '은행이 경영 실적과 건전성 정보를 정기적으로 공개하도록 한 제도', hint = 'ㅇㅎㄱㅇㄱㅅㅈㄷ', related_words = '{}'::text[] WHERE id = 438;  -- 은행경영공시제도
UPDATE public.words SET word = '은행인수어음(BA)', meaning = '무역대금 결제용 환어음을 은행이 지급 보증(인수)해 준 어음', hint = 'ㅇㅎㅇㅅㅇㅇ', related_words = '{}'::text[] WHERE id = 439;  -- 은행인수어음(BA)
UPDATE public.words SET word = '을기금(Capital B)', meaning = '외국은행 국내지점이 여신 한도 계산 때 자본으로 인정받는 명목상 자본금', hint = 'ㅇㄱㄱ', related_words = ARRAY['갑기금(Capital A)']::text[] WHERE id = 440;  -- 을기금(Capital B)
UPDATE public.words SET word = '의중임금', meaning = '근로자가 일하러 나오게 하려면 최소한 줘야 하는 임금(유보임금)', hint = 'ㅇㅈㅇㄱ', related_words = ARRAY['통상임금']::text[] WHERE id = 441;  -- 의중임금
UPDATE public.words SET word = '이구환신', meaning = '낡은 가전·자동차를 새것으로 바꾸면 보조금을 주는 중국의 소비 촉진 정책', hint = 'ㅇㄱㅎㅅ', related_words = ARRAY['쌍순환 전략']::text[] WHERE id = 442;  -- 이구환신
UPDATE public.words SET word = '이슬람금융', meaning = '이자를 금지하는 이슬람 율법에 따라 운영되는 금융', hint = 'ㅇㅅㄹㄱㅇ', related_words = ARRAY['수쿠크']::text[] WHERE id = 443;  -- 이슬람금융
UPDATE public.words SET word = '이연차액결제', meaning = '일정 기간 주고받을 금액을 모아 상계한 뒤 차액만 나중에 결제하는 방식', hint = 'ㅇㅇㅊㅇㄱㅈ', related_words = ARRAY['신용위험(신용리스크)']::text[] WHERE id = 444;  -- 이연차액결제
UPDATE public.words SET word = '이자보상배율', meaning = '영업이익을 이자비용으로 나눠 번 돈으로 이자를 감당할 수 있는지 보는 지표', hint = 'ㅇㅈㅂㅅㅂㅇ', related_words = '{}'::text[] WHERE id = 445;  -- 이자보상배율
UPDATE public.words SET word = '이전소득수지', meaning = '교포 송금·기부금처럼 외국과 대가 없이 주고받은 돈의 차이', hint = 'ㅇㅈㅅㄷㅅㅈ', related_words = ARRAY['경상수지','국제수지(BOP)']::text[] WHERE id = 446;  -- 이전소득수지
UPDATE public.words SET word = '이중통화채(Dual Currency Bond)', meaning = '발행할 때와 갚을 때 서로 다른 통화를 쓰는 채권', hint = 'ㅇㅈㅌㅎㅊ', related_words = '{}'::text[] WHERE id = 447;  -- 이중통화채(Dual Currency Bond)
UPDATE public.words SET word = '이차전지', meaning = '충전해서 여러 번 다시 쓸 수 있는 전지(배터리)', hint = 'ㅇㅊㅈㅈ', related_words = '{}'::text[] WHERE id = 448;  -- 이차전지
UPDATE public.words SET word = '이표채', meaning = '이자 지급일마다 붙어 있는 쿠폰을 떼어 이자를 받는 채권', hint = 'ㅇㅍㅊ', related_words = '{}'::text[] WHERE id = 449;  -- 이표채
UPDATE public.words SET word = '익스포저', meaning = '특정 위험에 노출되어 있는 금액', hint = 'ㅇㅅㅍㅈ', related_words = ARRAY['레버리지비율','위험가중자산','위험가중치']::text[] WHERE id = 450;  -- 익스포저
