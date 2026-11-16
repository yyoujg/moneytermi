import { describe, expect, it } from 'vitest';
import content from './content.json';
import sections from './wordVisualSections.json';
import { buildCourseContent } from '../lib/courseContent';

const words = buildCourseContent(content.words, [], []).allWords;
const visuals = words.flatMap(word => (word.visuals ?? [])
  .filter(visual => visual.type === 'table' || visual.type === 'line')
  .map(visual => ({ word, visual, key: `${word.id}:${visual.title}` })));

describe('전체 단어의 학습 자료 배치', () => {
  it('모든 표와 그래프를 한 화면에만 배치하고 삭제되거나 이름이 바뀐 자료를 남기지 않는다', () => {
    const assigned = [...sections.connections, ...sections.extras];
    expect(new Set(assigned).size).toBe(assigned.length);
    expect(new Set(visuals.map(item => item.key)).size).toBe(visuals.length);
    expect(assigned.sort()).toEqual(visuals.map(item => item.key).sort());
  });

  it('전체 단어의 표에는 빈 제목·빈 행 이름·열 개수 불일치가 없다', () => {
    for (const { visual, key } of visuals) {
      expect(visual.title.trim(), key).not.toBe('');
      if (visual.type !== 'table') continue;
      expect(visual.rows.length, key).toBeGreaterThan(0);
      for (const row of visual.rows) {
        expect(row.length, key).toBe(visual.columns.length);
        expect(row[0].trim(), key).not.toBe('');
      }
    }
  });

  it('계산 사례와 개념 비교를 제목의 단어만으로 분류하지 않는다', () => {
    expect(sections.extras).toContain('1174:72의 법칙 vs 실제 계산');
    expect(sections.extras).toContain('1014:가격별 수요량 비교');
    expect(sections.extras).toContain('266:기회비용으로 따져 보기');
    expect(sections.extras).toContain('1025:식과 그래프');
    expect(sections.connections).toContain('1023:개별 vs 시장수요곡선');
    expect(sections.connections).toContain('1048:효용과 관련된 말');
    expect(sections.connections).toContain('241:햄버거 수요는 어떻게 움직일까');
    expect(sections.connections).toContain('167:100만 원을 연 10%로 10년 맡기면');
  });
});
