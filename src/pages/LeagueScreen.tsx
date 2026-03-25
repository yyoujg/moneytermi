import React, { useMemo } from 'react';
import { Info, Zap, Trophy, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { CURRENT_LEAGUE_ID, CURRENT_LEAGUE_NAME, INITIAL_LEAGUE_USERS, LEAGUE_TIERS } from '../constants';
import { useAppContext } from '../context/AppContext';

const RANK_MEDALS = ['🥇', '🥈', '🥉'];

const LeagueScreen = () => {
  const navigate = useNavigate();
  const { points } = useAppContext();

  const sortedLeague = useMemo(
    () => [...INITIAL_LEAGUE_USERS, { id: 'me', name: '나 (예비슈퍼개미)', points, emoji: '🍊' }]
      .sort((a, b) => b.points - a.points),
    [points]
  );

  const top3 = sortedLeague.slice(0, 3);
  const rest = sortedLeague.slice(3);
  const myRank = sortedLeague.findIndex((u) => u.id === 'me') + 1;
  const myEntry = sortedLeague.find((u) => u.id === 'me')!;
  const maxPoints = sortedLeague[0].points;

  // 승급/강등 기준 (상위 5명 승급, 하위 5명 강등)
  const total = sortedLeague.length;
  const promoteZone = 5;
  const demoteZone = 5;

  return (
    <div className="flex flex-col h-full bg-gray-50 relative pb-24 overflow-y-auto [&::-webkit-scrollbar]:hidden">

      {/* 헤더 */}
      <div className="bg-white pt-12 px-6 pb-5 border-b border-gray-100">
        <div className="flex justify-between items-center mb-1">
          <h2 className="text-xl font-bold text-gray-900">주간 리그</h2>
          <button
            onClick={() => navigate('/league/rules')}
            className="flex items-center gap-1 text-xs font-semibold text-gray-400 bg-gray-50 border border-gray-100 rounded-full px-3 py-1.5"
          >
            <Info size={13} /> 안내
          </button>
        </div>

        {/* 리그 단계 트랙 */}
        <div className="relative mb-5">
          <div className="flex justify-between items-start relative">
            <div className="absolute top-4 left-4 right-4 h-[3px] bg-gray-100 z-0 rounded-full">
              <div
                className="h-full bg-gradient-to-r from-orange-300 to-orange-500 rounded-full transition-all duration-1000"
                style={{ width: `${((CURRENT_LEAGUE_ID - 1) / (LEAGUE_TIERS.length - 1)) * 100}%` }}
              />
            </div>
            {LEAGUE_TIERS.map((tier) => {
              const isPast = tier.id < CURRENT_LEAGUE_ID;
              const isCurrent = tier.id === CURRENT_LEAGUE_ID;
              return (
                <div key={tier.id} className="flex flex-col items-center relative z-10 w-14">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300
                    ${isCurrent ? 'bg-orange-500 text-white shadow-lg ring-4 ring-orange-100 scale-110' :
                      isPast ? 'bg-orange-200 text-orange-600' :
                      'bg-white border-2 border-gray-200 text-gray-300'}`}
                  >
                    {isCurrent ? <Trophy size={14} /> : isPast ? '✓' : tier.id}
                  </div>
                  <span className={`text-[10px] font-bold text-center mt-1.5 leading-tight
                    ${isCurrent ? 'text-orange-500' : isPast ? 'text-orange-300' : 'text-gray-300'}`}>
                    {tier.name}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* 내 현황 카드 */}
        <div className="bg-gradient-to-br from-orange-500 to-orange-400 rounded-2xl p-4 text-white">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 bg-white/20 rounded-full flex items-center justify-center text-xl">🍊</div>
              <div>
                <p className="text-xs font-semibold text-orange-100">나 (예비슈퍼개미)</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <TrendingUp size={13} className="text-orange-100" />
                  <span className="text-xs text-orange-100 font-medium">
                    {myRank <= promoteZone ? '승급권' : myRank > total - demoteZone ? '강등권' : '유지권'}
                  </span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1 justify-end mb-0.5">
                <Zap size={14} className="fill-current text-yellow-200" />
                <span className="text-xl font-bold">{points}</span>
                <span className="text-xs text-orange-200 font-medium">P</span>
              </div>
              <span className="text-2xl font-bold">{myRank}<span className="text-sm font-semibold text-orange-100 ml-0.5">위</span></span>
            </div>
          </div>
          {/* 포인트 진행 바 */}
          <div className="mt-3">
            <div className="flex justify-between text-[10px] text-orange-100 mb-1">
              <span>0</span>
              <span>{maxPoints} P (1위)</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-white h-full rounded-full transition-all duration-700"
                style={{ width: `${Math.min((points / maxPoints) * 100, 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 랭킹 */}
      <div className="flex-1 px-5 pt-5">

        {/* TOP 3 podium */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-4">
          <div className="px-4 pt-4 pb-2">
            <p className="text-[11px] font-bold text-gray-400 mb-4 text-center tracking-wide">TOP 3</p>
            <div className="flex items-end justify-center gap-3 mb-4">
              {/* 2등 */}
              {top3[1] && (
                <div className="flex flex-col items-center flex-1">
                  <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center text-2xl border-2 border-gray-100 mb-1">{top3[1].emoji}</div>
                  <div className="w-full bg-gray-100 rounded-t-xl flex flex-col items-center py-3" style={{ height: 72 }}>
                    <span className="text-lg mb-0.5">🥈</span>
                    <p className="text-[10px] font-bold text-gray-600 truncate w-full text-center px-1">{top3[1].name}</p>
                    <p className="text-[10px] font-semibold text-gray-400">{top3[1].points}P</p>
                  </div>
                </div>
              )}
              {/* 1등 */}
              {top3[0] && (
                <div className="flex flex-col items-center flex-1">
                  <div className="w-14 h-14 bg-orange-50 rounded-full flex items-center justify-center text-3xl border-2 border-orange-200 mb-1">{top3[0].emoji}</div>
                  <div className="w-full bg-gradient-to-b from-orange-400 to-orange-500 rounded-t-xl flex flex-col items-center py-3" style={{ height: 88 }}>
                    <span className="text-xl mb-0.5">🥇</span>
                    <p className="text-[10px] font-bold text-white truncate w-full text-center px-1">{top3[0].name}</p>
                    <p className="text-[10px] font-semibold text-orange-100">{top3[0].points}P</p>
                  </div>
                </div>
              )}
              {/* 3등 */}
              {top3[2] && (
                <div className="flex flex-col items-center flex-1">
                  <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center text-2xl border-2 border-gray-100 mb-1">{top3[2].emoji}</div>
                  <div className="w-full bg-gray-100 rounded-t-xl flex flex-col items-center py-3" style={{ height: 60 }}>
                    <span className="text-lg mb-0.5">🥉</span>
                    <p className="text-[10px] font-bold text-gray-600 truncate w-full text-center px-1">{top3[2].name}</p>
                    <p className="text-[10px] font-semibold text-gray-400">{top3[2].points}P</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 전체 순위 리스트 */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-4">
          {sortedLeague.map((u, i) => {
            const rank = i + 1;
            const isMe = u.id === 'me';
            const isPromote = rank <= promoteZone;
            const isDemote = rank > total - demoteZone;

            return (
              <div
                key={u.id}
                className={`flex items-center px-4 py-3 border-b border-gray-50 last:border-0
                  ${isMe ? 'bg-orange-50' : ''}
                `}
              >
                {/* 순위 */}
                <div className="w-8 shrink-0 text-center">
                  {rank <= 3
                    ? <span className="text-base">{RANK_MEDALS[rank - 1]}</span>
                    : <span className={`text-sm font-bold ${isMe ? 'text-orange-500' : 'text-gray-400'}`}>{rank}</span>
                  }
                </div>

                {/* 아바타 */}
                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-lg ml-2 shrink-0 border ${isMe ? 'bg-orange-100 border-orange-200' : 'bg-gray-50 border-gray-100'}`}>
                  {u.emoji}
                </div>

                {/* 이름 */}
                <div className="flex-1 mx-3 min-w-0">
                  <p className={`text-sm font-semibold truncate ${isMe ? 'text-orange-600' : 'text-gray-800'}`}>
                    {u.name}
                    {isMe && <span className="ml-1.5 text-[10px] font-bold bg-orange-500 text-white px-1.5 py-0.5 rounded-full">나</span>}
                  </p>
                  {isPromote && <span className="text-[10px] font-bold text-green-500">▲ 승급권</span>}
                  {isDemote && <span className="text-[10px] font-bold text-red-400">▼ 강등권</span>}
                </div>

                {/* 포인트 */}
                <div className="flex items-center gap-1 shrink-0">
                  <Zap size={12} className={`fill-current ${isMe ? 'text-orange-500' : 'text-gray-300'}`} />
                  <span className={`text-sm font-bold ${isMe ? 'text-orange-600' : 'text-gray-700'}`}>{u.points}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};

export default LeagueScreen;
