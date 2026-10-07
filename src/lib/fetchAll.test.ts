import { describe, it, expect } from 'vitest';
import { fetchAll } from './fetchAll';

describe('fetchAll', () => {
  it('1000행 경계를 넘어 이어 받는다', async () => {
    const rows = Array.from({ length: 1001 }, (_, i) => i);
    const calls: number[] = [];
    const { data } = await fetchAll(async from => { calls.push(from); return { data: rows.slice(from, from + 1000) }; });
    expect(data).toHaveLength(1001);
    expect(calls).toEqual([0, 1000]);
  });
  it('응답이 없으면 null', async () => {
    expect((await fetchAll(async () => ({ data: null }))).data).toBeNull();
  });
});
