-- ===== 콘텐츠 정제 2/36 (refine.py 생성 — 손으로 고치지 말고 meanings.py를 고친 뒤 다시 실행) =====
-- 뜻 전면 재작성·슬래시 항목 분리(신규 31행)·힌트 기본형 초성·related_words 정리·본문 줄이음 자국 제거.
-- 적용 순서: 16_words_refine_1..N -> 17_courses.sql

UPDATE public.words SET word = '가계수지', meaning = '한 가정의 수입과 지출을 비교해 남았는지 모자랐는지 보는 살림 결산', hint = 'ㄱㄱㅅㅈ', related_words = ARRAY['경상수지','재정수지']::text[] WHERE id = 1;  -- 가계수지
UPDATE public.words SET word = '가계순저축률', meaning = '가계가 쓸 수 있는 소득 중 저축으로 남긴 돈의 비율', hint = 'ㄱㄱㅅㅈㅊㄹ', related_words = ARRAY['가계처분가능소득','저축률']::text[] WHERE id = 2;  -- 가계순저축률
UPDATE public.words SET word = '가계신용통계', meaning = '가계가 대출과 외상으로 진 빚의 규모를 집계한 통계', hint = 'ㄱㄱㅅㅇㅌㄱ', related_words = '{}'::text[] WHERE id = 3;  -- 가계신용통계
UPDATE public.words SET word = '가계처분가능소득', meaning = '가계가 마음대로 소비나 저축에 쓸 수 있는 진짜 내 돈', hint = 'ㄱㄱㅊㅂㄱㄴㅅㄷ', related_words = ARRAY['국민총소득(GNI)']::text[] WHERE id = 4;  -- 가계처분가능소득
UPDATE public.words SET word = '가교은행', meaning = '망한 금융회사의 자산과 부채를 임시로 맡아 정리하는 은행', hint = 'ㄱㄱㅇㅎ', related_words = '{}'::text[] WHERE id = 5;  -- 가교은행
UPDATE public.words SET word = '가산금리', meaning = '빌리는 사람의 신용도에 따라 기준금리 위에 얹는 추가 금리', hint = 'ㄱㅅㄱㄹ', related_words = ARRAY['무위험지표금리(RFR: Risk-Free Rate)','신용스프레드']::text[] WHERE id = 6;  -- 가산금리
UPDATE public.words SET word = '가상자산', meaning = '블록체인 기술로 만들어져 디지털로 거래되는 자산', hint = 'ㄱㅅㅈㅅ', related_words = ARRAY['블록체인','비트코인','중앙은행 디지털화폐(CBDC)']::text[] WHERE id = 7;  -- 가상자산
UPDATE public.words SET word = '가상자산공개(ICO)', meaning = '스타트업이 새 코인을 발행해 팔아서 자금을 모으는 방식', hint = 'ㄱㅅㅈㅅㄱㄱ', related_words = ARRAY['가상자산','블록체인','비트코인','빅데이터']::text[] WHERE id = 8;  -- 가상자산공개(ICO)
UPDATE public.words SET word = '간접금융', meaning = '은행 같은 금융회사를 거쳐 돈을 빌리고 빌려주는 방식', hint = 'ㄱㅈㄱㅇ', related_words = ARRAY['금융제도','장기금융시장(자본시장)','직접금융']::text[] WHERE id = 9;  -- 간접금융/직접금융
UPDATE public.words SET word = '간접세', meaning = '물건값에 숨어 있어 내는 사람과 부담하는 사람이 다른 세금(부가가치세)', hint = 'ㄱㅈㅅ', related_words = ARRAY['직접세']::text[] WHERE id = 10;  -- 간접세/직접세
UPDATE public.words SET word = '간편 송금', meaning = '공인인증서 없이 비밀번호나 지문만으로 앱에서 돈을 보내는 서비스', hint = 'ㄱㅍㅅㄱ', related_words = ARRAY['NFC 기술']::text[] WHERE id = 11;  -- 간편 송금
UPDATE public.words SET word = '감독자협의회(Supervisory College)', meaning = '여러 나라에 진출한 금융회사를 본국과 진출국 감독당국이 함께 감독하는 협의체', hint = 'ㄱㄷㅈㅎㅇㅎ', related_words = '{}'::text[] WHERE id = 12;  -- 감독자협의회(Supervisory College)
UPDATE public.words SET word = '갑기금(Capital A)', meaning = '외국은행 국내지점이 본점에서 받아 자본금으로 잡는 원화 자금', hint = 'ㄱㄱㄱ', related_words = ARRAY['을기금(Capital B)']::text[] WHERE id = 13;  -- 갑기금(Capital A)
UPDATE public.words SET word = '거래정보저장소', meaning = '장외파생상품 거래 내역을 한곳에 모아 보관·관리하는 기관', hint = 'ㄱㄹㅈㅂㅈㅈㅅ', related_words = ARRAY['금융시장인프라']::text[] WHERE id = 14;  -- 거래정보저장소
UPDATE public.words SET word = '거시건전성 정책', meaning = '개별 회사가 아니라 금융시스템 전체의 위기를 막기 위한 예방 정책', hint = 'ㄱㅅㄱㅈㅅㅈㅊ', related_words = '{}'::text[] WHERE id = 15;  -- 거시건전성 정책
UPDATE public.words SET word = '거액익스포저 규제', meaning = '한 거래처에 대출이 너무 몰리지 않도록 한도를 두는 규제', hint = 'ㄱㅇㅇㅅㅍㅈㄱㅈ', related_words = ARRAY['동일인 신용공여한도제(동일인 여신한도제)','익스포저']::text[] WHERE id = 16;  -- 거액익스포저 규제
UPDATE public.words SET word = '거액지급시스템', meaning = '금융기관끼리 큰 금액을 주고받을 때 쓰는 자금이체 시스템', hint = 'ㄱㅇㅈㄱㅅㅅㅌ', related_words = ARRAY['소액지급시스템','지급결제시스템','총액결제시스템']::text[] WHERE id = 17;  -- 거액지급시스템
UPDATE public.words SET word = '결제리스크', meaning = '예상치 못한 사정으로 결제가 제때 안 돼 손실이 날 가능성', hint = 'ㄱㅈㄹㅅㅋ', related_words = ARRAY['지급결제시스템','지급결제제도 감시']::text[] WHERE id = 18;  -- 결제리스크
UPDATE public.words SET word = '결제부족자금 공동분담제', meaning = '한 기관이 결제를 못 하면 나머지 참가기관이 나눠 메워 결제를 끝내는 제도', hint = 'ㄱㅈㅂㅈㅈㄱㄱㄷㅂㄷㅈ', related_words = ARRAY['결제리스크','차액결제시스템']::text[] WHERE id = 19;  -- 결제부족자금 공동분담제
UPDATE public.words SET word = '결제완결성', meaning = '한번 끝난 결제는 어떤 이유로도 취소되지 않는다는 보장', hint = 'ㄱㅈㅇㄱㅅ', related_words = '{}'::text[] WHERE id = 20;  -- 결제완결성
UPDATE public.words SET word = '겸업주의', meaning = '한 금융회사가 은행·증권·보험을 모두 취급할 수 있게 하는 방식', hint = 'ㄱㅇㅈㅇ', related_words = ARRAY['볼커룰','전업주의']::text[] WHERE id = 21;  -- 겸업주의/전업주의
UPDATE public.words SET word = '경기', meaning = '생산·소비·투자 같은 경제활동이 전반적으로 좋은지 나쁜지의 흐름', hint = 'ㄱㄱ', related_words = ARRAY['경기종합지수','동행종합지수']::text[] WHERE id = 22;  -- 경기
UPDATE public.words SET word = '경기순응성', meaning = '호황엔 대출이 더 늘고 불황엔 더 줄어 경기 진폭을 키우는 성질', hint = 'ㄱㄱㅅㅇㅅ', related_words = ARRAY['거시건전성 정책']::text[] WHERE id = 23;  -- 경기순응성
UPDATE public.words SET word = '경기조절정책(경제안정화정책)', meaning = '과열되거나 침체된 경기를 정상으로 되돌리려는 정부·중앙은행의 조치', hint = 'ㄱㄱㅈㅈㅈㅊ', related_words = ARRAY['재정정책','통화정책']::text[] WHERE id = 24;  -- 경기조절정책/경제안정화정책
UPDATE public.words SET word = '경기종합지수', meaning = '여러 경제지표를 합쳐 경기 흐름을 한눈에 보여주는 지수', hint = 'ㄱㄱㅈㅎㅈㅅ', related_words = ARRAY['경기']::text[] WHERE id = 25;  -- 경기종합지수
