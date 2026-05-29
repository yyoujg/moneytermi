import { describe, it, expect } from 'vitest';
import { parseLandingPath } from './App';

describe('parseLandingPath', () => {
  it('null/undefined/빈 문자열 → null', () => {
    expect(parseLandingPath(null)).toBeNull();
    expect(parseLandingPath(undefined)).toBeNull();
    expect(parseLandingPath('')).toBeNull();
    expect(parseLandingPath('   ')).toBeNull();
  });

  it('scheme URI의 pathname을 추출한다', () => {
    expect(parseLandingPath('apps-in-toss://moneytermi/quiz')).toBe('/quiz');
  });

  it('중첩 path도 pathname으로 매칭', () => {
    expect(parseLandingPath('apps-in-toss://moneytermi/league/rules')).toBe('/league/rules');
  });

  it('쿼리스트링은 무시', () => {
    expect(parseLandingPath('apps-in-toss://moneytermi/quiz?courseId=xxx')).toBe('/quiz');
  });

  it('ALLOWED에 없는 경로는 null', () => {
    expect(parseLandingPath('apps-in-toss://moneytermi/unknown')).toBeNull();
  });

  it('host가 라우트 토큰인 경우 (host-as-route)', () => {
    expect(parseLandingPath('apps-in-toss://quiz')).toBe('/quiz');
  });

  it('host + pathname 조합이 host 단독보다 우선', () => {
    expect(parseLandingPath('apps-in-toss://league/rules')).toBe('/league/rules');
  });

  it('쿼리 파라미터 path= 백워드 호환', () => {
    expect(parseLandingPath('apps-in-toss://moneytermi/?path=/home')).toBe('/home');
  });

  it('hash fragment 백워드 호환', () => {
    expect(parseLandingPath('apps-in-toss://moneytermi/#/home')).toBe('/home');
  });

  it('raw path 직접 입력', () => {
    expect(parseLandingPath('/home')).toBe('/home');
  });

  it('루트 슬래시만 있으면 null (default route 보존)', () => {
    expect(parseLandingPath('apps-in-toss://moneytermi/')).toBeNull();
  });

  it('제거된 ALLOWED 경로는 null', () => {
    expect(parseLandingPath('apps-in-toss://moneytermi/word-card')).toBeNull();
    expect(parseLandingPath('apps-in-toss://moneytermi/course/words')).toBeNull();
  });

  it('출시 전 테스트 스킴 intoss-private (host=appsintoss) pathname 매칭', () => {
    expect(parseLandingPath('intoss-private://appsintoss/quiz?_deploymentId=0198c000-68c3-7d2b-0000-2c00000005ec')).toBe('/quiz');
    expect(parseLandingPath('intoss-private://appsintoss/league/rules?_deploymentId=0198c000-68c3-7d2b-0000-2c00000005ec')).toBe('/league/rules');
  });

  it('출시 후 운영 스킴 intoss (host=appName) pathname 매칭', () => {
    expect(parseLandingPath('intoss://moneytermi/quiz')).toBe('/quiz');
    expect(parseLandingPath('intoss://moneytermi/league/rules')).toBe('/league/rules');
  });

  it('테스트 스킴 path 없이 home만 (appsintoss 단독) → null (home 폴백)', () => {
    expect(parseLandingPath('intoss-private://appsintoss?_deploymentId=0198c000-68c3-7d2b-0000-2c00000005ec')).toBeNull();
  });
});
