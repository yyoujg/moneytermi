-- ===== 콘텐츠 정제 16/36 (refine.py 생성 — 손으로 고치지 말고 meanings.py를 고친 뒤 다시 실행) =====
-- 뜻 전면 재작성·슬래시 항목 분리(신규 31행)·힌트 기본형 초성·related_words 정리·본문 줄이음 자국 제거.
-- 적용 순서: 16_words_refine_1..N -> 17_courses.sql

UPDATE public.words SET word = '신용연계증권(CLN)', meaning = '신용파산스왑을 증권 형태로 만들어 신용위험을 투자자에게 넘기는 채권', hint = 'ㅅㅇㅇㄱㅈㄱ', related_words = ARRAY['신용파생상품']::text[] WHERE id = 351;  -- 신용연계증권(CLN)
UPDATE public.words SET word = '신용위험(신용리스크)', meaning = '빌려 간 쪽이 돈을 못 갚거나 신용이 나빠져 손실이 날 가능성', hint = 'ㅅㅇㅇㅎ', related_words = ARRAY['예상손실']::text[] WHERE id = 352;  -- 신용위험(신용리스크)
UPDATE public.words SET word = '신용창조', meaning = '은행이 예금과 대출을 반복하며 처음 받은 돈의 몇 배로 통화를 불리는 현상', hint = 'ㅅㅇㅊㅈ', related_words = ARRAY['지급준비제도','통화승수','본원통화']::text[] WHERE id = 353;  -- 신용창조
UPDATE public.words SET word = '신용파생상품', meaning = '채권·대출의 신용위험만 떼어 내 수수료를 받고 남에게 넘기는 금융상품', hint = 'ㅅㅇㅍㅅㅅㅍ', related_words = ARRAY['신용위험(신용리스크)','시장리스크']::text[] WHERE id = 354;  -- 신용파생상품
UPDATE public.words SET word = '신용평가제도', meaning = '기업이나 개인이 빚을 갚을 능력을 등급으로 매기는 제도', hint = 'ㅅㅇㅍㄱㅈㄷ', related_words = '{}'::text[] WHERE id = 355;  -- 신용평가제도
UPDATE public.words SET word = '신용환산율', meaning = '보증 같은 장부 밖 자산이 실제 대출로 바뀔 확률을 반영하는 환산 비율', hint = 'ㅅㅇㅎㅅㅇ', related_words = ARRAY['BIS 자기자본비율']::text[] WHERE id = 356;  -- 신용환산율
UPDATE public.words SET word = '신주인수권부사채(BW)', meaning = '나중에 새 주식을 미리 정한 가격에 살 수 있는 권리가 붙은 회사채', hint = 'ㅅㅈㅇㅅㄱㅂㅅㅊ', related_words = ARRAY['전환사채(CB)']::text[] WHERE id = 357;  -- 신주인수권부사채(BW)
UPDATE public.words SET word = '신흥시장국채권지수(EMBI+)', meaning = '신흥국 정부가 발행한 달러 표시 국채의 수익률로 만든 대표 채권지수', hint = 'ㅅㅎㅅㅈㄱㅊㄱㅈㅅ', related_words = ARRAY['MSCI 지수','FTSE 지수']::text[] WHERE id = 358;  -- 신흥시장국채권지수(EMBI+)
UPDATE public.words SET word = '실망실업자', meaning = '일자리를 찾다 지쳐 지난 4주간 구직활동을 포기한 사람(구직단념자)', hint = 'ㅅㅁㅅㅇㅈ', related_words = ARRAY['고용보조지표','자발적 실업']::text[] WHERE id = 359;  -- 실망실업자
UPDATE public.words SET word = '실물화폐', meaning = '조개·곡물처럼 그 자체로 쓸모와 가치가 있어 돈으로 쓰인 물건', hint = 'ㅅㅁㅎㅍ', related_words = ARRAY['명목화폐']::text[] WHERE id = 360;  -- 실물화폐/명목화폐
UPDATE public.words SET word = '실시간총액결제', meaning = '은행 간 결제를 건별로 상계 없이 즉시 전액 처리하는 방식', hint = 'ㅅㅅㄱㅊㅇㄱㅈ', related_words = ARRAY['차액결제시스템']::text[] WHERE id = 361;  -- 실시간총액결제
UPDATE public.words SET word = '실업률갭', meaning = '실제 실업률과 자연실업률의 차이(노동시장 여력 지표)', hint = 'ㅅㅇㄹㄱ', related_words = ARRAY['제조업평균가동률갭','자연실업률']::text[] WHERE id = 362;  -- 실업률갭
UPDATE public.words SET word = '실질구매력', meaning = '물가를 감안해 같은 돈으로 실제 살 수 있는 재화와 서비스의 양', hint = 'ㅅㅈㄱㅁㄹ', related_words = ARRAY['실질임금','인플레이션']::text[] WHERE id = 363;  -- 실질구매력
UPDATE public.words SET word = '실질임금', meaning = '명목임금을 물가지수로 나눠 실제 구매력 기준으로 본 임금', hint = 'ㅅㅈㅇㄱ', related_words = ARRAY['소비자물가지수(CPI)','인플레이션']::text[] WHERE id = 364;  -- 실질임금
UPDATE public.words SET word = '실효환율', meaning = '여러 교역상대국 통화 대비 자국 통화 가치를 무역 비중으로 평균 낸 환율', hint = 'ㅅㅎㅎㅇ', related_words = '{}'::text[] WHERE id = 365;  -- 실효환율
UPDATE public.words SET word = '쌍순환 전략', meaning = '내수와 수출 두 축을 함께 키우겠다는 중국의 경제 전략', hint = 'ㅆㅅㅎㅈㄹ', related_words = ARRAY['국민소득']::text[] WHERE id = 366;  -- 쌍순환 전략
UPDATE public.words SET word = '아세안+3 거시경제조사기구(AMRO)', meaning = '아세안과 한·중·일이 만든 역내 경제 감시 국제기구', hint = 'ㅇㅅㅇ3ㄱㅅㄱㅈㅈㅅㄱㄱ', related_words = ARRAY['동남아시아국가연합(ASEAN)','동남아시아국가연합+한·중·일(ASEAN+3)']::text[] WHERE id = 367;  -- 아세안+3 거시경제조사기구(AMRO)
UPDATE public.words SET word = '아시아개발은행(ADB)', meaning = '아시아·태평양 개발도상국의 경제개발을 지원하는 국제금융기구', hint = 'ㅇㅅㅇㄱㅂㅇㅎ', related_words = '{}'::text[] WHERE id = 368;  -- 아시아개발은행(ADB)
UPDATE public.words SET word = '아시아인프라은행(AIIB)', meaning = '중국 주도로 아시아 인프라 건설 자금을 지원하려고 만든 국제금융기구', hint = 'ㅇㅅㅇㅇㅍㄹㅇㅎ', related_words = ARRAY['아시아개발은행(ADB)']::text[] WHERE id = 369;  -- 아시아인프라은행(AIIB)
UPDATE public.words SET word = '아시아태평양경제협력체(APEC)', meaning = '아시아·태평양 연안 국가들의 경제협력 국제기구', hint = 'ㅇㅅㅇㅌㅍㅇㄱㅈㅎㄹㅊ', related_words = ARRAY['동남아시아국가연합(ASEAN)']::text[] WHERE id = 370;  -- 아시아태평양경제협력체(APEC)
UPDATE public.words SET word = '애그플레이션', meaning = '농산물 가격이 급등해 전체 물가를 끌어올리는 현상', hint = 'ㅇㄱㅍㄹㅇㅅ', related_words = ARRAY['인플레이션']::text[] WHERE id = 371;  -- 애그플레이션
UPDATE public.words SET word = '양도성예금증서(CD)', meaning = '남에게 팔 수 있게 만든 은행 정기예금증서', hint = 'ㅇㄷㅅㅇㄱㅈㅅ', related_words = '{}'::text[] WHERE id = 372;  -- 양도성예금증서(CD)
UPDATE public.words SET word = '양적완화정책', meaning = '금리를 더 내릴 수 없을 때 중앙은행이 국채를 대량 사들여 돈을 푸는 정책', hint = 'ㅇㅈㅇㅎㅈㅊ', related_words = ARRAY['출구전략']::text[] WHERE id = 373;  -- 양적완화정책
UPDATE public.words SET word = '어음관리계좌(CMA)', meaning = '증권사·종금사에 맡긴 돈을 어음·채권에 굴려 수시입출금이 되는 단기상품', hint = 'ㅇㅇㄱㄹㄱㅈ', related_words = '{}'::text[] WHERE id = 374;  -- 어음관리계좌(CMA)
UPDATE public.words SET word = '어음교환', meaning = '은행들이 서로 받은 수표·어음을 맞바꾸고 차액을 정산하는 것', hint = 'ㅇㅇㄱㅎ', related_words = ARRAY['소액지급시스템','전자어음']::text[] WHERE id = 375;  -- 어음교환
