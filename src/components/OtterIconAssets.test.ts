/// <reference types="node" />
import { describe, expect, it } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';

const folder = resolve('public/otter/v3/icons');
const files = readdirSync(folder).filter(name => name.endsWith('.png')).sort();

describe('수달과 같은 부드러운 역할 그림 원본', () => {
  it('20종을 중복 없이 제공한다', () => {
    expect(files).toHaveLength(20);
    const sources = files.map(name => readFileSync(resolve(folder, name)).toString('base64'));
    expect(new Set(sources).size).toBe(20);
  });

  it.each(files)('%s는 256픽셀 투명 지원 PNG다', name => {
    const data = readFileSync(resolve(folder, name));
    expect([...data.subarray(0, 8)]).toEqual([137, 80, 78, 71, 13, 10, 26, 10]);
    expect(data.readUInt32BE(16)).toBe(256);
    expect(data.readUInt32BE(20)).toBe(256);
    expect(data[25]).toBe(6);
  });
});
