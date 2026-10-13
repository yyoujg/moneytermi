import { describe, expect, it } from 'vitest';
import { praiseForAnswer, praiseForHome, praiseForProgress, praiseForQuiz, praiseForReview } from './praise';

describe('praise copy', () => {
  it('shows a clear first-start message before any word is learned', () => {
    expect(praiseForHome({ knownCount: 0, streak: 0, dueCount: 0 }).title).toContain('첫 시작');
  });

  it('celebrates finished course progress', () => {
    expect(praiseForProgress(10, 10)).toContain('끝까지 해냈어요');
  });

  it('praises perfect quiz results', () => {
    expect(praiseForQuiz({ accuracy: 100, maxCombo: 5, total: 3 })).toContain('모두 맞혔어요');
  });

  it('uses a clear correct-answer message', () => {
    expect(praiseForAnswer(1)).toBe('좋아요! 뜻을 잘 골랐어요');
  });

  it('praises review recall separately from new quizzes', () => {
    expect(praiseForReview(2, 3)).toContain('다시 떠올렸어요');
  });
});
