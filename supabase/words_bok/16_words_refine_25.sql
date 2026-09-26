-- ===== 콘텐츠 정제 25/36 (refine.py 생성 — 손으로 고치지 말고 meanings.py를 고친 뒤 다시 실행) =====
-- 뜻 전면 재작성·슬래시 항목 분리(신규 31행)·힌트 기본형 초성·related_words 정리·본문 줄이음 자국 제거.
-- 적용 순서: 16_words_refine_1..N -> 17_courses.sql

UPDATE public.words SET word = '총고정자본형성', meaning = '기업이 공장·기계 등 고정자산을 새로 사들이거나 지은 금액(설비·건설 투자)', hint = 'ㅊㄱㅈㅈㅂㅎㅅ', related_words = ARRAY['총투자율']::text[] WHERE id = 576;  -- 총고정자본형성
UPDATE public.words SET word = '총부채상환비율(DTI)', meaning = '연소득 대비 주택담보대출 연간 원리금 상환액의 비율', hint = 'ㅊㅂㅊㅅㅎㅂㅇ', related_words = ARRAY['담보인정비율(LTV)','총부채원리금상환비율(DSR)']::text[] WHERE id = 577;  -- 총부채상환비율(DTI)
UPDATE public.words SET word = '총부채원리금상환비율(DSR)', meaning = '연소득 대비 모든 대출의 연간 원리금 상환액 비율', hint = 'ㅊㅂㅊㅇㄹㄱㅅㅎㅂㅇ', related_words = ARRAY['담보인정비율(LTV)','총부채상환비율(DTI)','스트레스 DSR']::text[] WHERE id = 578;  -- 총부채원리금상환비율(DSR)
UPDATE public.words SET word = '총산출', meaning = '생산된 재화와 서비스의 화폐 가치를 모두 더한 것', hint = 'ㅊㅅㅊ', related_words = ARRAY['부가가치']::text[] WHERE id = 579;  -- 총산출
UPDATE public.words SET word = '총수입스왑(Total Return Swap)', meaning = '기초자산에서 나오는 총수익을 넘기고 대신 약정 이자를 받는 스왑 거래', hint = 'ㅊㅅㅇㅅㅇ', related_words = '{}'::text[] WHERE id = 580;  -- 총수입스왑(Total Return Swap)
UPDATE public.words SET word = '총액결제시스템', meaning = '지급 건별로 상계 없이 전액을 이체하는 방식의 거액결제시스템', hint = 'ㅊㅇㄱㅈㅅㅅㅌ', related_words = ARRAY['차액결제시스템','한은금융망(BOK-Wire+)']::text[] WHERE id = 581;  -- 총액결제시스템
UPDATE public.words SET word = '총저축률', meaning = '국민총처분가능소득 중 소비하고 남긴 저축의 비율', hint = 'ㅊㅈㅊㄹ', related_words = ARRAY['국민총처분가능소득','국민계정체계(SNA)','평균소비성향','평균저축성향']::text[] WHERE id = 582;  -- 총저축/총저축률/평균소비성향/ 평균저축성향
UPDATE public.words SET word = '최저임금제', meaning = '국가가 정한 최저 수준 이상의 임금을 주도록 강제하는 제도', hint = 'ㅊㅈㅇㄱㅈ', related_words = ARRAY['의중임금']::text[] WHERE id = 583;  -- 최저임금제
UPDATE public.words SET word = '최종대부자 기능', meaning = '위기에 빠진 금융기관에 중앙은행이 마지막으로 돈을 빌려주는 역할', hint = 'ㅊㅈㄷㅂㅈㄱㄴ', related_words = '{}'::text[] WHERE id = 584;  -- 최종대부자 기능
UPDATE public.words SET word = '최종수요', meaning = '소비·투자·수출처럼 최종 용도로 쓰이는 재화와 서비스에 대한 수요', hint = 'ㅊㅈㅅㅇ', related_words = ARRAY['중간소비','중간수요']::text[] WHERE id = 585;  -- 최종수요/중간수요
UPDATE public.words SET word = '추가경정예산', meaning = '예산이 확정된 뒤 예상 밖 상황이 생겨 추가로 편성하는 예산(추경)', hint = 'ㅊㄱㄱㅈㅇㅅ', related_words = ARRAY['재정정책']::text[] WHERE id = 586;  -- 추가경정예산
UPDATE public.words SET word = '출구전략', meaning = '위기 때 풀었던 완화 정책을 정상으로 되돌리는 전략', hint = 'ㅊㄱㅈㄹ', related_words = ARRAY['제로금리정책','양적완화정책']::text[] WHERE id = 587;  -- 출구전략
UPDATE public.words SET word = '출금이체', meaning = '받을 사람이 은행에 요청해 상대 계좌에서 돈을 빼 오는 이체 방식(자동이체)', hint = 'ㅊㄱㅇㅊ', related_words = ARRAY['자금관리서비스(CMS)공동망','추심','입금이체']::text[] WHERE id = 588;  -- 출금이체
UPDATE public.words SET word = '치앙마이 이니셔티브(CMI)', meaning = '아세안과 한·중·일이 외환위기 때 서로 외화를 빌려주기로 한 통화스왑 협정', hint = 'ㅊㅇㅁㅇㅇㄴㅅㅌㅂ', related_words = ARRAY['동남아시아국가연합+한ㆍ중ㆍ일(ASEAN+3)','글로벌 금융안전망']::text[] WHERE id = 589;  -- 치앙마이 이니셔티브(CMI)
UPDATE public.words SET word = '치킨게임', meaning = '서로 물러서지 않다가 둘 다 최악을 맞을 수 있는 극단적 경쟁', hint = 'ㅊㅋㄱㅇ', related_words = ARRAY['죄수의 딜레마']::text[] WHERE id = 590;  -- 치킨게임
UPDATE public.words SET word = '칩플레이션(Cheapflation)', meaning = '저가 상품 가격이 고가 상품보다 더 많이 올라 저소득층이 더 고통받는 현상', hint = 'ㅊㅍㄹㅇㅅ', related_words = '{}'::text[] WHERE id = 591;  -- 칩플레이션(Cheapflation)
UPDATE public.words SET word = '카르텔', meaning = '경쟁 기업들이 가격·생산량을 짜고 시장을 지배하려는 담합 연합', hint = 'ㅋㄹㅌ', related_words = ARRAY['독점/과점','자연독점']::text[] WHERE id = 592;  -- 카르텔
UPDATE public.words SET word = '캐리트레이드', meaning = '금리가 낮은 나라 통화를 빌려 금리가 높은 나라 자산에 투자하는 것', hint = 'ㅋㄹㅌㄹㅇㄷ', related_words = '{}'::text[] WHERE id = 593;  -- 캐리트레이드
UPDATE public.words SET word = '캐즘(Chasm)', meaning = '신기술 제품이 초기 수요 이후 대중화되기 전에 겪는 수요 정체 구간', hint = 'ㅋㅈ', related_words = '{}'::text[] WHERE id = 594;  -- 캐즘(Chasm)
UPDATE public.words SET word = '커버드본드(이중상환청구권부 채권)', meaning = '은행이 주택담보대출 등을 담보로 발행하며 은행 자체 신용까지 함께 책임지는 채권', hint = 'ㅋㅂㄷㅂㄷ', related_words = ARRAY['특수목적기구(SPV)','주택저당증권(MBS)','자산유동화']::text[] WHERE id = 595;  -- 커버드본드(이중상환청구권부 채권)
UPDATE public.words SET word = '컨트리리스크', meaning = '투자 대상국 정부의 정책 변경 등으로 손실을 볼 수 있는 국가 위험', hint = 'ㅋㅌㄹㄹㅅㅋ', related_words = '{}'::text[] WHERE id = 596;  -- 컨트리리스크
UPDATE public.words SET word = '코리보', meaning = '국내 은행끼리 단기 자금을 빌릴 때 기준이 되는 은행 간 금리', hint = 'ㅋㄹㅂ', related_words = ARRAY['LIBOR','자금조달비용지수(COFIX)']::text[] WHERE id = 597;  -- 코리보
UPDATE public.words SET word = '콜머니', meaning = '자금이 부족한 금융기관이 하루 이틀 초단기로 빌리는 돈', hint = 'ㅋㅁㄴ', related_words = ARRAY['콜금리']::text[] WHERE id = 598;  -- 콜머니
UPDATE public.words SET word = '콜시장', meaning = '금융기관끼리 하루짜리 초단기 자금을 빌리고 빌려주는 시장', hint = 'ㅋㅅㅈ', related_words = ARRAY['기준금리']::text[] WHERE id = 599;  -- 콜시장
UPDATE public.words SET word = '콜옵션', meaning = '미리 정한 가격에 기초자산을 살 수 있는 권리', hint = 'ㅋㅇㅅ', related_words = '{}'::text[] WHERE id = 600;  -- 콜옵션
