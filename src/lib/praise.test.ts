import { describe, expect, it } from 'vitest';
import { praiseForAnswer, praiseForQuiz, praiseForReview } from './praise';

describe('praise copy', () => {
  it('praises perfect quiz results', () => {
    expect(praiseForQuiz({ accuracy: 100, maxCombo: 5, total: 3 })).toContain('모두 맞혔어요');
  });

  it('uses a light retry message for missed quiz results', () => {
    expect(praiseForQuiz({ accuracy: 40, maxCombo: 1, total: 5 })).toBe('헷갈린 문제까지 다시 봤어요. 다음에 보면 더 익숙해질 거예요.');
  });

  it('uses a clear correct-answer message', () => {
    expect(praiseForAnswer(1)).toBe('정답이에요');
  });

  it('praises review recall separately from new quizzes', () => {
    expect(praiseForReview(2, 3)).toContain('다시 확인했어요');
  });
});
