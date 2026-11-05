export const praiseForMission = ({ ready, completed }: { ready: number; completed: number }) => {
  if (ready > 0) return `보상 ${ready}개 받을 수 있어! 얼른 챙기자`;
  if (completed > 0) return `미션 ${completed}개 클리어. 꾸준함 미쳤다`;
  return '하나씩 깨면 오늘 성과가 바로 보여';
};

export const praiseForQuiz = ({ accuracy, maxCombo, total }: { accuracy: number; maxCombo: number; total: number }) => {
  if (total === 0) return '퀴즈 열리면 오늘 한 거 다 기록돼';
  if (accuracy === 100) return `${total}문제 올클! 다음 단계 가보자고`;
  if (accuracy >= 80) return `정답률 ${accuracy}%, 거의 다 왔어. 헷갈린 것만 한 번 더`;
  if (maxCombo >= 3) return `${maxCombo}문제 연속 정답, 흐름 좋다`;
  return '해설 보고 틀린 거 한 번만 더 풀어 보자';
};

export const praiseForAnswer = (combo: number) => {
  if (combo >= 5) return `${combo}연속 정답! 폼 미쳤다`;
  if (combo >= 3) return '연속 정답! 감 잡았다';
  return '정답!';
};

export const praiseForReview = (correct: number, total: number) => {
  if (total === 0) return '다시 볼 용어 생기면 여기 뜰 거야';
  if (correct === total) return '오늘 복습 올클!';
  if (correct > 0) return `${correct}개 다시 챙겼어. 헷갈린 건 다음에 또 보자`;
  return '헷갈린 용어는 다음에 한 번 더 보자';
};
