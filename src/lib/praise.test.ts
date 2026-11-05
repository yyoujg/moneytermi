import { describe, expect, it } from 'vitest';
import { praiseForAnswer, praiseForMission, praiseForQuiz, praiseForReview } from './praise';

describe('praise copy', () => {
  it('connects claimable mission rewards to XP without promising extra rewards', () => {
    expect(praiseForMission({ ready: 2, completed: 3 })).toBe('보상 2개 받을 수 있어! 얼른 챙기자');
    expect(praiseForMission({ ready: 0, completed: 3 })).toBe('미션 3개 클리어. 꾸준함 미쳤다');
    expect(praiseForMission({ ready: 0, completed: 0 })).toBe('하나씩 깨면 오늘 성과가 바로 보여');
  });

  it('praises perfect quiz results', () => {
    expect(praiseForQuiz({ accuracy: 100, maxCombo: 5, total: 3 })).toContain('올클');
  });

  it('uses a light retry message for missed quiz results', () => {
    expect(praiseForQuiz({ accuracy: 40, maxCombo: 1, total: 5 })).toBe('해설 보고 틀린 거 한 번만 더 풀어 보자');
  });

  it('uses a clear correct-answer message', () => {
    expect(praiseForAnswer(1)).toBe('정답!');
  });

  it('praises review recall separately from new quizzes', () => {
    expect(praiseForReview(2, 3)).toContain('다시 챙겼어');
  });
});
