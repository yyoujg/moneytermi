/// <reference types="node" />
import { describe, expect, it } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';

const source = resolve('public/otter/v3/icon-sources');
const names = readdirSync(source).filter(name => name.endsWith('.svg')).sort();

describe('원형 파스텔 앱 그림 23종', () => {
  it('역할 20종과 재화 2종, 배지 제목 1종을 제공한다', () => {
    expect(names).toHaveLength(23);
    expect(names).toEqual(expect.arrayContaining(['book.svg', 'calendar.svg', 'shell.svg', 'fish.svg', 'badge-earned.svg']));
  });
  it('같은 원형 바탕과 크기를 쓰고 외부 자료·글자·그림자를 넣지 않는다', () => {
    for (const name of names) {
      const svg = readFileSync(resolve(source, name), 'utf8');
      expect(svg).toContain('width="256" height="256" viewBox="0 0 100 100"');
      expect(svg).toContain('<circle cx="50" cy="50" r="48"');
      expect(svg).not.toMatch(/<(?:script|text|image|filter|foreignObject)\b|\b(?:href|xlink:href)\s*=/i);
    }
  });
  it('재화와 배지 제목도 기존 연결 경로에 256픽셀 투명 지원 그림으로 존재한다', () => {
    for (const file of ['items/shell.png', 'items/fish.png', 'celebrations/badge-earned.png']) {
      const bytes = readFileSync(resolve('public/otter/v3', file));
      expect([...bytes.subarray(0, 8)]).toEqual([137, 80, 78, 71, 13, 10, 26, 10]);
      expect(bytes.readUInt32BE(16)).toBe(256);
      expect(bytes.readUInt32BE(20)).toBe(256);
      expect(bytes[25]).toBe(6);
    }
  });
});

describe('에너지를 뜻하는 둥근 번개', () => {
  it('기존 경로·23종 규격을 유지하고 표정 없는 번개 그림을 쓴다', () => {
    const svg = readFileSync(resolve(source, 'fish.svg'), 'utf8');
    expect(svg).toContain('fill="#E8DFF5"');
    expect(svg).toContain('fill="#F5AD3D"');
    expect(svg).toContain('fill="#E89723"');
    expect(svg).not.toContain('#91CDF1');
    expect(svg).not.toContain('#F2A9B7');
    expect(svg).not.toMatch(/<(?:filter|image|linearGradient|radialGradient)\b/);
  });
});
