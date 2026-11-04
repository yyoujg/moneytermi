-- apply.sql 되돌리기
BEGIN;
UPDATE public.words SET meaning = '경제적 가치가 있어 전자적으로 사고팔거나 옮길 수 있는 디지털 증표와 그 권리(법에서 정한 제외 대상은 제외)' WHERE id = 7 AND word = '가상자산' AND meaning = '경제적 가치가 있어 전자적으로 사고팔거나 옮길 수 있는 디지털 증표와 그 권리';
UPDATE public.words SET meaning = '과거 정부가 나랏돈을 지급할 때 쓰던 수표(지금은 비상시에만 사용)' WHERE id = 66 AND word = '국고수표' AND meaning = '지금은 비상시에만 쓰는, 정부가 나랏돈을 지급할 때 쓰던 수표';
UPDATE public.words SET meaning = '빌려 간 쪽 사정이 나빠져 돌려받기 어려워진 대출(고정 이하 여신)' WHERE id = 253 AND word = '부실채권(NPL)' AND meaning = '빌려 간 쪽 사정이 나빠져 돌려받기 어려워진 대출';
UPDATE public.words SET meaning = '인터넷 등 컴퓨터 네트워크에서 상품·서비스를 주문하는 상거래(온라인 결제는 필수가 아님)' WHERE id = 500 AND word = '전자상거래' AND meaning = '인터넷 같은 컴퓨터 네트워크로 상품이나 서비스를 주문하는 거래';
UPDATE public.words SET meaning = '신규 분양·재건축 등의 입주(예정)자 집단을 대상으로 사업장별 공통 조건으로 취급하는 대출' WHERE id = 564 AND word = '집단대출' AND meaning = '새 아파트 분양이나 재건축 입주자들에게 단지별로 같은 조건을 붙여 한꺼번에 해 주는 대출';
UPDATE public.words SET meaning = '정해진 양만큼 온실가스를 배출할 수 있는 권리(남으면 사고팔 수 있음)' WHERE id = 603 AND word = '탄소배출권' AND meaning = '정해진 양만큼 온실가스를 내보낼 수 있고, 남으면 사고팔 수도 있는 권리';
UPDATE public.words SET meaning = '국제통화기금이 창설한 보완적 국제준비자산(일반배분은 회원국 쿼타 비중에 따름)' WHERE id = 625 AND word = '특별인출권(SDR)' AND meaning = '국제통화기금이 회원국에 나눠 주는 보조 국제준비자산';
UPDATE public.words SET meaning = '법으로 쓸 수 없게 된 옛 화폐(한국은행에서 교환만 가능)' WHERE id = 734 AND word = '유통정지화폐' AND meaning = '법으로 쓸 수 없게 되어 한국은행에서 바꾸기만 할 수 있는 옛 화폐';
-- 확인: 8이 나와야 한다
SELECT count(*) AS changed FROM public.words WHERE (id, meaning) IN ((7, '경제적 가치가 있어 전자적으로 사고팔거나 옮길 수 있는 디지털 증표와 그 권리(법에서 정한 제외 대상은 제외)'), (66, '과거 정부가 나랏돈을 지급할 때 쓰던 수표(지금은 비상시에만 사용)'), (253, '빌려 간 쪽 사정이 나빠져 돌려받기 어려워진 대출(고정 이하 여신)'), (500, '인터넷 등 컴퓨터 네트워크에서 상품·서비스를 주문하는 상거래(온라인 결제는 필수가 아님)'), (564, '신규 분양·재건축 등의 입주(예정)자 집단을 대상으로 사업장별 공통 조건으로 취급하는 대출'), (603, '정해진 양만큼 온실가스를 배출할 수 있는 권리(남으면 사고팔 수 있음)'), (625, '국제통화기금이 창설한 보완적 국제준비자산(일반배분은 회원국 쿼타 비중에 따름)'), (734, '법으로 쓸 수 없게 된 옛 화폐(한국은행에서 교환만 가능)'));
COMMIT;
