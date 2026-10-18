import { describe, expect, it } from 'vitest';
import { additionalMeaning } from './learningText';

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
