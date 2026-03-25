import React, { useMemo, useState } from 'react';
import { Info, XCircle, Zap } from 'lucide-react';
import { Button } from '@toss/tds-mobile';
import { CURRENT_LEAGUE_ID, CURRENT_LEAGUE_NAME, INITIAL_LEAGUE_USERS, LEAGUE_TIERS } from '../constants';
import { useAppContext } from '../context/AppContext';

const LeagueScreen = () => {
  const { points } = useAppContext();
  const [showRules, setShowRules] = useState(false);
  const sortedLeague = useMemo(
    () => [...INITIAL_LEAGUE_USERS, { id: 'me', name: '나 (예비슈퍼개미)', points, emoji: '🍊' }].sort((a, b) => b.points - a.points),
    [points]
  );
  const top3 = sortedLeague.slice(0, 3);
  const myRank = sortedLeague.findIndex((u) => u.id === 'me') + 1;
  return (
    <div className="flex flex-col h-full bg-gray-50 relative pb-24 overflow-y-auto [&::-webkit-scrollbar]:hidden">
      <div className="bg-white pt-12 px-6 pb-6 border-b border-gray-200 relative z-20">
        <div className="flex justify-between items-center mb-1">
          <h2 className="text-xl font-bold text-gray-900">주간 리그</h2>
          <Button size="small" variant="weak" onClick={() => setShowRules(true)}><Info size={16} className="mr-1" />안내</Button>
        </div>
        <p className="text-gray-500 text-xs font-medium mb-6">{CURRENT_LEAGUE_NAME} 리그 42조</p>
        <div className="mb-8 relative px-2">
          <div className="absolute top-4 left-6 right-6 h-[2px] bg-gray-100 z-0">
            <div className="h-full bg-orange-400 transition-all duration-1000" style={{ width: `${((CURRENT_LEAGUE_ID - 1) / (LEAGUE_TIERS.length - 1)) * 100}%` }} />
          </div>
          <div className="flex justify-between relative z-10">
            {LEAGUE_TIERS.map((tier, index) => (
              <div key={tier.id} className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold mb-2 transition-all duration-300 ${tier.id === CURRENT_LEAGUE_ID ? 'bg-orange-500 text-white shadow-md ring-4 ring-orange-50' : tier.id < CURRENT_LEAGUE_ID ? 'bg-orange-100 text-orange-500' : 'bg-white border-2 border-gray-100 text-gray-300'}`}>
                  {index + 1}
                </div>
                <span className="text-[10px] whitespace-nowrap">{tier.name}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-gray-50 rounded-2xl p-4 flex justify-between items-center border border-gray-100">
          <div>
            <p className="text-[11px] text-gray-400 mb-1 font-bold">내 순위</p>
            <div className="flex items-baseline"><span className="text-2xl font-bold text-gray-900">{myRank}</span><span className="text-xs text-gray-500 ml-0.5 font-medium">위</span></div>
          </div>
          <div className="text-right">
            <p className="text-[11px] text-gray-400 mb-1 font-bold">보유 포인트</p>
            <span className="text-lg font-bold text-gray-900 flex items-center justify-end"><Zap size={16} className="text-orange-500 mr-1 fill-current" /> {points}</span>
          </div>
        </div>
      </div>
      <div className="flex-1 p-5 pt-6 relative z-10">
        <div className="bg-white rounded-2xl pt-5 pb-6 px-4 mb-6 border border-gray-200">
          <h3 className="text-[11px] font-bold text-gray-400 mb-6 text-center">🏆 현재 상위 3명</h3>
          <div className="flex flex-col gap-2">
            {top3.map((u, i) => (
              <div key={u?.id ?? i} className="bg-gray-50 rounded-xl px-3 py-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="mr-3 text-xs font-bold text-gray-500">{i + 1}</span>
                    <div className="w-10 h-10 rounded-full bg-white border border-gray-100 flex items-center justify-center text-lg">{u?.emoji}</div>
                    <span className="ml-3 text-sm font-medium text-gray-700">{u?.name}</span>
                  </div>
                  <span className="text-sm font-bold text-gray-900">{u?.points}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      {showRules && (
        <div className="fixed inset-0 bg-gray-900/40 z-[100] flex items-center justify-center p-6">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-lg font-bold text-gray-900">리그 안내</h3>
              <button onClick={() => setShowRules(false)} className="text-gray-400 hover:text-gray-800 p-1"><XCircle size={20} /></button>
            </div>
            <Button display="block" onClick={() => setShowRules(false)}>확인</Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeagueScreen;
