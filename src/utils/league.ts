// 본인을 포함한 리그에서 내 순위(1-based)를 계산
export const calculateRank = (others: { points: number }[], myPoints: number): number => {
  const league = [...others, { id: 'me', points: myPoints }].sort((a, b) => b.points - a.points);
  return league.findIndex(u => (u as { id?: string }).id === 'me') + 1;
};
