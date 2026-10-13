export const praiseForHome = ({ knownCount, streak, dueCount }: { knownCount: number; streak: number; dueCount: number }) => {
  if (knownCount === 0) {
    return {
      title: '첫 시작도 이미 성과예요',
      body: '오늘 한 말만 봐도 경제 공부의 방향이 생겨요.',
    };
  }
  if (dueCount > 0) {
    return {
      title: '기억을 다시 잡을 차례예요',
      body: `이미 ${knownCount}개 말을 익혔고, 오늘은 ${dueCount}개만 다시 보면 돼요.`,
    };
  }
  if (streak >= 7) {
    return {
      title: `${streak}일째 이어가는 중이에요`,
      body: '짧게라도 계속 온 게 가장 큰 실력이에요.',
    };
  }
  return {
    title: '조금씩 쌓이고 있어요',
    body: `지금까지 ${knownCount}개 말을 생활 속 상황과 연결했어요.`,
  };
};

export const praiseForMission = ({ ready, completed }: { ready: number; completed: number }) => {
  if (ready > 0) return `${ready}개 미션 보상을 받을 수 있어요. 오늘 할 일을 이미 해냈어요.`;
  if (completed > 0) return `${completed}개 미션 완료. 작게 보여도 꾸준함이 쌓이고 있어요.`;
  return '하나씩 채우면 오늘의 성과가 바로 보여요.';
};

export const praiseForProgress = (known: number, total: number) => {
  if (total <= 0 || known <= 0) return '첫 칸을 여는 순간부터 공부가 시작돼요.';
  const pct = Math.round((known / total) * 100);
  if (pct >= 100) return '이 구간은 끝까지 해냈어요. 다음 주제로 넘어갈 준비가 됐어요.';
  if (pct >= 70) return `${pct}%까지 왔어요. 거의 다 왔고, 흐름도 잘 잡고 있어요.`;
  if (pct >= 35) return `${pct}% 진행 중. 어려운 말을 실제 상황으로 바꾸는 힘이 쌓이고 있어요.`;
  return `${known}개 확인 완료. 시작한 만큼 이미 앞으로 나아갔어요.`;
};

export const praiseForQuiz = ({ accuracy, maxCombo, total }: { accuracy: number; maxCombo: number; total: number }) => {
  if (total === 0) return '풀 문제를 준비하면 바로 성과가 쌓일 거예요.';
  if (accuracy === 100) return `${total}문제를 모두 맞혔어요. 오늘은 완전히 잡았어요.`;
  if (accuracy >= 80) return `정답률 ${accuracy}%. 핵심을 꽤 정확하게 잡고 있어요.`;
  if (maxCombo >= 3) return `${maxCombo}연속 정답을 만들었어요. 흐름이 붙고 있어요.`;
  return '틀린 문제까지 확인한 게 진짜 공부예요.';
};

export const praiseForAnswer = (combo: number) => {
  if (combo >= 5) return '좋아요! 계속 정답을 고르고 있어요';
  if (combo >= 3) return '좋아요! 연속으로 정답이에요';
  return '좋아요! 뜻을 잘 골랐어요';
};

export const praiseForReview = (correct: number, total: number) => {
  if (total === 0) return '다시 볼 말이 생기면 기억을 더 단단하게 만들 수 있어요.';
  if (correct === total) return '다시 봐도 기억났어요. 오래 남을 가능성이 커졌어요.';
  if (correct > 0) return `${correct}개를 다시 떠올렸어요. 헷갈린 말까지 잡으면 더 단단해져요.`;
  return '틀린 말도 오늘 다시 만났으니 다음엔 더 빨리 떠오를 거예요.';
};

export const praiseForProfile = ({ knownCount, streak, earnedBadges }: { knownCount: number; streak: number; earnedBadges: number }) => {
  if (knownCount >= 100) return '100개 넘게 쌓았어요. 이제 경제 문장이 훨씬 덜 낯설 거예요.';
  if (streak >= 7) return `${streak}일 연속 학습 중. 습관으로 바뀌고 있어요.`;
  if (earnedBadges >= 3) return `${earnedBadges}개 배지를 모았어요. 성과가 눈에 보이기 시작했어요.`;
  if (knownCount > 0) return `${knownCount}개 말을 익혔어요. 오늘의 작은 기록이 다음 이해를 도와줘요.`;
  return '첫 말을 익히면 여기에서 바로 성장 기록을 볼 수 있어요.';
};
