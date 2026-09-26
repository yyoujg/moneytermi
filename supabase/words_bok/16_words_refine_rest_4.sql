-- ===== 콘텐츠 정제 4/15 (refine.py 생성 — 손으로 고치지 말고 meanings.py를 고친 뒤 다시 실행) =====
-- 라이브 덤프와 비교해 아직 적용되지 않은 행만. 단문 UPDATE 294행, 본문 UPDATE 64행.
-- 적용 순서: 16_words_refine_1..N -> 17_courses.sql

UPDATE public.words SET word = '리디노미네이션', meaning = '1000원을 1원으로 바꾸듯 화폐 단위의 자릿수를 줄이는 것', hint = 'ㄹㄷㄴㅁㄴㅇㅅ', related_words = '{}'::text[] WHERE id = 198;  -- 리디노미네이션
UPDATE public.words SET word = '리스크 온(Risk On)', meaning = '투자자들이 주식 같은 위험자산에 적극 투자하는 분위기', hint = 'ㄹㅅㅋㅇ', related_words = ARRAY['위험 선호/회피','안전자산/위험자산','리스크 오프(Risk Off)']::text[] WHERE id = 199;  -- 리스크 온(Risk On)/오프(Off)
UPDATE public.words SET word = '마샬의 k', meaning = '명목소득 대비 사람들이 보유한 통화량의 비율', hint = 'ㅁㅅㅇK', related_words = '{}'::text[] WHERE id = 200;  -- 마샬의 k
UPDATE public.words SET word = '마스트리히트조약', meaning = '1992년 유럽 12개국이 유럽연합과 단일통화(유로) 출범에 합의한 조약', hint = 'ㅁㅅㅌㄹㅎㅌㅈㅇ', related_words = ARRAY['유럽연합(EU)','유럽중앙은행(ECB)']::text[] WHERE id = 201;  -- 마스트리히트조약
UPDATE public.words SET word = '마찰적 실업', meaning = '더 나은 일자리를 찾거나 옮기는 과정에서 잠시 생기는 자발적 실업', hint = 'ㅁㅊㅈㅅㅇ', related_words = ARRAY['실망실업자','자발적 실업']::text[] WHERE id = 202;  -- 마찰적 실업
UPDATE public.words SET word = '만기수익률', meaning = '채권을 만기까지 들고 있을 때 얻는 연평균 예상 수익률', hint = 'ㅁㄱㅅㅇㄹ', related_words = ARRAY['이표채']::text[] WHERE id = 203;  -- 만기수익률
UPDATE public.words SET word = '매매보호 서비스(Escrow)', meaning = '거래가 끝날 때까지 중립적인 제3자가 결제대금을 맡아 두는 안전거래 서비스', hint = 'ㅁㅁㅂㅎㅅㅂㅅ', related_words = '{}'::text[] WHERE id = 204;  -- 매매보호 서비스(Escrow)
UPDATE public.words SET word = '매몰비용', meaning = '이미 써 버려서 어떤 선택을 해도 되돌릴 수 없는 비용', hint = 'ㅁㅁㅂㅇ', related_words = ARRAY['기회비용']::text[] WHERE id = 205;  -- 매몰비용
UPDATE public.words SET word = '매입외환', meaning = '은행이 고객에게서 사들인 수출환어음·외화수표 같은 외화 자산', hint = 'ㅁㅇㅇㅎ', related_words = ARRAY['내국신용장','환가료']::text[] WHERE id = 206;  -- 매입외환/환가료
UPDATE public.words SET word = '매출액영업이익률', meaning = '영업이익을 매출액으로 나눠 본업으로 얼마나 효율적으로 버는지 보는 비율', hint = 'ㅁㅊㅇㅇㅇㅇㅇㄹ', related_words = '{}'::text[] WHERE id = 207;  -- 매출액영업이익률
UPDATE public.words SET word = '머니마켓펀드(MMF)', meaning = '여윳돈을 국공채·어음 등 안전한 단기상품에 굴려 수시로 넣고 빼는 펀드', hint = 'ㅁㄴㅁㅋㅍㄷ', related_words = ARRAY['단기금융시장','채권시가평가','펀드']::text[] WHERE id = 208;  -- 머니마켓펀드(MMF)
UPDATE public.words SET word = '명목GDP목표제', meaning = '물가 대신 명목 국내총생산 증가율을 목표로 삼는 통화정책 방식', hint = 'ㅁㅁGㅁㅍㅈ', related_words = ARRAY['물가안정목표제','제로금리정책','양적완화정책']::text[] WHERE id = 209;  -- 명목GDP목표제
UPDATE public.words SET word = '명목국내총생산', meaning = '그해 가격으로 계산한 국내총생산(물가 상승분 포함)', hint = 'ㅁㅁㄱㄴㅊㅅㅅ', related_words = ARRAY['연쇄가중법','계절변동조정시계열','경제성장률','실질국내총생산']::text[] WHERE id = 210;  -- 명목국내총생산/실질국내총생산
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
