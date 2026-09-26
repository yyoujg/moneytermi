-- ===== 콘텐츠 정제 21/36 (refine.py 생성 — 손으로 고치지 말고 meanings.py를 고친 뒤 다시 실행) =====
-- 뜻 전면 재작성·슬래시 항목 분리(신규 31행)·힌트 기본형 초성·related_words 정리·본문 줄이음 자국 제거.
-- 적용 순서: 16_words_refine_1..N -> 17_courses.sql

UPDATE public.words SET word = '자연독점', meaning = '규모의 경제 때문에 한 기업만 남게 되는 자연스러운 독점(전기·수도)', hint = 'ㅈㅇㄷㅈ', related_words = ARRAY['규모의 경제']::text[] WHERE id = 476;  -- 자연독점
UPDATE public.words SET word = '자연실업률', meaning = '물가를 자극하지 않으면서 유지할 수 있는 가장 낮은 실업률', hint = 'ㅈㅇㅅㅇㄹ', related_words = ARRAY['실업률갭','필립스곡선']::text[] WHERE id = 477;  -- 자연실업률
UPDATE public.words SET word = '자원민족주의', meaning = '자원 보유국이 석유·광물 통제를 강화해 영향력을 키우려는 경향', hint = 'ㅈㅇㅁㅈㅈㅇ', related_words = '{}'::text[] WHERE id = 478;  -- 자원민족주의
UPDATE public.words SET word = '자유무역협정(FTA)', meaning = '협정을 맺은 나라끼리 관세와 무역장벽을 없애는 협정', hint = 'ㅈㅇㅁㅇㅎㅈ', related_words = ARRAY['상계관세']::text[] WHERE id = 479;  -- 자유무역협정(FTA)
UPDATE public.words SET word = '자유재', meaning = '공기처럼 대가 없이 얼마든지 얻을 수 있는 재화', hint = 'ㅈㅇㅈ', related_words = ARRAY['기펜재']::text[] WHERE id = 480;  -- 자유재
UPDATE public.words SET word = '작업증명', meaning = '컴퓨터 연산 작업을 수행했음을 증명해 블록체인 거래를 검증하는 방식(채굴)', hint = 'ㅈㅇㅈㅁ', related_words = ARRAY['비트코인']::text[] WHERE id = 481;  -- 작업증명
UPDATE public.words SET word = '잠재GDP성장률', meaning = '노동·자본을 최대로 활용했을 때 달성 가능한 경제의 최대 성장률', hint = 'ㅈㅈGㅅㅈㄹ', related_words = ARRAY['GDP갭']::text[] WHERE id = 482;  -- 잠재GDP성장률
UPDATE public.words SET word = '잠재경제활동인구', meaning = '지금은 비경제활동인구지만 사실상 구직자로 볼 수 있는 잠재 취업자·구직자', hint = 'ㅈㅈㄱㅈㅎㄷㅇㄱ', related_words = ARRAY['경제활동인구/비경제활동인구/경제활동참가율']::text[] WHERE id = 483;  -- 잠재경제활동인구
UPDATE public.words SET word = '장기금융시장(자본시장)', meaning = '1년 이상 장기 채권과 주식이 거래되는 시장', hint = 'ㅈㄱㄱㅇㅅㅈ', related_words = ARRAY['단기금융시장']::text[] WHERE id = 484;  -- 장기금융시장(자본시장)
UPDATE public.words SET word = '장기침체', meaning = '투자 부족과 수요 부족으로 경제가 오랫동안 저성장에 머무는 상태', hint = 'ㅈㄱㅊㅊ', related_words = ARRAY['경기조절정책(경제안정화정책)','골디락스경제','대안정기']::text[] WHERE id = 485;  -- 장기침체
UPDATE public.words SET word = '장내시장', meaning = '한국거래소처럼 표준화된 규칙에 따라 거래하는 조직화된 시장', hint = 'ㅈㄴㅅㅈ', related_words = ARRAY['장외시장']::text[] WHERE id = 486;  -- 장내시장
UPDATE public.words SET word = '장단기금리차', meaning = '장기금리와 단기금리의 차이(경기 전망 지표)', hint = 'ㅈㄷㄱㄱㄹㅊ', related_words = ARRAY['기준금리']::text[] WHERE id = 487;  -- 장단기금리차
UPDATE public.words SET word = '장외시장', meaning = '거래소 밖에서 중개기관을 통해 개별적으로 거래하는 시장', hint = 'ㅈㅇㅅㅈ', related_words = ARRAY['장내시장']::text[] WHERE id = 488;  -- 장외시장
UPDATE public.words SET word = '재산소득', meaning = '금융자산이나 토지를 빌려주고 받는 이자·배당·임대료 소득', hint = 'ㅈㅅㅅㄷ', related_words = ARRAY['본원소득']::text[] WHERE id = 489;  -- 재산소득
UPDATE public.words SET word = '재정수지', meaning = '정부 수입과 지출의 차이', hint = 'ㅈㅈㅅㅈ', related_words = ARRAY['국채']::text[] WHERE id = 490;  -- 재정수지
UPDATE public.words SET word = '재정정책', meaning = '정부가 지출과 세금을 조절해 경기와 총수요를 관리하는 정책', hint = 'ㅈㅈㅈㅊ', related_words = ARRAY['경기조절정책(경제안정화정책)','통화정책']::text[] WHERE id = 491;  -- 재정정책
UPDATE public.words SET word = '재정환율', meaning = '직접 거래 시장이 없는 통화의 환율을 달러 환율을 거쳐 계산한 것(원/엔)', hint = 'ㅈㅈㅎㅇ', related_words = ARRAY['기준환율']::text[] WHERE id = 492;  -- 재정환율
UPDATE public.words SET word = '전방연쇄효과', meaning = '한 산업의 생산 증가가 그 제품을 원재료로 쓰는 산업에 미치는 파급 효과', hint = 'ㅈㅂㅇㅅㅎㄱ', related_words = ARRAY['생산유발효과','후방연쇄효과']::text[] WHERE id = 493;  -- 전방연쇄효과
UPDATE public.words SET word = '전산업생산지수', meaning = '광공업과 서비스업을 합쳐 나라 전체 생산 흐름을 월별로 나타낸 지수', hint = 'ㅈㅅㅇㅅㅅㅈㅅ', related_words = ARRAY['동행종합지수','제조업생산능력지수','제조업가동률지수']::text[] WHERE id = 494;  -- 전산업생산지수
UPDATE public.words SET word = '전세가율', meaning = '집값 대비 전세 보증금의 비율', hint = 'ㅈㅅㄱㅇ', related_words = ARRAY['역전세']::text[] WHERE id = 495;  -- 전세가율
UPDATE public.words SET word = '전월세 전환율', meaning = '전세 보증금을 월세로 바꿀 때 적용하는 연이율', hint = 'ㅈㅇㅅㅈㅎㅇ', related_words = '{}'::text[] WHERE id = 496;  -- 전월세 전환율
UPDATE public.words SET word = '전자금융', meaning = '컴퓨터·통신 기술로 금융 업무를 자동화·전자화한 것', hint = 'ㅈㅈㄱㅇ', related_words = ARRAY['금융EDI','핀테크']::text[] WHERE id = 497;  -- 전자금융
UPDATE public.words SET word = '전자금융공동망', meaning = '인터넷·모바일뱅킹 거래를 은행 사이에서 중계하는 공동 전산망', hint = 'ㅈㅈㄱㅇㄱㄷㅁ', related_words = ARRAY['소액지급시스템']::text[] WHERE id = 498;  -- 전자금융공동망
UPDATE public.words SET word = '전자단기사채', meaning = '실물 없이 전자 등록으로 발행·유통되는 단기 회사채(기업어음 대체)', hint = 'ㅈㅈㄷㄱㅅㅊ', related_words = ARRAY['기업어음(CP)']::text[] WHERE id = 499;  -- 전자단기사채
UPDATE public.words SET word = '전자상거래', meaning = '인터넷에서 주문·결제까지 하는 상거래', hint = 'ㅈㅈㅅㄱㄹ', related_words = ARRAY['전자서명','전자화폐']::text[] WHERE id = 500;  -- 전자상거래
