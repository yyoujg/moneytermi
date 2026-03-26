import React, { useMemo, useState } from 'react';
import { Info, Zap, Trophy, TrendingUp, TrendingDown, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { TextButton, List, ListRow, Badge, Spacing } from '@toss/tds-mobile';
import { CURRENT_LEAGUE_ID, LEAGUE_TIERS } from '../constants';
import { useAppContext } from '../context/AppContext';
import { useAuth } from '../hooks/useAuth';
import GuestLinkSheet from '../components/GuestLinkSheet';

const RANK_MEDALS = ['🥇', '🥈', '🥉'];

const LeagueScreen = () => {
  const navigate = useNavigate();
  const { points, otherLeagueUsers } = useAppContext();
  const { isGuest, linkAccount } = useAuth();
  const [showLinkSheet, setShowLinkSheet] = useState(false);
  const [linkDismissed, setLinkDismissed] = useState(false);

  const sortedLeague = useMemo(
    () => [...otherLeagueUsers, { id: 'me', name: '나 (예비슈퍼개미)', points, emoji: '🍊' }]
      .sort((a, b) => b.points - a.points),
    [otherLeagueUsers, points]
  );

  const top3 = sortedLeague.slice(0, 3);
  const myRank = sortedLeague.findIndex((u) => u.id === 'me') + 1;
  const total = sortedLeague.length;
  const promoteZone = 5;
  const demoteZone = 5;

  // 경쟁 심리: 바로 위 2명 + 아래 1명
  const myIndex = sortedLeague.findIndex(u => u.id === 'me');
  const aboveUser = myIndex > 0 ? sortedLeague[myIndex - 1] : null;
  const above2User = myIndex > 1 ? sortedLeague[myIndex - 2] : null;
  const belowUser = myIndex < sortedLeague.length - 1 ? sortedLeague[myIndex + 1] : null;
  const pointsToAbove = aboveUser ? aboveUser.points - points : 0;
  const pointsToAbove2 = above2User ? above2User.points - points : 0;
  const pointsAboveBelow = belowUser ? points - belowUser.points : 0;

  return (
    <div className="flex flex-col h-full bg-[#0B0B0B]">
      {showLinkSheet && (
        <GuestLinkSheet
          onClose={() => { setShowLinkSheet(false); setLinkDismissed(true); }}
          onLink={(email) => { linkAccount(email); setLinkDismissed(true); }}
        />
      )}

      {/* 헤더 */}
      <div className="bg-[#161616] pt-12 px-5 pb-5">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-white">주간 리그</h2>
          <TextButton size="small" onClick={() => navigate('/league/rules')}>
            <span className="flex items-center gap-1"><Info size={13} />안내</span>
          </TextButton>
        </div>

        {/* 내 현황 강조 */}
        <div className="bg-[#0B0B0B] rounded-2xl p-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-500/10 rounded-full flex items-center justify-center text-xl">🍊</div>
              <div>
                <p className="text-sm font-bold text-white">예비슈퍼개미</p>
                <p className="text-xs text-[#555555]">{LEAGUE_TIERS.find(t => t.id === CURRENT_LEAGUE_ID)?.name} 리그</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-[#555555] mb-0.5">현재 순위</p>
              <p className="text-2xl font-bold text-orange-500">{myRank}위</p>
            </div>
          </div>

          {/* 위 2명 + 아래 */}
          <div className="flex flex-col gap-1.5">
            {aboveUser && (
              <div className="rounded-xl px-3 py-2.5 flex items-center justify-between" style={{ backgroundColor: '#0A1F0E' }}>
                <div className="flex items-center gap-2">
                  <TrendingUp size={13} className="text-green-500 shrink-0" />
                  <span className="text-xs text-[#777777] truncate max-w-[120px]">{aboveUser.name}</span>
                </div>
                <span className="text-sm font-bold text-green-400">+{pointsToAbove}P → {myRank - 1}위</span>
              </div>
            )}
            {above2User && (
              <div className="rounded-xl px-3 py-2.5 flex items-center justify-between bg-[#161616]">
                <div className="flex items-center gap-2">
                  <TrendingUp size={13} className="text-[#555555] shrink-0" />
                  <span className="text-xs text-[#555555] truncate max-w-[120px]">{above2User.name}</span>
                </div>
                <span className="text-sm font-bold text-[#777777]">+{pointsToAbove2}P → {myRank - 2}위</span>
              </div>
            )}
            {belowUser && myRank > total - 5 && (
              <div className="rounded-xl px-3 py-2.5 flex items-center justify-between" style={{ backgroundColor: '#1F0A0C' }}>
                <div className="flex items-center gap-2">
                  <TrendingDown size={13} className="text-red-400 shrink-0" />
                  <span className="text-xs text-[#777777]">강등 위험</span>
                </div>
                <span className="text-sm font-bold text-red-400">-{pointsAboveBelow}P면 강등</span>
              </div>
            )}
          </div>
        </div>

        {/* 리그 단계 트랙 */}
        <div className="relative">
          <div className="flex justify-between items-start relative">
            <div className="absolute top-4 left-4 right-4 h-[2px] bg-[#1E1E1E] z-0 rounded-full">
              <div
                className="h-full bg-orange-500 rounded-full transition-all duration-1000"
                style={{ width: `${((CURRENT_LEAGUE_ID - 1) / (LEAGUE_TIERS.length - 1)) * 100}%` }}
              />
            </div>
            {LEAGUE_TIERS.map((tier) => {
              const isPast = tier.id < CURRENT_LEAGUE_ID;
              const isCurrent = tier.id === CURRENT_LEAGUE_ID;
              return (
                <div key={tier.id} className="flex flex-col items-center relative z-10 w-14">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all
                    ${isCurrent ? 'bg-orange-500 text-white scale-110' :
                      isPast ? 'bg-[#2A2A2A] text-[#777777]' :
                      'bg-[#1E1E1E] text-[#555555]'}`}
                  >
                    {isCurrent ? <Trophy size={13} /> : isPast ? '✓' : tier.id}
                  </div>
                  <span className={`text-[10px] font-medium text-center mt-1.5 leading-tight
                    ${isCurrent ? 'text-orange-500' : isPast ? 'text-[#555555]' : 'text-[#333333]'}`}>
                    {tier.name}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 랭킹 — 스크롤 영역 */}
      <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden px-5 pt-4 pb-24">

        {/* 게스트 연결 유도 */}
        {isGuest && !linkDismissed && (
          <div className="relative rounded-2xl px-4 pt-3 pb-4 mb-3" style={{ backgroundColor: '#110C04' }}>
            <button
              onClick={() => setLinkDismissed(true)}
              className="absolute top-2.5 right-2.5 w-6 h-6 flex items-center justify-center rounded-full bg-[#2A2A2A] active:opacity-70 opacity-40"
            >
              <X size={12} className="text-[#555555]" />
            </button>
            <p className="text-base font-bold text-orange-400 pr-8 mb-0.5">🔥 {points}P + {myRank}위 유지</p>
            <p className="text-xs text-[#555555]">⚠️ 삭제 시 전부 사라짐</p>
            <div className="h-5" />
            <button
              onClick={() => setShowLinkSheet(true)}
              className="w-full py-2.5 rounded-xl bg-orange-500 text-xs font-bold text-white active:opacity-90"
            >
              🔥 지금 저장하기
            </button>
          </div>
        )}

        {/* TOP 3 podium */}
        <div className="bg-[#161616] rounded-2xl overflow-hidden mb-3">
          <div className="px-4 pt-4 pb-3">
            <p className="text-[11px] font-medium text-[#555555] mb-4 text-center tracking-widest uppercase">Top 3</p>
            <div className="flex items-end justify-center gap-3 mb-2">
              {top3[1] && (
                <div className="flex flex-col items-center flex-1">
                  <div className="w-11 h-11 bg-[#1E1E1E] rounded-full flex items-center justify-center text-xl mb-1">{top3[1].emoji}</div>
                  <div className="w-full bg-[#1E1E1E] rounded-t-xl flex flex-col items-center py-3" style={{ height: 68 }}>
                    <span className="text-base mb-0.5">🥈</span>
                    <p className="text-[10px] font-bold text-[#ABABAB] truncate w-full text-center px-1">{top3[1].name}</p>
                    <p className="text-[10px] font-medium text-[#555555]">{top3[1].points}P</p>
                  </div>
                </div>
              )}
              {top3[0] && (
                <div className="flex flex-col items-center flex-1">
                  <div className="w-13 h-13 bg-orange-500/10 rounded-full flex items-center justify-center text-2xl mb-1 p-2.5">{top3[0].emoji}</div>
                  <div className="w-full bg-orange-500 rounded-t-xl flex flex-col items-center py-3" style={{ height: 84 }}>
                    <span className="text-lg mb-0.5">🥇</span>
                    <p className="text-[10px] font-bold text-white truncate w-full text-center px-1">{top3[0].name}</p>
                    <p className="text-[10px] font-medium text-orange-200">{top3[0].points}P</p>
                  </div>
                </div>
              )}
              {top3[2] && (
                <div className="flex flex-col items-center flex-1">
                  <div className="w-11 h-11 bg-[#1E1E1E] rounded-full flex items-center justify-center text-xl mb-1">{top3[2].emoji}</div>
                  <div className="w-full bg-[#1E1E1E] rounded-t-xl flex flex-col items-center py-3" style={{ height: 56 }}>
                    <span className="text-base mb-0.5">🥉</span>
                    <p className="text-[10px] font-bold text-[#ABABAB] truncate w-full text-center px-1">{top3[2].name}</p>
                    <p className="text-[10px] font-medium text-[#555555]">{top3[2].points}P</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 전체 순위 */}
        <div className="bg-[#161616] rounded-2xl overflow-hidden mb-3">
          <List>
            {sortedLeague.map((u, i) => {
              const rank = i + 1;
              const isMe = u.id === 'me';
              const isPromote = rank <= promoteZone;
              const isDemote = rank > total - demoteZone;

              return (
                <ListRow
                  key={u.id}
                  border="none"
                  style={
                    isMe ? { backgroundColor: '#1A1208' }
                    : undefined
                  }
                  left={
                    <div className="w-8 text-center shrink-0">
                      {rank <= 3
                        ? <span className="text-base">{RANK_MEDALS[rank - 1]}</span>
                        : <span className={`text-sm font-bold ${isMe ? 'text-orange-500' : 'text-[#555555]'}`}>{rank}</span>
                      }
                    </div>
                  }
                  contents={
                    <div className="flex items-center gap-2 min-w-0">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center text-lg shrink-0 ${isMe ? 'bg-orange-500/15' : 'bg-[#1E1E1E]'}`}>
                        {u.emoji}
                      </div>
                      <div className="min-w-0">
                        <p className={`text-sm font-semibold truncate ${isMe ? 'text-orange-500' : 'text-white'}`}>
                          {u.name}
                          {isMe && <Badge color="yellow" size="small" variant="fill" className="ml-1.5">나</Badge>}
                        </p>
                        <div className="flex items-center gap-1.5">
                          {isPromote && !isMe && <span className="text-[10px] font-bold text-green-500">▲ 승급권</span>}
                          {isDemote && !isPromote && !isMe && <span className="text-[10px] font-bold text-red-400">▼ 강등권</span>}
                          {isMe && aboveUser && (
                            <span className="text-[10px] font-bold text-green-400">+{pointsToAbove}P → {myRank - 1}위</span>
                          )}
                          {isMe && isDemote && !aboveUser && (
                            <span className="text-[10px] font-bold text-red-400">강등 위험</span>
                          )}
                        </div>
                      </div>
                    </div>
                  }
                  right={
                    <div className="flex items-center gap-1 shrink-0">
                      <Zap size={12} className={`fill-current ${isMe ? 'text-orange-500' : 'text-[#555555]'}`} />
                      <span className={`text-sm font-bold ${isMe ? 'text-orange-500' : 'text-[#ABABAB]'}`}>{u.points}</span>
                    </div>
                  }
                />
              );
            })}
          </List>
        </div>

        {/* 승급/강등 안내 */}
        <div className="flex gap-2 mb-4">
          <div className="flex-1 flex items-center gap-2 bg-[#161616] rounded-xl px-3 py-2.5">
            <div className="w-2 h-2 rounded-full bg-green-500 shrink-0" />
            <span className="text-[11px] text-[#555555]">상위 {promoteZone}명 승급</span>
          </div>
          <div className="flex-1 flex items-center gap-2 bg-[#161616] rounded-xl px-3 py-2.5">
            <div className="w-2 h-2 rounded-full bg-red-400 shrink-0" />
            <span className="text-[11px] text-[#555555]">하위 {demoteZone}명 강등</span>
          </div>
        </div>

        <Spacing size={8} />
      </div>

    </div>
  );
};

export default LeagueScreen;
