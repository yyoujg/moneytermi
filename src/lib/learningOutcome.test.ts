import { describe, expect, it } from 'vitest';
import { learningOutcomeFor } from './learningOutcome';

describe('learningOutcomeFor', () => {
  it('검증하지 않은 능력을 약속하지 않고 주제별 학습 내용을 안내한다', () => {
    expect(learningOutcomeFor({ category: '금리와 통화정책' })).toBe('금리와 물가를 설명하는 용어와 예시를 살펴봐요');
    expect(learningOutcomeFor({ category: '주식과 ETF' })).toBe('투자 상품을 설명하는 기본 용어를 살펴봐요');
    expect(learningOutcomeFor({ category: '경기·성장·국민소득' })).toBe('경기와 성장에 관한 용어를 살펴봐요');
    expect(learningOutcomeFor({ category: '재정·조세·사회보장' })).toBe('세금과 정부 지출에 관한 용어를 살펴봐요');
    expect(learningOutcomeFor({ category: '국제수지·무역·통상' })).toBe('무역과 국제 거래에 관한 용어를 살펴봐요');
  });

  it('주제 힌트가 없으면 첫 단어를 이용한다', () => {
    expect(learningOutcomeFor({ words: [{ word: '희소성' }] })).toBe('희소성의 뜻과 예시를 살펴봐요');
  });

  it('입력이 비어도 기본 문구를 반환한다', () => {
    expect(learningOutcomeFor({})).toBe('경제 용어의 뜻과 생활 속 예시를 살펴봐요');
  });
});

it('일부 단어보다 코스 분류를 우선해 전체 학습 내용을 안내한다', () => {
 expect(learningOutcomeFor({category:'경제 기초 개념',title:'경제 기초 개념 1',words:[{word:'규모의 경제'},{word:'단리'},{word:'복리'}]})).toBe('경제의 기본 용어를 생활 속 예시로 살펴봐요');
 expect(learningOutcomeFor({category:'가계·소비·부동산',words:[{word:'담보'},{word:'대출'}]})).toBe('주거 계약과 부동산에 관한 용어를 살펴봐요');
 expect(learningOutcomeFor({title:'경제 기초 개념',words:[{word:'단리'}]})).toBe('경제의 기본 용어를 생활 속 예시로 살펴봐요');
});
