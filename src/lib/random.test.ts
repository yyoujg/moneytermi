import { describe, expect, it } from 'vitest';
import { shuffle, takeShuffled } from './random';

describe('shuffle', () => {
  it('returns a shuffled copy without mutating the source', () => {
    const source = [1, 2, 3];
    const result = shuffle(source, () => 0);

    expect(result).toEqual([2, 3, 1]);
    expect(source).toEqual([1, 2, 3]);
  });

  it('takes a shuffled prefix', () => {
    expect(takeShuffled([1, 2, 3, 4], 2, () => 0)).toEqual([2, 3]);
  });
});
