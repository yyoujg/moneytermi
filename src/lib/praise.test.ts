import { describe, expect, it } from 'vitest';
import { praiseForAnswer, praiseForMission, praiseForQuiz, praiseForReview } from './praise';

describe('praise copy', () => {
  it('connects claimable mission rewards to XP without promising extra rewards', () => {
    expect(praiseForMission({ ready: 2, completed: 3 })).toBe('보상 2개 대기 중. 받는 것까지 내가 해줄까?');
    expect(praiseForMission({ ready: 0, completed: 3 })).toBe('미션 3개 클리어. 입만 산 줄 알았는데 제법이네.');
    expect(praiseForMission({ ready: 0, completed: 0 })).toBe('계획 잘 들었어. 이제 하나 깨볼까?');
  });

  it('praises perfect quiz results', () => {
    expect(praiseForQuiz({ accuracy: 100, maxCombo: 5, total: 3 })).toContain('올클');
  });

  it('uses a light retry message for missed quiz results', () => {
    expect(praiseForQuiz({ accuracy: 40, maxCombo: 1, total: 5 })).toBe('정답은 도망 안 가. 해설 보고 다시 잡자.');
  });

  it('uses a clear correct-answer message', () => {
    expect(praiseForAnswer(1)).toBe('정답. 제법인데?');
  });

  it('praises review recall separately from new quizzes', () => {
    expect(praiseForReview(2, 3)).toContain('다시 챙겼어');
  });
});
