-- ===== 콘텐츠 정제 27/36 (refine.py 생성 — 손으로 고치지 말고 meanings.py를 고친 뒤 다시 실행) =====
-- 뜻 전면 재작성·슬래시 항목 분리(신규 31행)·힌트 기본형 초성·related_words 정리·본문 줄이음 자국 제거.
-- 적용 순서: 16_words_refine_1..N -> 17_courses.sql

UPDATE public.words SET word = '특수목적기구(SPV)', meaning = '자산유동화증권을 발행하려고 자산을 넘겨받는 서류상 회사', hint = 'ㅌㅅㅁㅈㄱㄱ', related_words = ARRAY['자산유동화']::text[] WHERE id = 626;  -- 특수목적기구(SPV)
UPDATE public.words SET word = '파레토최적', meaning = '누군가의 효용을 줄이지 않고는 다른 사람의 효용을 늘릴 수 없는 최적 상태', hint = 'ㅍㄹㅌㅊㅈ', related_words = ARRAY['한계비용','한계효용']::text[] WHERE id = 627;  -- 파레토최적
UPDATE public.words SET word = '파생금융상품', meaning = '통화·채권·주식 등 기초자산 가치에 따라 값이 정해지는 선물·옵션·스왑 상품', hint = 'ㅍㅅㄱㅇㅅㅍ', related_words = ARRAY['옵션','스왑']::text[] WHERE id = 628;  -- 파생금융상품
UPDATE public.words SET word = '페더럴펀드', meaning = '미국 은행들이 지급준비금 과부족을 조절하려고 서로 빌리는 초단기 자금', hint = 'ㅍㄷㄹㅍㄷ', related_words = '{}'::text[] WHERE id = 629;  -- 페더럴펀드
UPDATE public.words SET word = '평잔', meaning = '일정 기간 매일 잔액의 평균', hint = 'ㅍㅈ', related_words = ARRAY['말잔']::text[] WHERE id = 630;  -- 평잔/말잔
UPDATE public.words SET word = '표면금리', meaning = '채권 액면가에 대해 1년에 지급하기로 표시된 이자율', hint = 'ㅍㅁㄱㄹ', related_words = '{}'::text[] WHERE id = 631;  -- 표면금리
UPDATE public.words SET word = '풋옵션', meaning = '미리 정한 가격에 기초자산을 팔 수 있는 권리', hint = 'ㅍㅇㅅ', related_words = ARRAY['콜옵션']::text[] WHERE id = 632;  -- 풋옵션
UPDATE public.words SET word = '프로그램매매', meaning = '컴퓨터 프로그램으로 여러 종목을 한꺼번에 사고파는 매매 기법', hint = 'ㅍㄹㄱㄹㅁㅁ', related_words = '{}'::text[] WHERE id = 633;  -- 프로그램매매
UPDATE public.words SET word = '프로젝트 파이낸싱', meaning = '사업 자체의 미래 수익을 담보로 대규모 개발 자금을 조달하는 금융', hint = 'ㅍㄹㅈㅌㅍㅇㄴㅅ', related_words = '{}'::text[] WHERE id = 634;  -- 프로젝트 파이낸싱
UPDATE public.words SET word = '프로젝트 한강', meaning = '한국은행이 중앙은행 디지털화폐와 예금토큰을 실제로 시험하는 사업', hint = 'ㅍㄹㅈㅌㅎㄱ', related_words = ARRAY['중앙은행 디지털화폐(CBDC)','예금토큰']::text[] WHERE id = 635;  -- 프로젝트 한강
UPDATE public.words SET word = '플라자 합의', meaning = '1985년 주요 5개국이 달러 가치를 낮추기로 한 뉴욕 플라자호텔 합의', hint = 'ㅍㄹㅈㅎㅇ', related_words = '{}'::text[] WHERE id = 636;  -- 플라자 합의
UPDATE public.words SET word = '플랫폼 노동자', meaning = '배달앱처럼 온라인 플랫폼을 통해 일감을 받아 일하는 사람', hint = 'ㅍㄹㅍㄴㄷㅈ', related_words = '{}'::text[] WHERE id = 637;  -- 플랫폼 노동자
UPDATE public.words SET word = '피셔효과', meaning = '기대 인플레이션이 오르면 명목금리도 그만큼 오른다는 이론', hint = 'ㅍㅅㅎㄱ', related_words = ARRAY['기대인플레이션']::text[] WHERE id = 638;  -- 피셔효과
UPDATE public.words SET word = '피용자보수', meaning = '노동을 제공한 대가로 받는 임금·급여 등 근로자 몫의 소득', hint = 'ㅍㅇㅈㅂㅅ', related_words = ARRAY['피용자보수비율','영업잉여']::text[] WHERE id = 639;  -- 피용자보수
UPDATE public.words SET word = '피용자보수비율', meaning = '국민소득 중 근로자에게 돌아간 임금 몫의 비율(노동소득분배율)', hint = 'ㅍㅇㅈㅂㅅㅂㅇ', related_words = ARRAY['피용자보수','영업잉여']::text[] WHERE id = 640;  -- 피용자보수비율
UPDATE public.words SET word = '핀테크', meaning = '디지털 기술로 금융 서비스를 혁신하는 것(금융+기술)', hint = 'ㅍㅌㅋ', related_words = ARRAY['블록체인','분산원장기술','전자화폐','가상통화']::text[] WHERE id = 641;  -- 핀테크
UPDATE public.words SET word = '필립스곡선', meaning = '실업률이 낮으면 물가상승률이 높아진다는 둘 사이의 반비례 관계 곡선', hint = 'ㅍㄹㅅㄱㅅ', related_words = ARRAY['실업률갭','자연실업률']::text[] WHERE id = 642;  -- 필립스곡선
UPDATE public.words SET word = '한계비용', meaning = '제품을 한 단위 더 만들 때 추가로 드는 비용', hint = 'ㅎㄱㅂㅇ', related_words = ARRAY['수확체감의 법칙','한계효용']::text[] WHERE id = 643;  -- 한계비용
UPDATE public.words SET word = '한계소비성향', meaning = '소득이 1만큼 늘 때 그중 소비로 쓰는 비율', hint = 'ㅎㄱㅅㅂㅅㅎ', related_words = ARRAY['소비의 비가역성']::text[] WHERE id = 644;  -- 한계소비성향
UPDATE public.words SET word = '한계효용', meaning = '재화를 한 단위 더 소비할 때 추가로 얻는 만족', hint = 'ㅎㄱㅎㅇ', related_words = ARRAY['파레토최적','한계비용']::text[] WHERE id = 645;  -- 한계효용
UPDATE public.words SET word = '한국은행', meaning = '1950년 설립된 우리나라의 중앙은행', hint = 'ㅎㄱㅇㅎ', related_words = ARRAY['중앙은행','금융안정','물가안정목표제']::text[] WHERE id = 646;  -- 한국은행
UPDATE public.words SET word = '한시적 근로자', meaning = '계약 기간이 정해져 있는 기간제·계약직 근로자', hint = 'ㅎㅅㅈㄱㄹㅈ', related_words = ARRAY['정규직','비정규직']::text[] WHERE id = 647;  -- 한시적 근로자
UPDATE public.words SET word = '한은금융망(BOK-Wire+)', meaning = '금융기관 간 거액 원화 자금을 이체하는 한국은행의 거액결제시스템', hint = 'ㅎㅇㄱㅇㅁ', related_words = ARRAY['거액지급시스템','총액결제시스템','혼합형결제시스템']::text[] WHERE id = 648;  -- 한은금융망(BOK-Wire+)
UPDATE public.words SET word = '할당관세제도', meaning = '정해진 수량까지는 낮은 관세, 넘으면 높은 관세를 매기는 제도', hint = 'ㅎㄷㄱㅅㅈㄷ', related_words = ARRAY['상계관세']::text[] WHERE id = 649;  -- 할당관세제도
UPDATE public.words SET word = '합계출산율', meaning = '여성 한 명이 평생 낳을 것으로 예상되는 평균 자녀 수', hint = 'ㅎㄱㅊㅅㅇ', related_words = ARRAY['인구고령화']::text[] WHERE id = 650;  -- 합계출산율
