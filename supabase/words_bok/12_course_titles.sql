-- ===== STEP 5 : 코스 제목 복원 =====
-- 처음 만들 때 첫/끝 단어를 8자에서 잘라 '공급사용표(SU ~ 국민연금' 같은 제목이 됐다.
-- 첫/끝 단어의 괄호·슬래시 앞부분(예: 'VaR(Value at Risk)' -> 'VaR')으로 다시 만든다.
-- 이미 11_courses.sql을 적용한 DB에 실행. (11_courses.sql 자체도 같은 제목으로 고쳐 두었다)
UPDATE public.courses SET title = '가계수지 ~ 경기종합지수' WHERE id = 'bok_01';
UPDATE public.courses SET title = '경상수지 ~ 공급병목' WHERE id = 'bok_02';
UPDATE public.courses SET title = '공급사용표 ~ 국민연금' WHERE id = 'bok_03';
UPDATE public.courses SET title = '국민처분가능소득 ~ 글래스-스티걸법' WHERE id = 'bok_04';
UPDATE public.courses SET title = '글로벌 공급망 압력 지수 ~ 금융중개지원대출제도' WHERE id = 'bok_05';
UPDATE public.courses SET title = '금융지주회사 ~ 기후테크' WHERE id = 'bok_06';
UPDATE public.courses SET title = '긴급수입제한조치 ~ 대안정기' WHERE id = 'bok_07';
UPDATE public.courses SET title = '대외의존도 ~ 마샬의 k' WHERE id = 'bok_08';
UPDATE public.courses SET title = '마스트리히트조약 ~ 바젤은행감독위원회' WHERE id = 'bok_09';
UPDATE public.courses SET title = '반대매매 ~ 부가가치기준 무역' WHERE id = 'bok_10';
UPDATE public.courses SET title = '부가가치유발계수 ~ 사회보장제도' WHERE id = 'bok_11';
UPDATE public.courses SET title = '사회보험 ~ 세계경제포럼' WHERE id = 'bok_12';
UPDATE public.courses SET title = '세계국채지수 ~ 순상품교역조건지수' WHERE id = 'bok_13';
UPDATE public.courses SET title = '순안정자금조달비율 ~ 신용스프레드' WHERE id = 'bok_14';
UPDATE public.courses SET title = '신용연계증권 ~ 어음교환' WHERE id = 'bok_15';
UPDATE public.courses SET title = '업무지속계획 ~ 외국환업무취급기관' WHERE id = 'bok_16';
UPDATE public.courses SET title = '외국환중개회사 ~ 위험가중자산' WHERE id = 'bok_17';
UPDATE public.courses SET title = '위험회피심리 ~ 익스포저' WHERE id = 'bok_18';
UPDATE public.courses SET title = '인구고령화 ~ 자산유동화' WHERE id = 'bok_19';
UPDATE public.courses SET title = '자연독점 ~ 전자상거래' WHERE id = 'bok_20';
UPDATE public.courses SET title = '전자서명 ~ 주가지수' WHERE id = 'bok_21';
UPDATE public.courses SET title = '주가지수선물거래 ~ 지급여력비율' WHERE id = 'bok_22';
UPDATE public.courses SET title = '지급준비자산제도 ~ 채무불이행' WHERE id = 'bok_23';
UPDATE public.courses SET title = '청년실업률 ~ 컨트리리스크' WHERE id = 'bok_24';
UPDATE public.courses SET title = '코리보 ~ 통화정책수단' WHERE id = 'bok_25';
UPDATE public.courses SET title = '통화정책체계 ~ 한계소비성향' WHERE id = 'bok_26';
UPDATE public.courses SET title = '한계효용 ~ 환매조건부매매' WHERE id = 'bok_27';
UPDATE public.courses SET title = '환어음 ~ G7' WHERE id = 'bok_28';
UPDATE public.courses SET title = 'GDP갭 ~ VaR' WHERE id = 'bok_29';
NOTIFY pgrst, 'reload schema';
