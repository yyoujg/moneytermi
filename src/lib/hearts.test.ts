import { describe, it, expect } from 'vitest';
import { MAX_HEARTS, REGEN_MS, FULL, regen, spend, msUntilNext } from './hearts';

const T0 = 1_700_000_000_000;

describe('regen', () => {
  it('만충이면 그대로 유지', () => {
    expect(regen(FULL, T0)).toEqual({ hearts: MAX_HEARTS, updatedAt: T0 });
  });

  it('2.5회분 경과 → 2개 회복, 자투리 시간 보존', () => {
    const s = { hearts: 0, updatedAt: T0 };
    const r = regen(s, T0 + REGEN_MS * 2.5);
    expect(r.hearts).toBe(2);
    expect(r.updatedAt).toBe(T0 + REGEN_MS * 2);
  });

  it('회복분 미만 경과 → 변화 없음', () => {
    const s = { hearts: 1, updatedAt: T0 };
    expect(regen(s, T0 + REGEN_MS - 1)).toEqual(s);
  });

  it('상한을 넘지 않는다', () => {
    expect(regen({ hearts: 1, updatedAt: T0 }, T0 + REGEN_MS * 100).hearts).toBe(MAX_HEARTS);
  });

  it('같은 상태에 두 번 적용해도 결과가 같다 (앱 재시작 멱등)', () => {
    const s = { hearts: 0, updatedAt: T0 };
    const now = T0 + REGEN_MS * 3.2;
    expect(regen(regen(s, now), now)).toEqual(regen(s, now));
  });

  it('시계가 뒤로 가면 updatedAt을 현재로 클램프', () => {
    const s = { hearts: 2, updatedAt: T0 };
    expect(regen(s, T0 - 10_000)).toEqual({ hearts: 2, updatedAt: T0 - 10_000 });
  });
});

describe('spend', () => {
  it('만충에서 소모하면 그 시점부터 회복 타이머 시작', () => {
    expect(spend(FULL, T0)).toEqual({ hearts: MAX_HEARTS - 1, updatedAt: T0 });
  });

  it('0이면 null', () => {
    expect(spend({ hearts: 0, updatedAt: T0 }, T0)).toBeNull();
  });

  it('0이어도 회복 시간이 지났으면 소모된다', () => {
    const r = spend({ hearts: 0, updatedAt: T0 }, T0 + REGEN_MS);
    expect(r?.hearts).toBe(0);
  });

  it('연속 소모로 0까지 떨어진다', () => {
    let s = FULL;
    for (let i = 0; i < MAX_HEARTS; i++) s = spend(s, T0)!;
    expect(s.hearts).toBe(0);
    expect(spend(s, T0)).toBeNull();
  });
});

describe('msUntilNext', () => {
  it('만충이면 0', () => {
    expect(msUntilNext(FULL, T0)).toBe(0);
  });

  it('소모 직후면 한 주기', () => {
    expect(msUntilNext(spend(FULL, T0)!, T0)).toBe(REGEN_MS);
  });

  it('절반 지났으면 남은 절반', () => {
    expect(msUntilNext({ hearts: 1, updatedAt: T0 }, T0 + REGEN_MS / 2)).toBe(REGEN_MS / 2);
  });
});
