// 1~3위도 이모지 메달 대신 숫자로 보여주고, 강조는 data-podium 스타일(금·은·동 원형 바탕)로 한다.
export const LeagueRankBadge = ({ rank }: { rank: number }) => (
  <span className="league-rank-badge" data-podium={rank >= 1 && rank <= 3 ? rank : undefined}>
    {rank}<span className="sr-only">위</span>
  </span>
);
