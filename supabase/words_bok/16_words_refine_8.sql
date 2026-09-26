-- ===== 콘텐츠 정제 8/36 (refine.py 생성 — 손으로 고치지 말고 meanings.py를 고친 뒤 다시 실행) =====
-- 뜻 전면 재작성·슬래시 항목 분리(신규 31행)·힌트 기본형 초성·related_words 정리·본문 줄이음 자국 제거.
-- 적용 순서: 16_words_refine_1..N -> 17_courses.sql

UPDATE public.words SET word = '긴급수입제한조치', meaning = '수입 급증으로 국내 산업이 피해를 볼 때 관세 인상 등으로 수입을 막는 조치', hint = 'ㄱㄱㅅㅇㅈㅎㅈㅊ', related_words = ARRAY['상계관세','슈퍼301조']::text[] WHERE id = 151;  -- 긴급수입제한조치
UPDATE public.words SET word = '긴축정책', meaning = '경기 과열을 막으려고 정부 지출을 줄이거나 금리를 올려 수요를 억제하는 정책', hint = 'ㄱㅊㅈㅊ', related_words = ARRAY['경기조절정책(경제안정화정책)','재정정책','통화정책']::text[] WHERE id = 152;  -- 긴축정책
UPDATE public.words SET word = '꼬리위험', meaning = '일어날 확률은 아주 낮지만 터지면 경제 전체를 흔드는 극단적 위험', hint = 'ㄲㄹㅇㅎ', related_words = '{}'::text[] WHERE id = 153;  -- 꼬리위험
UPDATE public.words SET word = '낙수효과', meaning = '대기업·부유층이 먼저 잘살면 그 혜택이 아래로 흘러내린다는 주장', hint = 'ㄴㅅㅎㄱ', related_words = ARRAY['분수효과']::text[] WHERE id = 154;  -- 낙수효과
UPDATE public.words SET word = '낙인효과', meaning = '한번 나쁜 사람으로 찍히면 그 인식 때문에 실제로 더 나빠지는 현상', hint = 'ㄴㅇㅎㄱ', related_words = '{}'::text[] WHERE id = 155;  -- 낙인효과
UPDATE public.words SET word = '난외거래', meaning = '보증처럼 권리·의무가 확정되지 않아 재무제표에 잡히지 않는 거래', hint = 'ㄴㅇㄱㄹ', related_words = '{}'::text[] WHERE id = 156;  -- 난외거래
UPDATE public.words SET word = '납부자자동이체', meaning = '내 거래은행 계좌에서 다른 은행으로 대출이자·적금을 정기 자동이체하는 서비스', hint = 'ㄴㅂㅈㅈㄷㅇㅊ', related_words = ARRAY['지로(GIRO)','출금이체']::text[] WHERE id = 157;  -- 납부자자동이체
UPDATE public.words SET word = '내국신용장', meaning = '수출업자의 의뢰로 국내 은행이 국내 납품업체 앞으로 발행하는 신용장', hint = 'ㄴㄱㅅㅇㅈ', related_words = '{}'::text[] WHERE id = 158;  -- 내국신용장
UPDATE public.words SET word = '내부등급법', meaning = '감독당국 승인을 받은 은행이 자체 모형으로 신용위험을 측정하는 방식', hint = 'ㄴㅂㄷㄱㅂ', related_words = '{}'::text[] WHERE id = 159;  -- 내부등급법
UPDATE public.words SET word = '내부자금', meaning = '기업이 이익 유보금과 감가상각 적립금 등 자기 돈으로 마련한 투자 재원', hint = 'ㄴㅂㅈㄱ', related_words = ARRAY['외부자금']::text[] WHERE id = 160;  -- 내부자금
UPDATE public.words SET word = '노동생산성', meaning = '노동자 한 사람이 일정 기간 동안 만들어 내는 생산량', hint = 'ㄴㄷㅅㅅㅅ', related_words = ARRAY['단위노동비용']::text[] WHERE id = 161;  -- 노동생산성/노동생산성지수
UPDATE public.words SET word = '노동시장 긴장도', meaning = '일자리 수에 비해 일할 사람이 얼마나 부족한지 나타내는 지표', hint = 'ㄴㄷㅅㅈㄱㅈㄷ', related_words = ARRAY['구인배수','실업률']::text[] WHERE id = 162;  -- 노동시장 긴장도
UPDATE public.words SET word = '녹색GDP', meaning = '국내총생산에서 자원 고갈과 환경 피해 손실을 뺀 값', hint = 'ㄴㅅG', related_words = '{}'::text[] WHERE id = 163;  -- 녹색GDP
UPDATE public.words SET word = '녹색기후기금(GCF)', meaning = '개발도상국의 온실가스 감축과 기후변화 대응을 돕는 UN 산하 기금', hint = 'ㄴㅅㄱㅎㄱㄱ', related_words = '{}'::text[] WHERE id = 164;  -- 녹색기후기금(GCF)
UPDATE public.words SET word = '뉴스심리지수(NSI)', meaning = '경제 뉴스 기사에 담긴 긍정·부정 감성을 지수로 만든 것', hint = 'ㄴㅅㅅㄹㅈㅅ', related_words = '{}'::text[] WHERE id = 165;  -- 뉴스심리지수(NSI)
UPDATE public.words SET word = '단기금융시장', meaning = '만기 1년 이내의 짧은 자금을 빌리고 빌려주는 시장(콜·CP·CD 등)', hint = 'ㄷㄱㄱㅇㅅㅈ', related_words = ARRAY['장기금융시장(자본시장)']::text[] WHERE id = 166;  -- 단기금융시장
UPDATE public.words SET word = '단리', meaning = '원금에만 이자가 붙는 이자 계산 방식', hint = 'ㄷㄹ', related_words = ARRAY['복리']::text[] WHERE id = 167;  -- 단리/복리
UPDATE public.words SET word = '단위노동비용', meaning = '제품 한 개를 만드는 데 들어가는 인건비', hint = 'ㄷㅇㄴㄷㅂㅇ', related_words = ARRAY['노동생산성','총산출']::text[] WHERE id = 168;  -- 단위노동비용
UPDATE public.words SET word = '단일금리방식', meaning = '입찰에서 낙찰된 가장 높은 금리를 모두에게 똑같이 적용하는 방식', hint = 'ㄷㅇㄱㄹㅂㅅ', related_words = ARRAY['통화안정증권','복수금리방식']::text[] WHERE id = 169;  -- 단일금리방식/복수금리방식
UPDATE public.words SET word = '담보인정비율(LTV)', meaning = '집값 대비 얼마까지 주택담보대출을 받을 수 있는지의 비율', hint = 'ㄷㅂㅇㅈㅂㅇ', related_words = ARRAY['총부채상환비율(DTI)','총부채원리금상환비율(DSR)']::text[] WHERE id = 170;  -- 담보인정비율(LTV)
UPDATE public.words SET word = '당일결제', meaning = '외환거래 계약 당일에 바로 돈을 주고받는 결제', hint = 'ㄷㅇㄱㅈ', related_words = ARRAY['선물환거래','익일결제','익익일결제']::text[] WHERE id = 171;  -- 당일결제/익일결제/익익일결제
UPDATE public.words SET word = '대기성 여수신제도', meaning = '은행이 언제든 중앙은행에서 빌리거나 맡길 수 있게 해 단기금리 급변을 막는 제도', hint = 'ㄷㄱㅅㅇㅅㅅㅈㄷ', related_words = '{}'::text[] WHERE id = 172;  -- 대기성 여수신제도
UPDATE public.words SET word = '대량지급', meaning = '급여·연금처럼 한 계좌에서 여러 사람 계좌로 한꺼번에 돈을 보내는 이체', hint = 'ㄷㄹㅈㄱ', related_words = ARRAY['지로(GIRO)','입금이체']::text[] WHERE id = 173;  -- 대량지급
UPDATE public.words SET word = '대손충당금적립비율', meaning = '부실 대출에 대비해 쌓아 둔 충당금이 부실 대출액의 몇 %인지 나타낸 비율', hint = 'ㄷㅅㅊㄷㄱㅈㄹㅂㅇ', related_words = ARRAY['고정이하여신비율']::text[] WHERE id = 174;  -- 대손충당금적립비율
UPDATE public.words SET word = '대안정기', meaning = '1980년대 중반부터 2007년까지 경기와 물가가 유난히 안정됐던 시기', hint = 'ㄷㅇㅈㄱ', related_words = ARRAY['골디락스경제']::text[] WHERE id = 175;  -- 대안정기
