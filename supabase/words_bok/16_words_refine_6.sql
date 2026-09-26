-- ===== 콘텐츠 정제 6/36 (refine.py 생성 — 손으로 고치지 말고 meanings.py를 고친 뒤 다시 실행) =====
-- 뜻 전면 재작성·슬래시 항목 분리(신규 31행)·힌트 기본형 초성·related_words 정리·본문 줄이음 자국 제거.
-- 적용 순서: 16_words_refine_1..N -> 17_courses.sql

UPDATE public.words SET word = '글로벌 공급망 압력 지수', meaning = '세계 무역·물류 데이터로 공급망이 얼마나 막혀 있는지 보여주는 지수', hint = 'ㄱㄹㅂㄱㄱㅁㅇㄹㅈㅅ', related_words = ARRAY['인플레이션','경기']::text[] WHERE id = 101;  -- 글로벌 공급망 압력 지수
UPDATE public.words SET word = '글로벌 금융위기', meaning = '2008년 미국에서 시작돼 전 세계 금융시스템을 뒤흔든 위기', hint = 'ㄱㄹㅂㄱㅇㅇㄱ', related_words = ARRAY['주택저당채권(MBS)','양적 완화']::text[] WHERE id = 102;  -- 글로벌 금융위기
UPDATE public.words SET word = '글로벌금융안전망', meaning = '외화가 부족해진 나라가 유동성을 지원받을 수 있는 국제 안전장치 전체', hint = 'ㄱㄹㅂㄱㅇㅇㅈㅁ', related_words = ARRAY['외환보유액','지역금융협정','치앙마이 이니셔티브(CMI)']::text[] WHERE id = 103;  -- 글로벌금융안전망
UPDATE public.words SET word = '금리선물', meaning = '미래 특정 시점의 금리를 지금 정한 가격으로 사고파는 계약', hint = 'ㄱㄹㅅㅁ', related_words = '{}'::text[] WHERE id = 104;  -- 금리선물
UPDATE public.words SET word = '금리스왑', meaning = '원금 교환 없이 고정금리와 변동금리 이자를 서로 바꾸는 거래', hint = 'ㄱㄹㅅㅇ', related_words = '{}'::text[] WHERE id = 105;  -- 금리스왑
UPDATE public.words SET word = '금리자유화', meaning = '정부 규제를 없애 금리가 시장의 자금 수급에 따라 정해지게 하는 조치', hint = 'ㄱㄹㅈㅇㅎ', related_words = '{}'::text[] WHERE id = 106;  -- 금리자유화
UPDATE public.words SET word = '금리평가이론', meaning = '두 나라의 금리 차이만큼 선물환 프리미엄이 결정된다는 이론', hint = 'ㄱㄹㅍㄱㅇㄹ', related_words = ARRAY['스왑레이트']::text[] WHERE id = 107;  -- 금리평가이론
UPDATE public.words SET word = '금본위제', meaning = '통화 가치를 일정량의 금에 고정하고 금과 바꿔 주는 화폐 제도', hint = 'ㄱㅂㅇㅈ', related_words = ARRAY['고정환율제도','자유변동환율제도']::text[] WHERE id = 108;  -- 금본위제
UPDATE public.words SET word = '금산분리', meaning = '산업자본(대기업)이 은행 등 금융회사를 소유하지 못하게 막는 원칙', hint = 'ㄱㅅㅂㄹ', related_words = '{}'::text[] WHERE id = 109;  -- 금산분리
UPDATE public.words SET word = '금융 하부구조', meaning = '지급결제·신용평가 시스템처럼 금융거래를 뒷받침하는 제도와 기관', hint = 'ㄱㅇㅎㅂㄱㅈ', related_words = '{}'::text[] WHERE id = 110;  -- 금융 하부구조
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
