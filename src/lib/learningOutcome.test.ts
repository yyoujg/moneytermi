import { describe, expect, it } from 'vitest';
import { learningOutcomeFor } from './learningOutcome';

describe('learningOutcomeFor', () => {
  it('주제에 맞는 할 수 있는 일을 반환한다', () => {
    expect(learningOutcomeFor({ category: '금리와 통화정책' })).toBe('금리와 물가가 대출·저축에 주는 영향을 읽을 수 있어요');
    expect(learningOutcomeFor({ category: '주식과 ETF' })).toBe('투자 상품 얘기가 나와도 장단점을 구분할 수 있어요');
    expect(learningOutcomeFor({ category: '경기·성장·국민소득' })).toBe('경기와 성장 흐름을 이해할 수 있어요');
    expect(learningOutcomeFor({ category: '재정·조세·사회보장' })).toBe('세금과 정부 돈 이야기를 내 생활과 연결할 수 있어요');
    expect(learningOutcomeFor({ category: '국제수지·무역·통상' })).toBe('무역과 국제 거래 흐름을 이해할 수 있어요');
  });

  it('주제 힌트가 없으면 첫 단어를 이용한다', () => {
    expect(learningOutcomeFor({ words: [{ word: '희소성' }] })).toBe('희소성 같은 말을 실제 상황에서 알아볼 수 있어요');
  });

  it('입력이 비어도 기본 문구를 반환한다', () => {
    expect(learningOutcomeFor({})).toBe('어려운 경제 말을 생활 속 상황과 연결할 수 있어요');
  });
});
