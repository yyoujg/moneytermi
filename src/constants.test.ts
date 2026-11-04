import { describe, it, expect } from 'vitest';
import { GROWTH_STAGES, getGrowthStage, LEAGUE_DEMOTE_BOTTOM, LEAGUE_DEMOTE_MIN_PLAYERS, LEAGUE_PROMOTE_TOP } from './constants';

describe('getGrowthStage', () => {
  it('다섯 단계의 식별자와 이름을 유지한다', () => {
    expect(GROWTH_STAGES.map(({ id, name }) => ({ id, name }))).toEqual([
      { id: 1, name: '돈알못' },
      { id: 2, name: '짠테크러' },
      { id: 3, name: '갓생러' },
      { id: 4, name: '재테크러' },
      { id: 5, name: '경제고수' },
    ]);
  });

  it('서버 단계 ID로 등급을 찾고, 모르는 값은 1단계로 둔다', () => {
    expect(getGrowthStage(3).name).toBe('갓생러');
    expect(getGrowthStage(0).id).toBe(1);
    expect(getGrowthStage(9).id).toBe(1);
  });

  it('승급·강등 기준은 서버 정산(league-weekly-promotion)과 같다', () => {
    expect(LEAGUE_PROMOTE_TOP).toBe(3);
    expect(LEAGUE_DEMOTE_BOTTOM).toBe(3);
    // 승급 3명과 강등 3명이 겹치지 않도록 7명부터 강등한다
    expect(LEAGUE_DEMOTE_MIN_PLAYERS).toBeGreaterThan(LEAGUE_PROMOTE_TOP + LEAGUE_DEMOTE_BOTTOM);
  });
});
