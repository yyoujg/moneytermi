import { describe, expect, it } from 'vitest';
import { keepShortUnitsTogether } from './formatText';

describe('keepShortUnitsTogether', () => {
  it('keeps money units on the same visual chunk', () => {
    expect(keepShortUnitsTogether('가격은 3천 원이고 1천 원이에요.'))
      .toBe('가격은 3천\u00a0원이고 1천\u00a0원이에요.');
  });

  it('keeps short metric units together without changing other spaces', () => {
    expect(keepShortUnitsTogether('정답률 80 %, 보상 5 XP, 포인트 10 P'))
      .toBe('정답률 80\u00a0%, 보상 5\u00a0XP, 포인트 10\u00a0P');
  });

  it('keeps common count units together', () => {
    expect(keepShortUnitsTogether('오늘은 3 문제 중 2 개를 맞혔어요.'))
      .toBe('오늘은 3\u00a0문제 중 2\u00a0개를 맞혔어요.');
  });
});
