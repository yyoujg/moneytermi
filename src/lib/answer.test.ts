import { describe, it, expect } from 'vitest';
import { answerMatches } from './answer';

describe('answerMatches', () => {
  it('기본 일치(공백·대소문자 무시)', () => {
    expect(answerMatches(' 연금저축 ', '연금저축')).toBe(true);
    expect(answerMatches('ETF', 'ETF')).toBe(true);
    expect(answerMatches('etf', 'ETF')).toBe(true);
  });

  it('괄호 안 약어도 정답 인정', () => {
    expect(answerMatches('국내총생산', '국내총생산(GDP)')).toBe(true);
    expect(answerMatches('GDP', '국내총생산(GDP)')).toBe(true);
    expect(answerMatches('gdp', '국내총생산(GDP)')).toBe(true);
    expect(answerMatches('예대마진', '예대금리차(예대마진)')).toBe(true);
  });

  it('슬래시 분해 항목 각각 정답 인정', () => {
    expect(answerMatches('간접세', '간접세/직접세')).toBe(true);
    expect(answerMatches('직접세', '간접세/직접세')).toBe(true);
    expect(answerMatches('명목금리', '명목금리/실질금리')).toBe(true);
  });

  it('오답은 거부', () => {
    expect(answerMatches('오답', '국내총생산(GDP)')).toBe(false);
    expect(answerMatches('', '연금저축')).toBe(false);
    expect(answerMatches('가계', '간접세/직접세')).toBe(false);
  });
});
