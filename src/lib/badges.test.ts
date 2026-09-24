import { describe, it, expect } from 'vitest';
import { BADGES, buildBadges, earnedCount } from './badges';

const S = (words = 0, streak = 0, xp = 0) => ({ words, streak, xp });

describe('buildBadges', () => {
  it('아무것도 안 했으면 하나도 못 받는다', () => {
    expect(earnedCount(S())).toBe(0);
  });

  it('기준을 채우면 획득, 못 채우면 미획득', () => {
    const b = buildBadges(S(10, 0, 0));
    expect(b.find(x => x.id === 'w10')?.earned).toBe(true);
    expect(b.find(x => x.id === 'w50')?.earned).toBe(false);
  });

  it('기준을 넘겨도 획득 상태를 유지한다', () => {
    expect(buildBadges(S(999, 0, 0)).filter(x => x.stat === 'words').every(x => x.earned)).toBe(true);
  });

  it('진행률은 0~1로 자른다', () => {
    const b = buildBadges(S(200, 0, 0));
    expect(b.every(x => x.progress >= 0 && x.progress <= 1)).toBe(true);
    expect(b.find(x => x.id === 'w1')?.progress).toBe(1);
  });

  it('스탯별로 독립적이다', () => {
    const b = buildBadges(S(0, 7, 0));
    expect(b.filter(x => x.earned).map(x => x.id)).toEqual(['s3', 's7']);
  });

  it('정의된 배지 개수만큼 돌려준다', () => {
    expect(buildBadges(S()).length).toBe(BADGES.length);
  });

  it('id가 중복되지 않는다', () => {
    expect(new Set(BADGES.map(b => b.id)).size).toBe(BADGES.length);
  });
});
