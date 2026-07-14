// 앱 전역 날짜 문자열은 KST(UTC+9) 기준.
// toISOString()은 UTC라 00:00~09:00 KST 구간에서 하루 밀린다(예: 07-14 08:00 KST = 07-13 23:00 UTC).
// 출석 기록/조회, streak, SRS due_date 비교가 전부 이 함수를 거쳐 같은 규칙을 쓴다.
export const toDateStr = (d: Date = new Date()) =>
  new Date(d.getTime() + 9 * 60 * 60 * 1000).toISOString().slice(0, 10);
