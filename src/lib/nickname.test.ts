import { describe, it, expect } from 'vitest';
import { randomNickname } from './nickname';

describe('randomNickname', () => {
  it('형용사+명사+세자리 숫자', () => {
    expect(randomNickname(() => 0)).toBe('성실한너구리100');
  });

  it('난수가 상한에 가까워도 범위를 벗어나지 않는다', () => {
    const n = randomNickname(() => 0.999999);
    expect(n).toMatch(/^[가-힣]+[1-9]\d{2}$/);
  });

  it('숫자는 항상 100~999', () => {
    for (const r of [0, 0.5, 0.9999]) {
      const num = Number(randomNickname(() => r).match(/\d+$/)![0]);
      expect(num).toBeGreaterThanOrEqual(100);
      expect(num).toBeLessThanOrEqual(999);
    }
  });

  it('10자 이하 (닉네임 입력 상한과 같음)', () => {
    for (let i = 0; i < 200; i++) expect(randomNickname().length).toBeLessThanOrEqual(10);
  });

  it('충분히 다양하다', () => {
    const s = new Set(Array.from({ length: 300 }, () => randomNickname()));
    expect(s.size).toBeGreaterThan(200);
  });
});
