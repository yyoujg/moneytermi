-- ===== 콘텐츠 정제 2/15 (refine.py 생성 — 손으로 고치지 말고 meanings.py를 고친 뒤 다시 실행) =====
-- 라이브 덤프와 비교해 아직 적용되지 않은 행만. 단문 UPDATE 294행, 본문 UPDATE 64행.
-- 적용 순서: 16_words_refine_1..N -> 17_courses.sql

UPDATE public.words SET word = '국고전산망', meaning = '정부·한국은행·은행을 연결해 나랏돈 업무를 전자적으로 처리하는 망', hint = 'ㄱㄱㅈㅅㅁ', related_words = ARRAY['국고금 실시간 전자이체']::text[] WHERE id = 67;  -- 국고전산망
UPDATE public.words SET word = '국내공급물가지수', meaning = '생산자물가와 수입물가를 합쳐 국내에 공급되는 물건의 가격 수준을 본 지수', hint = 'ㄱㄴㄱㄱㅁㄱㅈㅅ', related_words = ARRAY['생산자물가지수(PPI)','수출입물가지수']::text[] WHERE id = 68;  -- 국내공급물가지수
UPDATE public.words SET word = '국내총생산(GDP)', meaning = '한 나라 안에서 일정 기간 새로 만들어 낸 부가가치를 모두 더한 값', hint = 'ㄱㄴㅊㅅㅅ', related_words = ARRAY['국민총소득(GNI)']::text[] WHERE id = 69;  -- 국내총생산(GDP)
UPDATE public.words SET word = '국내총투자율', meaning = '나라 전체 처분가능소득 중 공장·설비·재고 등 투자에 쓰인 비율', hint = 'ㄱㄴㅊㅌㅈㅇ', related_words = ARRAY['국민총처분가능소득']::text[] WHERE id = 70;  -- 국내총투자율
UPDATE public.words SET word = '금융공황', meaning = '한 은행의 예금인출 사태가 다른 은행으로 번져 금융시장 전체가 마비되는 현상', hint = 'ㄱㅇㄱㅎ', related_words = ARRAY['뱅크런','연방준비제도(FRS)/연방준비은행(FRB)']::text[] WHERE id = 111;  -- 금융공황
UPDATE public.words SET word = '금융불안지수(FSI)', meaning = '금융시장이 얼마나 불안한지 빠르게 판단하기 위한 조기경보 지수', hint = 'ㄱㅇㅂㅇㅈㅅ', related_words = ARRAY['금융취약성지수(FVI)']::text[] WHERE id = 112;  -- 금융불안지수(FSI)
UPDATE public.words SET word = '금융사이클', meaning = '신용과 자산가격이 함께 부풀었다 꺼지기를 반복하는 금융의 순환', hint = 'ㄱㅇㅅㅇㅋ', related_words = '{}'::text[] WHERE id = 113;  -- 금융사이클
UPDATE public.words SET word = '금융상황지수(FCI)', meaning = '금리·환율·주가 등을 묶어 금융여건이 완화적인지 긴축적인지 보는 지수', hint = 'ㄱㅇㅅㅎㅈㅅ', related_words = '{}'::text[] WHERE id = 114;  -- 금융상황지수(FCI)
UPDATE public.words SET word = '금융시스템 상호연계성', meaning = '금융회사들이 거래로 서로 얽혀 있어 한 곳의 위기가 번질 수 있는 정도', hint = 'ㄱㅇㅅㅅㅌㅅㅎㅇㄱㅅ', related_words = ARRAY['시스템 리스크']::text[] WHERE id = 115;  -- 금융시스템 상호연계성
UPDATE public.words SET word = '금융시장인프라', meaning = '지급·청산·결제·기록을 가능하게 하는 시스템과 기관의 총칭', hint = 'ㄱㅇㅅㅈㅇㅍㄹ', related_words = ARRAY['지급결제시스템','증권결제시스템']::text[] WHERE id = 116;  -- 금융시장인프라
UPDATE public.words SET word = '금융안정', meaning = '금융회사·시장·인프라가 제 기능을 해 금융시스템이 원활히 돌아가는 상태', hint = 'ㄱㅇㅇㅈ', related_words = ARRAY['시스템 리스크']::text[] WHERE id = 117;  -- 금융안정
UPDATE public.words SET word = '금융안정위원회(FSB)', meaning = '주요국 금융당국이 모여 국제 금융시스템 안정을 논의하는 기구', hint = 'ㄱㅇㅇㅈㅇㅇㅎ', related_words = '{}'::text[] WHERE id = 118;  -- 금융안정위원회(FSB)
UPDATE public.words SET word = '금융연관비율(골드스미스비율)', meaning = '한 나라의 금융자산이 실물자산의 몇 배인지 나타내는 비율', hint = 'ㄱㅇㅇㄱㅂㅇ', related_words = '{}'::text[] WHERE id = 119;  -- 금융연관비율(골드스미스비율)
UPDATE public.words SET word = '금융의 증권화', meaning = '대출채권처럼 팔기 어려운 자산을 증권으로 바꿔 거래할 수 있게 하는 것', hint = 'ㄱㅇㅇㅈㄱㅎ', related_words = '{}'::text[] WHERE id = 120;  -- 금융의 증권화
UPDATE public.words SET word = '금융의 탈중개화', meaning = '은행 같은 중개기관 없이 당사자끼리 직접 금융거래를 하는 현상', hint = 'ㄱㅇㅇㅌㅈㄱㅎ', related_words = ARRAY['핀테크','금융의 탈집중화','블록체인','P2P대출']::text[] WHERE id = 121;  -- 금융의 탈중개화
UPDATE public.words SET word = '금융의 탈집중화', meaning = '핀테크 진입으로 금융 서비스가 분야별로 잘게 쪼개지는 현상', hint = 'ㄱㅇㅇㅌㅈㅈㅎ', related_words = ARRAY['핀테크','P2P대출','블록체인']::text[] WHERE id = 122;  -- 금융의 탈집중화
UPDATE public.words SET word = '금융이해력', meaning = '돈을 잘 관리하고 합리적인 금융 결정을 내리는 데 필요한 지식과 태도', hint = 'ㄱㅇㅇㅎㄹ', related_words = ARRAY['금융 지식','금융 행위','금융 태도','디지털 금융이해력']::text[] WHERE id = 123;  -- 금융이해력
UPDATE public.words SET word = '금융제도', meaning = '금융시장·금융기관·금융 하부구조를 아우르는 금융거래의 체계와 규범', hint = 'ㄱㅇㅈㄷ', related_words = '{}'::text[] WHERE id = 124;  -- 금융제도
UPDATE public.words SET word = '금융중개지원대출제도', meaning = '중소기업 대출을 많이 한 은행에 한국은행이 싼 이자로 자금을 대주는 제도', hint = 'ㄱㅇㅈㄱㅈㅇㄷㅊㅈㄷ', related_words = '{}'::text[] WHERE id = 125;  -- 금융중개지원대출제도
UPDATE public.words SET word = '금융지주회사', meaning = '은행·증권·보험 자회사의 지분을 보유해 그룹을 경영하는 모회사', hint = 'ㄱㅇㅈㅈㅎㅅ', related_words = '{}'::text[] WHERE id = 126;  -- 금융지주회사
UPDATE public.words SET word = '금융채', meaning = '은행·카드사 등 금융기관이 장기 자금을 마련하려고 발행하는 채권', hint = 'ㄱㅇㅊ', related_words = ARRAY['자금조달비용지수(COFIX)']::text[] WHERE id = 127;  -- 금융채
UPDATE public.words SET word = '금융취약성지수(FVI)', meaning = '자산가격 과열과 빚 누적 등 금융시스템에 쌓인 약점을 재는 지수', hint = 'ㄱㅇㅊㅇㅅㅈㅅ', related_words = ARRAY['금융불안지수(FSI)']::text[] WHERE id = 128;  -- 금융취약성지수(FVI)
UPDATE public.words SET word = '금융통화위원회', meaning = '기준금리 등 통화정책을 결정하는 한국은행의 최고 의사결정기구', hint = 'ㄱㅇㅌㅎㅇㅇㅎ', related_words = ARRAY['한국은행']::text[] WHERE id = 129;  -- 금융통화위원회
UPDATE public.words SET word = '금전신탁', meaning = '돈을 맡기면 전문가가 대출·채권 등에 굴려 수익을 돌려주는 신탁', hint = 'ㄱㅈㅅㅌ', related_words = '{}'::text[] WHERE id = 130;  -- 금전신탁
UPDATE public.words SET word = '기념화폐', meaning = '국가 행사나 역사적 사건을 기념해 특별히 발행하는 수집용 화폐', hint = 'ㄱㄴㅎㅍ', related_words = ARRAY['화폐 발행','화폐의 액면체계']::text[] WHERE id = 131;  -- 기념화폐
