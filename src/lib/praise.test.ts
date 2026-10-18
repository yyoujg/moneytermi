import { describe, expect, it } from 'vitest';
import { praiseForAnswer, praiseForMission, praiseForQuiz, praiseForReview } from './praise';

describe('praise copy', () => {
  it('connects claimable mission rewards to points without promising extra rewards', () => {
    expect(praiseForMission({ ready: 2, completed: 3 })).toBe('2개 미션 보상을 받을 수 있어요. 완료한 미션의 조개를 챙겨요.');
    expect(praiseForMission({ ready: 0, completed: 3 })).toBe('3개 미션 완료. 작게 보여도 꾸준함이 쌓이고 있어요.');
    expect(praiseForMission({ ready: 0, completed: 0 })).toBe('하나씩 채우면 오늘의 성과가 바로 보여요.');
  });

  it('praises perfect quiz results', () => {
    expect(praiseForQuiz({ accuracy: 100, maxCombo: 5, total: 3 })).toContain('모두 맞혔어요');
  });

  it('uses a light retry message for missed quiz results', () => {
    expect(praiseForQuiz({ accuracy: 40, maxCombo: 1, total: 5 })).toBe('헷갈린 문제까지 다시 봤어요. 차근차근 한 번 더 확인해요.');
  });

  it('uses a clear correct-answer message', () => {
    expect(praiseForAnswer(1)).toBe('정답이에요');
  });

  it('praises review recall separately from new quizzes', () => {
    expect(praiseForReview(2, 3)).toContain('다시 확인했어요');
  });
});
