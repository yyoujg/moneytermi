-- ===== 콘텐츠 정제 12/36 (refine.py 생성 — 손으로 고치지 말고 meanings.py를 고친 뒤 다시 실행) =====
-- 뜻 전면 재작성·슬래시 항목 분리(신규 31행)·힌트 기본형 초성·related_words 정리·본문 줄이음 자국 제거.
-- 적용 순서: 16_words_refine_1..N -> 17_courses.sql

UPDATE public.words SET word = '부가가치유발계수', meaning = '최종수요가 한 단위 생기면 나라 전체에 부가가치가 얼마나 만들어지는지 나타낸 계수', hint = 'ㅂㄱㄱㅊㅇㅂㄱㅅ', related_words = ARRAY['생산유발효과']::text[] WHERE id = 251;  -- 부가가치유발계수/부가가치계수
UPDATE public.words SET word = '부동화', meaning = '실물 증권을 예탁기관에 모아 두고 장부상 계좌이체로만 거래하는 것', hint = 'ㅂㄷㅎ', related_words = ARRAY['중앙예탁기관','무권화']::text[] WHERE id = 252;  -- 부동화/무권화
UPDATE public.words SET word = '부실채권(NPL)', meaning = '빌려 간 쪽 사정이 나빠져 돌려받기 어려워진 대출(고정 이하 여신)', hint = 'ㅂㅅㅊㄱ', related_words = '{}'::text[] WHERE id = 253;  -- 부실채권(NPL)
UPDATE public.words SET word = '부채담보부증권(CDO)', meaning = '회사채·대출채권을 묶어 신용등급별로 여러 층으로 쪼개 발행한 증권', hint = 'ㅂㅊㄷㅂㅂㅈㄱ', related_words = ARRAY['CMO']::text[] WHERE id = 254;  -- 부채담보부증권(CDO)
UPDATE public.words SET word = '부채비율', meaning = '부채를 자기자본으로 나눈 값으로 재무구조가 얼마나 건전한지 보는 비율', hint = 'ㅂㅊㅂㅇ', related_words = '{}'::text[] WHERE id = 255;  -- 부채비율
UPDATE public.words SET word = '분리결제', meaning = '증권 인도와 대금 지급을 동시에 하지 않고 따로따로 하는 결제 방식', hint = 'ㅂㄹㄱㅈ', related_words = ARRAY['증권대금동시결제(DVP)']::text[] WHERE id = 256;  -- 분리결제
UPDATE public.words SET word = '분산원장기술', meaning = '거래 장부를 중앙 서버가 아닌 참여자들이 나눠 갖고 함께 기록하는 기술', hint = 'ㅂㅅㅇㅈㄱㅅ', related_words = ARRAY['P2P대출','블록체인','비트코인','가상자산']::text[] WHERE id = 257;  -- 분산원장기술
UPDATE public.words SET word = '분수효과', meaning = '저소득층 소득을 먼저 늘리면 소비가 살아나 경제 전체가 좋아진다는 주장', hint = 'ㅂㅅㅎㄱ', related_words = ARRAY['낙수효과']::text[] WHERE id = 258;  -- 분수효과
UPDATE public.words SET word = '불완전경쟁시장', meaning = '독점·과점처럼 소수 기업이 가격에 영향을 줄 수 있는 시장', hint = 'ㅂㅇㅈㄱㅈㅅㅈ', related_words = ARRAY['독점/과점','자연독점']::text[] WHERE id = 259;  -- 불완전경쟁시장
UPDATE public.words SET word = '불태화정책', meaning = '외화 유입으로 늘어난 돈을 중앙은행이 채권 매각 등으로 다시 거둬들이는 정책', hint = 'ㅂㅌㅎㅈㅊ', related_words = ARRAY['외환시장','스무딩오퍼레이션']::text[] WHERE id = 260;  -- 불태화정책
UPDATE public.words SET word = '브레튼우즈체제', meaning = '1944년 미국 달러를 금에 고정하고 각국 통화를 달러에 연동한 국제통화체제', hint = 'ㅂㄹㅌㅇㅈㅊㅈ', related_words = ARRAY['국제통화기금(IMF)','금본위제','고정환율제도','자유변동환율제도']::text[] WHERE id = 261;  -- 브레튼우즈체제
UPDATE public.words SET word = '브렉시트(Brexit)', meaning = '2016년 국민투표로 결정된 영국의 유럽연합 탈퇴', hint = 'ㅂㄹㅅㅌ', related_words = ARRAY['유럽연합(EU)']::text[] WHERE id = 262;  -- 브렉시트(Brexit)
UPDATE public.words SET word = '브릭스(BRICS)', meaning = '브라질·러시아·인도·중국·남아공 등 신흥 경제대국 모임', hint = 'ㅂㄹㅅ', related_words = '{}'::text[] WHERE id = 263;  -- 브릭스(BRICS)
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
