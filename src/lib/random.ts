export type RandomFn = () => number;

export const shuffle = <T,>(items: T[], rand: RandomFn = Math.random): T[] => {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    const current = out[i]!;
    out[i] = out[j]!;
    out[j] = current;
  }
  return out;
};

export const takeShuffled = <T,>(items: T[], count: number, rand: RandomFn = Math.random): T[] =>
  shuffle(items, rand).slice(0, count);
