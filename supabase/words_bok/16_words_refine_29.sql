-- ===== 콘텐츠 정제 29/36 (refine.py 생성 — 손으로 고치지 말고 meanings.py를 고친 뒤 다시 실행) =====
-- 뜻 전면 재작성·슬래시 항목 분리(신규 31행)·힌트 기본형 초성·related_words 정리·본문 줄이음 자국 제거.
-- 적용 순서: 16_words_refine_1..N -> 17_courses.sql

UPDATE public.words SET word = '후행종합지수', meaning = '재고·소비지출 등 경기보다 뒤늦게 움직이는 지표로 지난 경기를 확인하는 지수', hint = 'ㅎㅎㅈㅎㅈㅅ', related_words = ARRAY['경기종합지수','동행종합지수','선행종합지수']::text[] WHERE id = 676;  -- 후행종합지수
UPDATE public.words SET word = '4차 산업혁명', meaning = '인공지능·빅데이터·사물인터넷이 산업과 사회를 근본적으로 바꾸는 변화', hint = '4ㅊㅅㅇㅎㅁ', related_words = ARRAY['빅데이터']::text[] WHERE id = 677;  -- 4차 산업혁명
UPDATE public.words SET word = 'BIS 자기자본비율', meaning = '위험가중자산 대비 자기자본 비율로 은행 건전성을 재는 국제 기준(8% 이상)', hint = 'Bㅈㄱㅈㅂㅂㅇ', related_words = ARRAY['위험가중자산','보통주자본','기타기본자본','기본자본']::text[] WHERE id = 678;  -- BIS 자기자본비율
UPDATE public.words SET word = 'CAMEL-IR 방식', meaning = '금융감독당국이 은행 본점의 경영실태를 평가하는 방식', hint = 'CIㅂㅅ', related_words = ARRAY['경영실태평가']::text[] WHERE id = 679;  -- CAMEL-IR 방식/ROCA 방식/ CACREL 방식
UPDATE public.words SET word = 'CDS프리미엄', meaning = '채권 부도에 대비한 보험료 성격의 수수료(높을수록 부도 위험이 큼)', hint = 'Cㅍㄹㅁㅇ', related_words = ARRAY['신용파생상품']::text[] WHERE id = 680;  -- CDS프리미엄
UPDATE public.words SET word = 'CLS은행', meaning = '주요 통화의 외환거래를 동시결제해 결제 위험을 없애는 국제 외환결제 전문은행', hint = 'Cㅇㅎ', related_words = ARRAY['Herstatt 리스크','외환동시결제(PVP)']::text[] WHERE id = 681;  -- CLS은행
UPDATE public.words SET word = 'CMO', meaning = '주택담보대출 증권의 현금흐름을 만기별로 여러 층으로 나눠 만든 미국 증권', hint = 'C', related_words = ARRAY['부채담보부증권(CDO)','주택저당증권(MBS)']::text[] WHERE id = 682;  -- CMO
UPDATE public.words SET word = 'EC방식', meaning = '금리보다 통화량을 중시해 통화량 목표를 정하고 관리하는 통화정책 방식', hint = 'Eㅂㅅ', related_words = ARRAY['통화유통속도']::text[] WHERE id = 683;  -- EC방식
UPDATE public.words SET word = 'ESG경영', meaning = '환경·사회·지배구조를 중시하며 기업을 경영하는 방식', hint = 'Eㄱㅇ', related_words = ARRAY['탄소배출권','지속가능성장']::text[] WHERE id = 684;  -- ESG경영
UPDATE public.words SET word = 'ESTR', meaning = '유럽중앙은행이 발표하는 유로지역 하루짜리 무담보 단기 기준금리', hint = 'E', related_words = ARRAY['SOFR']::text[] WHERE id = 685;  -- ESTR
UPDATE public.words SET word = 'FIMA Repo Facility', meaning = '외국 중앙은행이 보유한 미국 국채를 담보로 미 연준이 달러를 빌려주는 제도', hint = 'FRF', related_words = ARRAY['연방준비제도(FRS)/연방준비은행(FRB)','환매조건부매매(RP)']::text[] WHERE id = 686;  -- FIMA Repo Facility
UPDATE public.words SET word = 'FOMO현상', meaning = '남들만 좋은 기회를 누리고 나만 놓칠까 봐 불안해 따라 투자하는 심리', hint = 'Fㅎㅅ', related_words = '{}'::text[] WHERE id = 687;  -- FOMO현상
UPDATE public.words SET word = 'FTSE 지수', meaning = '영국 FTSE 러셀이 발표하는 세계 주가지수(유럽계 펀드의 기준)', hint = 'Fㅈㅅ', related_words = ARRAY['MSCI 지수']::text[] WHERE id = 688;  -- FTSE 지수
UPDATE public.words SET word = 'FedWatch', meaning = '선물 가격으로 미국 기준금리 인상·인하 확률을 보여주는 시카고상업거래소의 지표', hint = 'F', related_words = ARRAY['연방준비제도(FRS)/연방준비은행(FRB)','시카고상업거래소','금리선물']::text[] WHERE id = 689;  -- FedWatch
UPDATE public.words SET word = 'G2(Group of Two)', meaning = '세계 경제를 이끄는 두 강대국인 미국과 중국', hint = 'G', related_words = ARRAY['G7(Group of Seven)','G20(Group of 20)']::text[] WHERE id = 690;  -- G2(Group of Two)
UPDATE public.words SET word = 'G20(Group of 20)', meaning = '선진국과 신흥국 주요 20개 회원이 세계 경제 현안을 논의하는 국제회의체', hint = 'G', related_words = ARRAY['G7(Group of Seven)','유럽연합(EU)']::text[] WHERE id = 691;  -- G20(Group of 20)
UPDATE public.words SET word = 'G7(Group of Seven)', meaning = '미국·일본·영국·프랑스·독일·이탈리아·캐나다 7개 선진국 모임', hint = 'G', related_words = ARRAY['G2(Group of Two)','G20(Group of 20)']::text[] WHERE id = 692;  -- G7(Group of Seven)
UPDATE public.words SET word = 'GDP갭', meaning = '실제 국내총생산에서 잠재 국내총생산을 뺀 차이(경기 과열·침체 지표)', hint = 'Gㄱ', related_words = ARRAY['실업률갭']::text[] WHERE id = 693;  -- GDP갭
UPDATE public.words SET word = 'GDP디플레이터', meaning = '명목 국내총생산을 실질 국내총생산으로 나눈 가장 종합적인 물가지수', hint = 'Gㄷㅍㄹㅇㅌ', related_words = ARRAY['국내공급물가지수','생산자물가지수(PPI)','소비자물가지수(CPI)','수출입물가지수']::text[] WHERE id = 694;  -- GDP디플레이터
UPDATE public.words SET word = 'Herstatt 리스크', meaning = '외환결제에서 내 돈은 보냈는데 상대가 망해 받을 통화를 못 받는 원금리스크', hint = 'Hㄹㅅㅋ', related_words = ARRAY['외환결제리스크','외환동시결제(PVP)']::text[] WHERE id = 695;  -- Herstatt 리스크
UPDATE public.words SET word = 'IC카드', meaning = '연산이 가능한 반도체 칩을 넣어 보안성을 높인 카드', hint = 'Iㅋㄷ', related_words = '{}'::text[] WHERE id = 696;  -- IC카드
UPDATE public.words SET word = 'IFRS17', meaning = '보험 부채를 시가로 평가하도록 바꾼 새 국제 보험회계기준(2023년 시행)', hint = 'I', related_words = '{}'::text[] WHERE id = 697;  -- IFRS17
UPDATE public.words SET word = 'IMF 스탠드바이협약', meaning = '외환위기에 빠진 회원국에 국제통화기금이 신속히 자금을 빌려주는 지원 협약', hint = 'Iㅅㅌㄷㅂㅇㅎㅇ', related_words = ARRAY['IMF 쿼타','국제통화기금(IMF)']::text[] WHERE id = 698;  -- IMF 스탠드바이협약
UPDATE public.words SET word = 'IMF 쿼타', meaning = '국제통화기금에 대한 회원국 출자금(투표권과 대출 한도의 기준)', hint = 'Iㅋㅌ', related_words = ARRAY['국제통화기금(IMF)','특별인출권(SDR)']::text[] WHERE id = 699;  -- IMF 쿼타
UPDATE public.words SET word = 'J커브효과', meaning = '환율이 오르면 경상수지가 처음엔 나빠졌다가 시간이 지나 개선되는 현상', hint = 'Jㅋㅂㅎㄱ', related_words = ARRAY['수출입물가지수']::text[] WHERE id = 700;  -- J커브효과
