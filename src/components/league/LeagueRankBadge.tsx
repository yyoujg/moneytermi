const PODIUM_PALETTES = [
  { background: '#F8EDCE', main: '#F5AD3D', shade: '#E89723' },
  { background: '#D6F1E4', main: '#76C8A5', shade: '#5EAD8E' },
  { background: '#E8DFF5', main: '#AC97CF', shade: '#9480B8' },
] as const;

// 세 순위는 같은 메달 형태와 숫자 위치를 공유한다. 실제 순위 값은 변경하지 않는다.
export const LeagueRankBadge = ({ rank }: { rank: number }) => {
  const palette = PODIUM_PALETTES[rank - 1];
  return (
    <span className="league-rank-badge" data-podium={palette ? rank : undefined}>
      {palette && (
        <svg className="league-rank-symbol" data-style="pastel-object" viewBox="0 0 100 100" width="40" height="40" fill="none" aria-hidden="true" focusable="false">
          <g data-rank-shape="medal">
            <circle cx="50" cy="50" r="48" fill={palette.background} />
            <path d="M29 18H40C42 18 43 19 44 21L57 44L44 49L28 22C27 20 27 18 29 18Z" fill={palette.main} />
            <path d="M60 18H71C73 18 73 20 72 22L56 49L43 44L56 21C57 19 58 18 60 18Z" fill={palette.shade} />
            <circle cx="50" cy="55" r="25" fill={palette.main} />
            <path d="M50 30a25 25 0 0 1 0 50v-7a18 18 0 0 0 0-36v-7Z" fill={palette.shade} />
            <circle data-rank-face cx="50" cy="55" r="18" fill="#FFFBF3" />
          </g>
        </svg>
      )}
      <span className={palette ? 'league-rank-value' : undefined}>{rank}</span><span className="sr-only">위</span>
    </span>
  );
};
