import { describe, it, expect } from 'vitest';
import { GROWTH_STAGES, getGrowthStage, isDefaultNickname, LEAGUE_DEMOTE_BOTTOM, LEAGUE_DEMOTE_MIN_PLAYERS, LEAGUE_PROMOTE_TOP } from './constants';

describe('isDefaultNickname', () => {
  it.each([undefined, null, '', '  ', '새친구', '예비슈퍼개미', '따뜻한올빼미959', '침착한비버699', ' 성실한너구리100 ', '단단한고래999'])('%j는 닉네임 변경 안내 대상이다', nickname => {
    expect(isDefaultNickname(nickname)).toBe(true);
  });

  it.each(['아리', '아리123', '따뜻한수달', '따뜻한수달99', '따뜻한수달099', '따뜻한수달1000', '귀여운수달123', '따뜻한아리123', '내따뜻한수달123', '따뜻한수달123님'])('%j는 자동 생성형 이름으로 판단하지 않는다', nickname => {
    expect(isDefaultNickname(nickname)).toBe(false);
  });
});

describe('getGrowthStage', () => {
  it('열 단계의 식별자와 이름을 유지한다', () => {
    expect(GROWTH_STAGES.map(({ id, name }) => `${id}:${name}`)).toEqual([
      '1:텅장러', '2:꼼꼼이', '3:짠돌이', '4:꿀꿀이', '5:갓생러', '6:뉴스광', '7:개미', '8:존버장인', '9:건물주', '10:회장님',
    ]);
  });

  it('서버 단계 ID로 등급을 찾고, 모르는 값은 1단계로 둔다', () => {
    expect(getGrowthStage(3).name).toBe('짠돌이');
    expect(getGrowthStage(0).id).toBe(1);
    expect(getGrowthStage(11).id).toBe(1);
  });

  it('승급·강등 기준은 서버 정산(league-weekly-promotion)과 같다', () => {
    expect(LEAGUE_PROMOTE_TOP).toBe(3);
    expect(LEAGUE_DEMOTE_BOTTOM).toBe(3);
    // 승급 3명과 강등 3명이 겹치지 않도록 7명부터 강등한다
    expect(LEAGUE_DEMOTE_MIN_PLAYERS).toBeGreaterThan(LEAGUE_PROMOTE_TOP + LEAGUE_DEMOTE_BOTTOM);
  });
});
