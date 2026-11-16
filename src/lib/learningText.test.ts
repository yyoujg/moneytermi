import { describe, expect, it } from 'vitest';
import { additionalMeaning, spokenDefinition } from './learningText';

describe('말풍선의 용어 뜻', () => {
  it('명사형 뜻을 받침에 맞게 자연스러운 말투로 끝맺는다', () => {
    expect(spokenDefinition('원금에만 이자가 붙는 이자 계산 방식')).toBe('원금에만 이자가 붙는 이자 계산 방식이에요.');
    expect(spokenDefinition('포기한 대안 중 가장 큰 가치')).toBe('포기한 대안 중 가장 큰 가치예요.');
    expect(spokenDefinition('실제로 살 돈과 의사가 있는 수요')).toBe('실제로 살 돈과 의사가 있는 수요예요.');
  });
  it('이미 말하는 문장은 유지하고 명사형 문장만 바꾼다', () => {
    expect(spokenDefinition('매매가격 대비 보증금의 비율. 높을수록 보증금이 집값에 가까워져요')).toBe('매매가격 대비 보증금의 비율이에요. 높을수록 보증금이 집값에 가까워져요.');
    expect(spokenDefinition('이자를 다시 계산해요.')).toBe('이자를 다시 계산해요.');
    expect(spokenDefinition('어떻게 계산할까요?')).toBe('어떻게 계산할까요?');
  });
  it('괄호 설명과 숫자·소수점이 있는 수식을 보존한다', () => {
    expect(spokenDefinition('여러 번 쓸 수 있는 전지(배터리)')).toBe('여러 번 쓸 수 있는 전지예요. (배터리)');
    expect(spokenDefinition('단순 계산은 대출금 ÷ 예금 × 100')).toBe('단순 계산은 대출금 ÷ 예금 × 100이에요.');
    expect(spokenDefinition('비율 2.5')).toBe('비율 2.5예요.');
    expect(spokenDefinition('')).toBe('');
  });
});

describe('상세 뜻의 중복 문장', () => {
  it('중복 정의에 붙은 이에요까지 걷어내 자연스러운 추가 설명을 남긴다', () => {
    expect(additionalMeaning('평균 비용이 낮아지는 현상', '평균 비용이 낮아지는 현상이에요. 설비 비용을 나누기 때문이에요.')).toBe('설비 비용을 나누기 때문이에요.');
  });
  it('추가 내용 없이 같은 뜻만 반복하면 빈 상세를 반환한다', () => {
    expect(additionalMeaning('함께 쓰는 상품', '함께 쓰는 상품입니다.')).toBe('');
    expect(additionalMeaning('같은 뜻', '같은 뜻')).toBe('');
  });
  it('이미 끝난 문장과 문단 경계를 처리한다', () => {
    expect(additionalMeaning('한 문장.', '한 문장. 다음 설명.')).toBe('다음 설명.');
    expect(additionalMeaning('짧은 뜻', '짧은 뜻\n\n추가 설명')).toBe('추가 설명');
  });
  it('문장 중간 접두사가 같아도 원문을 훼손하지 않는다', () => {
    expect(additionalMeaning('생산요소', '생산요소를 늘리면 달라져요.')).toBe('생산요소를 늘리면 달라져요.');
    expect(additionalMeaning('상품', '상품으로, 함께 사용해요.')).toBe('상품으로, 함께 사용해요.');
  });
  it('소수점을 문장 끝으로 오해해 잘라내지 않는다', () => {
    expect(additionalMeaning('비율 2', '비율 2.5를 기준으로 해요.')).toBe('비율 2.5를 기준으로 해요.');
  });
  it('다른 표현의 상세 뜻과 빈 핵심 뜻은 그대로 보존한다', () => {
    expect(additionalMeaning('핵심 뜻', '다른 표현으로 설명해요.')).toBe('다른 표현으로 설명해요.');
    expect(additionalMeaning('', ' 자세한 설명 ')).toBe('자세한 설명');
  });
});
