// PostgREST는 한 번에 1000행까지만 돌려준다. 짧은 페이지가 올 때까지 이어 받는다.
export const PAGE = 1000;

export const fetchAll = async <T,>(page: (from: number) => PromiseLike<{ data: T[] | null }>): Promise<{ data: T[] | null }> => {
  const all: T[] = [];
  for (let from = 0; ; from += PAGE) {
    const { data } = await page(from);
    if (!data) return { data: null };
    all.push(...data);
    if (data.length < PAGE) return { data: all };
  }
};
