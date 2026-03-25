import React from 'react';
import { ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const RULES = [
  { icon: '📅', title: '리그 기간', desc: '매주 월요일 00:00에 초기화돼요.' },
  { icon: '▲', title: '승급 조건', desc: '매주 상위 5명은 다음 리그로 승급해요.' },
  { icon: '▼', title: '강등 조건', desc: '매주 하위 5명은 이전 리그로 강등돼요.' },
  { icon: '⚡', title: '포인트 획득', desc: '학습 완료, 퀴즈 정답, 미션 달성 시 포인트를 얻어요.' },
  { icon: '🏆', title: '리그 단계', desc: '알개미 → 뽀시래기 → 왕개미 → 전투개미 → 슈퍼개미 순서로 올라가요.' },
];

const LeagueRulesScreen = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <div className="pt-12 px-5 pb-4 bg-white border-b border-gray-100">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/league')}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-50 border border-gray-100">
            <ChevronLeft size={20} className="text-gray-600" />
          </button>
          <h2 className="text-base font-bold text-gray-900">리그 안내</h2>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pt-5 pb-24 [&::-webkit-scrollbar]:hidden">
        <div className="flex flex-col gap-3">
          {RULES.map(({ icon, title, desc }) => (
            <div key={title} className="bg-white rounded-2xl border border-gray-100 p-4 flex items-start gap-4 shadow-sm">
              <span className="text-2xl shrink-0">{icon}</span>
              <div>
                <p className="text-sm font-bold text-gray-900 mb-1">{title}</p>
                <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LeagueRulesScreen;
