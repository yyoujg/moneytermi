export const praiseForMission = ({ ready, completed }: { ready: number; completed: number }) => {
  if (ready > 0) return `${ready}개 미션 보상을 받을 수 있어요. 오늘 할 일을 이미 해냈어요.`;
  if (completed > 0) return `${completed}개 미션 완료. 작게 보여도 꾸준함이 쌓이고 있어요.`;
  return '하나씩 채우면 오늘의 성과가 바로 보여요.';
};

export const praiseForQuiz = ({ accuracy, maxCombo, total }: { accuracy: number; maxCombo: number; total: number }) => {
  if (total === 0) return '퀴즈가 준비되면 오늘 확인한 내용이 기록돼요.';
  if (accuracy === 100) return `${total}문제를 모두 맞혔어요. 바로 다음 단계로 가도 좋아요.`;
  if (accuracy >= 80) return `정답률 ${accuracy}%. 헷갈리는 부분만 조금 더 보면 돼요.`;
  if (maxCombo >= 3) return `${maxCombo}문제를 연속으로 맞혔어요. 흐름을 잘 이어갔어요.`;
  return '헷갈린 문제까지 다시 봤어요. 다음에 보면 더 익숙해질 거예요.';
};

export const praiseForAnswer = (combo: number) => {
  if (combo >= 5) return `${combo}연속 정답이에요`;
  if (combo >= 3) return '연속 정답이에요';
  return '정답이에요';
};

export const praiseForReview = (correct: number, total: number) => {
  if (total === 0) return '다시 볼 용어가 생기면 오늘 목록에 보여요.';
  if (correct === total) return '오늘 다시 볼 용어를 모두 확인했어요.';
  if (correct > 0) return `${correct}개를 다시 확인했어요. 헷갈린 용어는 다음에 한 번 더 볼게요.`;
  return '오늘 헷갈린 용어는 다음에 한 번 더 볼게요.';
};
