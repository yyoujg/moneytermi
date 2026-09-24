// 앱 전역 날짜 문자열은 KST(UTC+9) 기준.
// toISOString()은 UTC라 00:00~09:00 KST 구간에서 하루 밀린다(예: 07-14 08:00 KST = 07-13 23:00 UTC).
// 출석 기록/조회, streak, SRS due_date 비교가 전부 이 함수를 거쳐 같은 규칙을 쓴다.
export const toDateStr = (d: Date = new Date()) =>
  new Date(d.getTime() + 9 * 60 * 60 * 1000).toISOString().slice(0, 10);

// 미션 리셋 슬롯. KST 0/8/16시 기준 0,1,2 — 서버 mission_slot()과 같은 규칙이어야 한다.
export const missionSlot = (d: Date = new Date()): number =>
  Math.floor(new Date(d.getTime() + 9 * 60 * 60 * 1000).getUTCHours() / 8);

// 다음 슬롯 경계까지 남은 ms
export const msUntilNextSlot = (d: Date = new Date()): number => {
  const kst = new Date(d.getTime() + 9 * 60 * 60 * 1000);
  const h = kst.getUTCHours();
  const nextH = (Math.floor(h / 8) + 1) * 8;
  const end = Date.UTC(kst.getUTCFullYear(), kst.getUTCMonth(), kst.getUTCDate(), nextH,
    0, 0, 0);
  return end - kst.getTime();
};
