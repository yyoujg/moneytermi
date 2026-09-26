-- ===== 콘텐츠 정제 9/36 (refine.py 생성 — 손으로 고치지 말고 meanings.py를 고친 뒤 다시 실행) =====
-- 뜻 전면 재작성·슬래시 항목 분리(신규 31행)·힌트 기본형 초성·related_words 정리·본문 줄이음 자국 제거.
-- 적용 순서: 16_words_refine_1..N -> 17_courses.sql

UPDATE public.words SET word = '대외의존도(무역의존도)', meaning = '국민소득에서 수출과 수입이 차지하는 비중', hint = 'ㄷㅇㅇㅈㄷ', related_words = ARRAY['국내총생산(GDP)','국민총소득(GNI)']::text[] WHERE id = 176;  -- 대외의존도/수출입의존도/무역의존도
UPDATE public.words SET word = '대외지급준비자산', meaning = '통화당국이 대외 지급에 언제든 쓸 수 있게 보유한 금·외화 등 준비자산', hint = 'ㄷㅇㅈㄱㅈㅂㅈㅅ', related_words = ARRAY['외환보유액','IMF 포지션','특별인출권(SDR)']::text[] WHERE id = 177;  -- 대외지급준비자산
UPDATE public.words SET word = '대체비용리스크', meaning = '상대방이 거래를 취소하거나 망해 다른 거래로 대체할 때 생기는 비용 위험', hint = 'ㄷㅊㅂㅇㄹㅅㅋ', related_words = ARRAY['외환결제리스크','증권결제리스크']::text[] WHERE id = 178;  -- 대체비용리스크
UPDATE public.words SET word = '대출금 출자전환', meaning = '은행이 받을 대출금 대신 그 기업의 주식을 받아 채권자에서 주주가 되는 것', hint = 'ㄷㅊㄱㅊㅈㅈㅎ', related_words = '{}'::text[] WHERE id = 179;  -- 대출금 출자전환
UPDATE public.words SET word = '대출채권 분할매각', meaning = '은행이 대출채권의 원리금 받을 권리를 다른 투자자에게 나눠 파는 것', hint = 'ㄷㅊㅊㄱㅂㅎㅁㄱ', related_words = '{}'::text[] WHERE id = 180;  -- 대출채권 분할매각
UPDATE public.words SET word = '도덕적 해이', meaning = '계약 후 정보를 더 가진 쪽이 상대에게 손해가 되는 행동을 하는 문제', hint = 'ㄷㄷㅈㅎㅇ', related_words = ARRAY['역선택','정보의 비대칭성']::text[] WHERE id = 181;  -- 도덕적 해이
UPDATE public.words SET word = '도드-프랭크법', meaning = '2008년 금융위기 재발을 막으려고 2010년 미국이 만든 대대적 금융개혁법', hint = 'ㄷㄷㅍㄹㅋㅂ', related_words = ARRAY['볼커룰']::text[] WHERE id = 182;  -- 도드-프랭크법
UPDATE public.words SET word = '동남아시아국가연합(ASEAN)', meaning = '동남아 10개국이 경제·사회 협력을 위해 만든 지역협력기구', hint = 'ㄷㄴㅇㅅㅇㄱㄱㅇㅎ', related_words = ARRAY['치앙마이 이니셔티브(CMI)','치앙마이 이니셔티브 다자화(CMIM)']::text[] WHERE id = 183;  -- 동남아시아국가연합(ASEAN)
UPDATE public.words SET word = '동아시아 외환위기', meaning = '1997년 태국에서 시작돼 한국까지 번진 아시아 국가들의 외환위기', hint = 'ㄷㅇㅅㅇㅇㅎㅇㄱ', related_words = ARRAY['경기순응성']::text[] WHERE id = 184;  -- 동아시아 외환위기
UPDATE public.words SET word = '동행종합지수', meaning = '광공업생산·소매판매 등 경기와 같이 움직이는 지표로 현재 경기를 보는 지수', hint = 'ㄷㅎㅈㅎㅈㅅ', related_words = ARRAY['경기종합지수','후행종합지수']::text[] WHERE id = 185;  -- 동행종합지수
UPDATE public.words SET word = '듀레이션', meaning = '채권 투자금을 돌려받는 데 걸리는 평균 기간(금리 민감도 지표)', hint = 'ㄷㄹㅇㅅ', related_words = '{}'::text[] WHERE id = 186;  -- 듀레이션
UPDATE public.words SET word = '등록발행', meaning = '실물 채권 없이 등록기관 장부에 권리를 기록하는 방식의 채권 발행', hint = 'ㄷㄹㅂㅎ', related_words = '{}'::text[] WHERE id = 187;  -- 등록발행
UPDATE public.words SET word = '디레버리징', meaning = '빚을 줄여 부채 비중을 낮추는 것', hint = 'ㄷㄹㅂㄹㅈ', related_words = ARRAY['레버리지 효과']::text[] WHERE id = 188;  -- 디레버리징
UPDATE public.words SET word = '디스인플레이션', meaning = '물가는 계속 오르지만 오르는 속도(상승률)는 둔화되는 현상', hint = 'ㄷㅅㅇㅍㄹㅇㅅ', related_words = ARRAY['디플레이션','통화정책']::text[] WHERE id = 189;  -- 디스인플레이션
UPDATE public.words SET word = '디커플링', meaning = '한 나라 경제나 자산이 세계 흐름과 따로 노는 탈동조화 현상', hint = 'ㄷㅋㅍㄹ', related_words = ARRAY['커플링']::text[] WHERE id = 190;  -- 디커플링/커플링
UPDATE public.words SET word = '디플레이션', meaning = '물가가 지속적으로 떨어지는 현상', hint = 'ㄷㅍㄹㅇㅅ', related_words = ARRAY['인플레이션','피셔효과']::text[] WHERE id = 191;  -- 디플레이션
UPDATE public.words SET word = '래퍼곡선', meaning = '세율이 너무 높아지면 오히려 세수가 줄어든다는 역U자 곡선', hint = 'ㄹㅍㄱㅅ', related_words = ARRAY['조세부담률']::text[] WHERE id = 192;  -- 래퍼곡선
UPDATE public.words SET word = '레그테크', meaning = 'IT 기술로 금융 규제 준수 업무를 자동화하는 기술이나 회사', hint = 'ㄹㄱㅌㅋ', related_words = ARRAY['핀테크','고객확인절차(KYC)','블록체인','분산원장기술']::text[] WHERE id = 193;  -- 레그테크
UPDATE public.words SET word = '레버리지 효과', meaning = '빚을 지렛대 삼아 실제 가격 변동보다 몇 배 큰 수익률(또는 손실)을 내는 효과', hint = 'ㄹㅂㄹㅈㅎㄱ', related_words = ARRAY['디레버리징']::text[] WHERE id = 194;  -- 레버리지 효과
UPDATE public.words SET word = '레버리지비율', meaning = '위험가중 없이 총자산 대비 기본자본이 얼마인지 보는 은행 건전성 비율', hint = 'ㄹㅂㄹㅈㅂㅇ', related_words = ARRAY['기본자본(Tier 1)','익스포저','디레버리징']::text[] WHERE id = 195;  -- 레버리지비율/단순기본자본비율
UPDATE public.words SET word = '로렌츠곡선', meaning = '인구 누적비율과 소득 누적비율로 소득 불평등을 그림으로 나타낸 곡선', hint = 'ㄹㄹㅊㄱㅅ', related_words = ARRAY['지니계수']::text[] WHERE id = 196;  -- 로렌츠곡선
UPDATE public.words SET word = '로보어드바이저', meaning = '인공지능 알고리즘이 투자 성향을 분석해 자산관리를 해 주는 서비스', hint = 'ㄹㅂㅇㄷㅂㅇㅈ', related_words = ARRAY['빅데이터','상장지수펀드(ETF)']::text[] WHERE id = 197;  -- 로보어드바이저
UPDATE public.words SET word = '리디노미네이션', meaning = '1000원을 1원으로 바꾸듯 화폐 단위의 자릿수를 줄이는 것', hint = 'ㄹㄷㄴㅁㄴㅇㅅ', related_words = '{}'::text[] WHERE id = 198;  -- 리디노미네이션
UPDATE public.words SET word = '리스크 온(Risk On)', meaning = '투자자들이 주식 같은 위험자산에 적극 투자하는 분위기', hint = 'ㄹㅅㅋㅇ', related_words = ARRAY['위험 선호/회피','안전자산/위험자산','리스크 오프(Risk Off)']::text[] WHERE id = 199;  -- 리스크 온(Risk On)/오프(Off)
UPDATE public.words SET word = '마샬의 k', meaning = '명목소득 대비 사람들이 보유한 통화량의 비율', hint = 'ㅁㅅㅇK', related_words = '{}'::text[] WHERE id = 200;  -- 마샬의 k
