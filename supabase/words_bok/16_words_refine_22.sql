-- ===== 콘텐츠 정제 22/36 (refine.py 생성 — 손으로 고치지 말고 meanings.py를 고친 뒤 다시 실행) =====
-- 뜻 전면 재작성·슬래시 항목 분리(신규 31행)·힌트 기본형 초성·related_words 정리·본문 줄이음 자국 제거.
-- 적용 순서: 16_words_refine_1..N -> 17_courses.sql

UPDATE public.words SET word = '전자서명', meaning = '전자문서의 진위와 작성자를 확인하는 암호화된 서명', hint = 'ㅈㅈㅅㅁ', related_words = ARRAY['전자상거래','전자금융']::text[] WHERE id = 501;  -- 전자서명
UPDATE public.words SET word = '전자어음', meaning = '실물 없이 전자문서로 발행되고 온라인으로 유통되는 약속어음', hint = 'ㅈㅈㅇㅇ', related_words = ARRAY['지급수단']::text[] WHERE id = 502;  -- 전자어음
UPDATE public.words SET word = '전자정보교환제도', meaning = '어음·지로 실물을 옮기지 않고 전산 정보만 주고받아 교환하는 제도', hint = 'ㅈㅈㅈㅂㄱㅎㅈㄷ', related_words = ARRAY['어음교환','전자어음']::text[] WHERE id = 503;  -- 전자정보교환제도
UPDATE public.words SET word = '전자지급결제대행(PG)', meaning = '온라인 쇼핑 결제 대금을 구매자에게 받아 판매자에게 전달하는 대행 서비스', hint = 'ㅈㅈㅈㄱㄱㅈㄷㅎ', related_words = ARRAY['지급결제시스템']::text[] WHERE id = 504;  -- 전자지급결제대행(PG)
UPDATE public.words SET word = '전자화폐', meaning = 'IC카드 등에 금액을 저장해 두고 물건 살 때 쓰는 전자 지급수단', hint = 'ㅈㅈㅎㅍ', related_words = ARRAY['전자상거래','전자금융']::text[] WHERE id = 505;  -- 전자화폐
UPDATE public.words SET word = '전자화폐공동망', meaning = '한국형 전자화폐 사용 시 은행 간 정산을 처리하는 시스템', hint = 'ㅈㅈㅎㅍㄱㄷㅁ', related_words = ARRAY['소액지급시스템','전자화폐']::text[] WHERE id = 506;  -- 전자화폐공동망
UPDATE public.words SET word = '전환사채(CB)', meaning = '나중에 발행회사 주식으로 바꿀 수 있는 권리가 붙은 회사채', hint = 'ㅈㅎㅅㅊ', related_words = ARRAY['신주인수권부사채(BW)']::text[] WHERE id = 507;  -- 전환사채(CB)
UPDATE public.words SET word = '정규직', meaning = '기간을 정하지 않고 직접 계약해 정년까지 보장되는 고용', hint = 'ㅈㄱㅈ', related_words = ARRAY['한시적 근로자','비정규직']::text[] WHERE id = 508;  -- 정규직/비정규직
UPDATE public.words SET word = '정보의 비대칭성', meaning = '거래 당사자 사이에 정보량이 달라 역선택·도덕적 해이가 생기는 상황', hint = 'ㅈㅂㅇㅂㄷㅊㅅ', related_words = ARRAY['도덕적 해이','정부실패']::text[] WHERE id = 509;  -- 정보의 비대칭성
UPDATE public.words SET word = '정부당좌예금계정', meaning = '나랏돈의 모든 수입과 지출을 관리하는 한국은행 내 정부 계좌', hint = 'ㅈㅂㄷㅈㅇㄱㄱㅈ', related_words = ARRAY['국고대리점']::text[] WHERE id = 510;  -- 정부당좌예금계정
UPDATE public.words SET word = '정부실패', meaning = '시장실패를 고치려던 정부 개입이 오히려 자원배분을 나쁘게 만드는 것', hint = 'ㅈㅂㅅㅍ', related_words = '{}'::text[] WHERE id = 511;  -- 정부실패
UPDATE public.words SET word = '정책모기지', meaning = '보금자리론·디딤돌대출처럼 정부가 재정으로 지원하는 저금리 주택 대출', hint = 'ㅈㅊㅁㄱㅈ', related_words = ARRAY['모기지대출']::text[] WHERE id = 512;  -- 정책모기지/주택 정책대출
UPDATE public.words SET word = '정책시차', meaning = '정책 필요가 생긴 뒤 실행되고 효과가 나타나기까지 걸리는 시간', hint = 'ㅈㅊㅅㅊ', related_words = ARRAY['재정정책']::text[] WHERE id = 513;  -- 정책시차
UPDATE public.words SET word = '제1차 통화조치', meaning = '1953년 화폐 단위를 원(圓)에서 환(圜)으로 100대 1로 바꾼 조치', hint = 'ㅈ1ㅊㅌㅎㅈㅊ', related_words = ARRAY['제2차 통화조치']::text[] WHERE id = 514;  -- 제1차 통화조치
UPDATE public.words SET word = '제2차 통화조치', meaning = '1962년 화폐 단위를 환에서 원으로 10대 1로 바꾼 조치', hint = 'ㅈ2ㅊㅌㅎㅈㅊ', related_words = ARRAY['제1차 통화조치']::text[] WHERE id = 515;  -- 제2차 통화조치
UPDATE public.words SET word = '제로금리정책', meaning = '중앙은행이 초단기 금리를 0%에 가깝게 낮추는 통화정책', hint = 'ㅈㄹㄱㄹㅈㅊ', related_words = ARRAY['양적완화정책']::text[] WHERE id = 516;  -- 제로금리정책
UPDATE public.words SET word = '제조업생산능력지수', meaning = '제조업이 최대로 만들 수 있는 공급능력의 변화를 나타낸 지수', hint = 'ㅈㅈㅇㅅㅅㄴㄹㅈㅅ', related_words = ARRAY['제조업평균가동률갭','제조업가동률지수']::text[] WHERE id = 517;  -- 제조업생산능력/가동률지수
UPDATE public.words SET word = '제조업평균가동률갭', meaning = '제조업 가동률이 장기 평균에서 얼마나 벗어났는지 보는 유휴생산력 지표', hint = 'ㅈㅈㅇㅍㄱㄱㄷㄹㄱ', related_words = ARRAY['실업률갭']::text[] WHERE id = 518;  -- 제조업평균가동률갭
UPDATE public.words SET word = '조세부담률', meaning = '세금이 국민총소득에서 차지하는 비중', hint = 'ㅈㅅㅂㄷㄹ', related_words = ARRAY['재정정책']::text[] WHERE id = 519;  -- 조세부담률
UPDATE public.words SET word = '종합금융투자사업자', meaning = '자기자본 3조원 이상 대형 증권사에 기업 대출 등 투자은행 업무를 허용한 제도', hint = 'ㅈㅎㄱㅇㅌㅈㅅㅇㅈ', related_words = '{}'::text[] WHERE id = 520;  -- 종합금융투자사업자
UPDATE public.words SET word = '죄수의 딜레마', meaning = '서로 협력하면 최선인데 각자 이익만 좇다가 둘 다 손해 보는 상황', hint = 'ㅈㅅㅇㄷㄹㅁ', related_words = ARRAY['치킨게임']::text[] WHERE id = 521;  -- 죄수의 딜레마
UPDATE public.words SET word = '주가순자산비율(PBR)', meaning = '주가를 주당 순자산으로 나눠 장부가치 대비 주가 수준을 보는 지표', hint = 'ㅈㄱㅅㅈㅅㅂㅇ', related_words = ARRAY['주가수익비율(PER)']::text[] WHERE id = 522;  -- 주가순자산비율(PBR)
UPDATE public.words SET word = '주가연계증권(ELS)', meaning = '주가나 주가지수 움직임에 따라 미리 정한 조건으로 수익이 결정되는 상품', hint = 'ㅈㄱㅇㄱㅈㄱ', related_words = '{}'::text[] WHERE id = 523;  -- 주가연계증권(ELS)
UPDATE public.words SET word = '주가지수', meaning = '개별 종목 가격을 종합해 주식시장 전체 수준을 나타낸 지표', hint = 'ㅈㄱㅈㅅ', related_words = ARRAY['주가수익비율(PER)']::text[] WHERE id = 524;  -- 주가지수
UPDATE public.words SET word = '주가지수선물거래', meaning = '코스피200 같은 주가지수를 기초자산으로 하는 선물거래', hint = 'ㅈㄱㅈㅅㅅㅁㄱㄹ', related_words = ARRAY['레버리지 효과']::text[] WHERE id = 525;  -- 주가지수선물거래
