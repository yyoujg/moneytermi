export type ShareKind = 'quiz' | 'streak' | 'quest' | 'league' | 'badge';

export type Achievement =
  | { kind: 'quiz'; total: number; correct: number; words?: string[] }
  | { kind: 'streak'; days: number }
  | { kind: 'quest'; mission: string; xp: number }
  | { kind: 'league'; league: string }
  | { kind: 'badge'; badges: string[] };

export const shareMessage = (achievement: Achievement): string => {
  switch (achievement.kind) {
    case 'quiz': {
      const { total, correct, words = [] } = achievement;
      const result = total === 0
        ? '아직 시작 전. 먼저 한 판 해볼까?'
        : correct === total
          ? '틀린 문제 설명해주려 했는데. 없네.\n일단 네 점수부터 보자.'
          : correct > 0 && total - correct === 1
            ? '하나 틀렸다고 좋아하지 마.\n일단 네 점수부터 보자.'
            : correct / total >= 0.8
              ? '캡처해도 네 점수 되는 건 아님.\n일단 네 점수부터 보자.'
              : '일단 내 점수는 공개했어.\n네 점수는 언제 보여줄 건데?';
      const learned = words.length ? `\n오늘 본 용어: ${words.slice(0, 3).join(' · ')}.` : '';
      return `머니터미 ${total}문제 중 ${correct}개 정답.\n${result}${learned}`;
    }
    case 'streak':
      return `머니터미 ${achievement.days}일 연속 출석.\n너 시작하면 알려줘.\n그날도 나 출석할 거니까.`;
    case 'quest':
      return `${achievement.mission} 완료. +${achievement.xp} XP.\n고민에도 XP 줬으면 네가 이겼을 텐데.\n아쉽다.`;
    case 'league':
      return `${achievement.league} 승급. 위에서 기다릴게.\n기다려준댔지 내려가 준댔냐.`;
    case 'badge':
      return `새 배지 ${achievement.badges.length}개. ${achievement.badges.join(' · ')}도 받음.\n부러우면 말해.\n한 번 더 보여줄게.`;
  }
};

// 정적 OG에는 개인 기록을 넣지 않는다. 실제 수치는 공유 메시지에 표시한다.
export const SHARE_OG_COPY = {
  quiz: { title: ['점수는 봤고', '도전은 언제?'], subtitle: '읽고 넘기면 내가 이긴 걸로 알게.', button: '이기러 가기' },
  streak: { title: ['내일부터?', '그 말 어제도 들음'], subtitle: '나는 벌써 출석했어. 네 내일은 언제 와?', button: '오늘은 진짜 함' },
  quest: { title: ['고민은 네가', 'XP는 내가'], subtitle: '계획 잘 들었어. 난 끝났고.', button: '나도 끝내러 감' },
  league: { title: ['아직 거기야?', '난 올라왔는데'], subtitle: '올라오면 인사해. 아는 척해줄게.', button: '곧 따라잡음' },
  badge: { title: ['이거 없지?', '난 또 생김'], subtitle: '구경할 시간 줄게. 충분히 봐.', button: '나도 따러 감' },
} satisfies Record<ShareKind, { title: string[]; subtitle: string; button: string }>;
