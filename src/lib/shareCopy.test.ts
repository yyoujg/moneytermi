import { describe, expect, it } from 'vitest';
import { shareMessage } from './shareCopy';

describe('실제 달성 결과로만 공유 문구 선택', () => {
  it('10문제 중 9개를 맞힌 경우에만 한 문제 오답을 말한다', () => {
    const message = shareMessage({ kind: 'quiz', total: 10, correct: 9 });
    expect(message).toBe('머니터미 10문제 중 9개 정답.\n하나 틀렸다고 좋아하지 마.\n일단 네 점수부터 보자.');
    expect(shareMessage({ kind: 'quiz', total: 10, correct: 8 })).not.toContain('하나 틀렸다고');
  });
  it('만점·낮은 점수·빈 결과를 과장하지 않는다', () => {
    expect(shareMessage({ kind: 'quiz', total: 10, correct: 10 })).toContain('틀린 문제 설명해주려 했는데. 없네.');
    expect(shareMessage({ kind: 'quiz', total: 10, correct: 3 })).toContain('10문제 중 3개 정답.');
    expect(shareMessage({ kind: 'quiz', total: 10, correct: 3 })).not.toContain('없네');
    expect(shareMessage({ kind: 'quiz', total: 0, correct: 0 })).toContain('아직 시작 전');
  });
  it('일수·미션명·획득 XP·리그·새 배지를 그대로 넣는다', () => {
    expect(shareMessage({ kind: 'streak', days: 13 })).toContain('머니터미 13일 연속 출석.');
    expect(shareMessage({ kind: 'quest', mission: '새 단어 5개 배우기', xp: 5 })).toContain('새 단어 5개 배우기 완료. +5 XP.');
    expect(shareMessage({ kind: 'league', league: '꼼꼼이' })).toContain('꼼꼼이 승급.');
    expect(shareMessage({ kind: 'badge', badges: ['첫 단어', '3일 연속'] })).toContain('새 배지 2개. 첫 단어 · 3일 연속도 받음.');
  });
});
