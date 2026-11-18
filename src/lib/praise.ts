export const praiseForMission = ({ ready, completed }: { ready: number; completed: number }) => {
  if (ready > 0) return `보상 ${ready}개 대기 중. 받는 것까지 내가 해줄까?`;
  if (completed > 0) return `미션 ${completed}개 클리어. 입만 산 줄 알았는데 제법이네.`;
  return '계획 잘 들었어. 이제 하나 깨볼까?';
};

export const praiseForQuiz = ({ accuracy, maxCombo, total }: { accuracy: number; maxCombo: number; total: number }) => {
  if (total === 0) return '아직 퀴즈 전. 실력은 말보다 점수로.';
  if (accuracy === 100) return `${total}문제 올클. 틀린 문제 설명하려 했는데 없네.`;
  if (accuracy >= 80) return `정답률 ${accuracy}%. 나머지도 맞히면 더 얄밉겠는데?`;
  if (maxCombo >= 3) return `${maxCombo}연속 정답. 우연치고는 꽤 긴데?`;
  return '정답은 도망 안 가. 해설 보고 다시 잡자.';
};

export const praiseForAnswer = (combo: number) => {
  if (combo >= 5) return `${combo}연속 정답. 이제 찍었다는 핑계도 안 통함.`;
  if (combo >= 3) return '또 정답. 내가 좀 가르치네.';
  return '정답. 제법인데?';
};

export const praiseForReview = (correct: number, total: number) => {
  if (total === 0) return '다시 볼 용어 생기면 여기 뜰 거야';
  if (correct === total) return '오늘 복습 올클. 기억력 자랑은 여기까지.';
  if (correct > 0) return `${correct}개 다시 챙겼어. 나머지는 나랑 재회 예정.`;
  return '잠깐 잊은 척한 거지? 다음에 또 물어볼게.';
};
