-- ===== 콘텐츠 정제 5/15 (refine.py 생성 — 손으로 고치지 말고 meanings.py를 고친 뒤 다시 실행) =====
-- 라이브 덤프와 비교해 아직 적용되지 않은 행만. 단문 UPDATE 294행, 본문 UPDATE 64행.
-- 적용 순서: 16_words_refine_1..N -> 17_courses.sql

UPDATE public.words SET word = '브릿지론', meaning = '큰 자금이 마련될 때까지 잠시 다리 역할로 쓰는 단기 대출', hint = 'ㅂㄹㅈㄹ', related_words = '{}'::text[] WHERE id = 264;  -- 브릿지론
UPDATE public.words SET word = '비관측경제(NOE)', meaning = '지하경제처럼 통계 자료에 잡히지 않아 국내총생산 계산에서 빠지는 경제활동', hint = 'ㅂㄱㅊㄱㅈ', related_words = ARRAY['국내총생산(GDP)']::text[] WHERE id = 265;  -- 비관측경제(NOE)
UPDATE public.words SET word = '비교우위', meaning = '남보다 더 적은 기회비용으로 어떤 것을 만들 수 있는 능력(무역의 근거)', hint = 'ㅂㄱㅇㅇ', related_words = ARRAY['현시비교우위지수(RCA)']::text[] WHERE id = 266;  -- 비교우위
UPDATE public.words SET word = '비용인상 인플레이션', meaning = '임금·원자재 같은 생산비용이 올라 물가가 오르는 인플레이션', hint = 'ㅂㅇㅇㅅㅇㅍㄹㅇㅅ', related_words = ARRAY['수요견인 인플레이션']::text[] WHERE id = 267;  -- 비용인상 인플레이션
UPDATE public.words SET word = '비트코인', meaning = '중앙 관리자 없이 블록체인으로 운영되는 최초의 암호화폐', hint = 'ㅂㅌㅋㅇ', related_words = ARRAY['가상자산','작업증명','블록체인']::text[] WHERE id = 268;  -- 비트코인
UPDATE public.words SET word = '빅데이터', meaning = '대규모 정형·비정형 데이터와 거기서 가치를 뽑아내는 분석 기술', hint = 'ㅂㄷㅇㅌ', related_words = ARRAY['로보어드바이저']::text[] WHERE id = 269;  -- 빅데이터
UPDATE public.words SET word = '빅맥지수', meaning = '각국 맥도날드 햄버거 가격을 비교해 통화의 구매력을 재는 지수', hint = 'ㅂㅁㅈㅅ', related_words = ARRAY['구매력평가환율','일물일가의 법칙']::text[] WHERE id = 270;  -- 빅맥지수
UPDATE public.words SET word = '빈일자리율', meaning = '전체 일자리 중 비어 있거나 한 달 안에 채용될 자리의 비율', hint = 'ㅂㅇㅈㄹㅇ', related_words = ARRAY['베버리지 곡선']::text[] WHERE id = 271;  -- 빈일자리율
UPDATE public.words SET word = '사이드카', meaning = '선물 가격이 급등락하면 프로그램 매매를 5분간 멈추는 증시 안전장치', hint = 'ㅅㅇㄷㅋ', related_words = ARRAY['서킷브레이커']::text[] WHERE id = 272;  -- 사이드카
UPDATE public.words SET word = '사이버리스크', meaning = '해킹·시스템 장애 등 사이버 사고로 기업이 손실을 입을 위험', hint = 'ㅅㅇㅂㄹㅅㅋ', related_words = '{}'::text[] WHERE id = 273;  -- 사이버리스크
UPDATE public.words SET word = '사전적 정책방향 제시 (Forward Guidance)', meaning = '중앙은행이 앞으로의 정책금리 방향을 미리 알려 주는 것', hint = 'ㅅㅈㅈㅈㅊㅂㅎㅈㅅ', related_words = ARRAY['양적완화정책','제로금리정책','통화정책 커뮤니케이션']::text[] WHERE id = 274;  -- 사전적 정책방향 제시 (Forward Guidance)
UPDATE public.words SET word = '사회보장제도', meaning = '국민이 어려움을 겪어도 최소한의 인간다운 생활을 국가가 보장하는 제도', hint = 'ㅅㅎㅂㅈㅈㄷ', related_words = ARRAY['사회보험','상대적 빈곤율']::text[] WHERE id = 275;  -- 사회보장제도
UPDATE public.words SET word = '사회보험', meaning = '건강보험·국민연금처럼 사회적 위험에 대비해 국가가 운영하는 보험', hint = 'ㅅㅎㅂㅎ', related_words = ARRAY['사회보장제도']::text[] WHERE id = 276;  -- 사회보험
UPDATE public.words SET word = '산업연관표(I/O Tables)', meaning = '한 나라 산업들이 서로 무엇을 사고파는지 한눈에 정리한 종합 통계표', hint = 'ㅅㅇㅇㄱㅍ', related_words = ARRAY['고용유발효과/취업유발효과','생산유발효과']::text[] WHERE id = 277;  -- 산업연관표(I/O Tables)
UPDATE public.words SET word = '삼불원칙', meaning = '고정환율·자유로운 자본이동·독자적 통화정책 셋을 동시에 가질 수 없다는 원칙', hint = 'ㅅㅂㅇㅊ', related_words = ARRAY['고정환율제도','자유변동환율제도']::text[] WHERE id = 278;  -- 삼불원칙
UPDATE public.words SET word = '상계관세', meaning = '수출국 정부의 보조금을 받아 싸게 들어온 수입품에 맞서 매기는 관세', hint = 'ㅅㄱㄱㅅ', related_words = ARRAY['긴급수입제한조치']::text[] WHERE id = 279;  -- 상계관세
UPDATE public.words SET word = '상장지수펀드(ETF)', meaning = '주가지수 등을 따라가는 인덱스펀드를 주식처럼 거래소에서 사고팔게 한 상품', hint = 'ㅅㅈㅈㅅㅍㄷ', related_words = '{}'::text[] WHERE id = 280;  -- 상장지수펀드(ETF)
UPDATE public.words SET word = '수출입물가지수', meaning = '수출품과 수입품의 가격 변동을 재는 물가지수', hint = 'ㅅㅊㅇㅁㄱㅈㅅ', related_words = ARRAY['수출입물량지수']::text[] WHERE id = 322;  -- 수출입물가지수
UPDATE public.words SET word = '수출입물량지수', meaning = '가격 변동을 걷어내고 수출입 물량이 얼마나 늘고 줄었는지 보는 지수', hint = 'ㅅㅊㅇㅁㄹㅈㅅ', related_words = ARRAY['수출입물가지수']::text[] WHERE id = 323;  -- 수출입물량지수
UPDATE public.words SET word = '수확체감의 법칙', meaning = '다른 요소는 그대로 두고 노동만 늘리면 추가 생산량이 점점 줄어든다는 법칙', hint = 'ㅅㅎㅊㄱㅇㅂㅊ', related_words = ARRAY['한계비용']::text[] WHERE id = 324;  -- 수확체감의 법칙
UPDATE public.words SET word = '순상품교역조건지수', meaning = '수출 1단위로 수입할 수 있는 상품의 양이 기준시점보다 얼마나 변했는지 보는 지수', hint = 'ㅅㅅㅍㄱㅇㅈㄱㅈㅅ', related_words = ARRAY['무역지수','수출입물가지수']::text[] WHERE id = 325;  -- 순상품교역조건지수
UPDATE public.words SET word = '순안정자금조달비율', meaning = '은행이 1년 이상 안정적인 자금으로 장기 자산을 얼마나 뒷받침하는지 보는 비율', hint = 'ㅅㅇㅈㅈㄱㅈㄷㅂㅇ', related_words = ARRAY['유동성리스크']::text[] WHERE id = 326;  -- 순안정자금조달비율
UPDATE public.words SET word = '순이자마진(NIM)', meaning = '은행이 굴린 자산에서 조달 비용을 빼고 얼마나 이자 이익을 남겼는지 보는 비율', hint = 'ㅅㅇㅈㅁㅈ', related_words = ARRAY['예대금리차(예대마진)']::text[] WHERE id = 327;  -- 순이자마진(NIM)
UPDATE public.words SET word = '순이체한도제', meaning = '은행 간 차액결제에서 각 은행이 보낼 수 있는 순이체액에 상한을 두는 제도', hint = 'ㅅㅇㅊㅎㄷㅈ', related_words = ARRAY['결제리스크','차액결제시스템']::text[] WHERE id = 328;  -- 순이체한도제
UPDATE public.words SET word = '숨은 그림(은화)', meaning = '지폐를 빛에 비추면 여백에 나타나는 위조방지용 숨은 문양', hint = 'ㅅㅇㄱㄹ', related_words = ARRAY['은선']::text[] WHERE id = 329;  -- 숨은 그림(은화)
