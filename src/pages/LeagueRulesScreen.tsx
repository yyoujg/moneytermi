import React from 'react';
import { ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { List, ListRow, Spacing } from '@toss/tds-mobile';

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
    <div className="flex flex-col h-full bg-[#F7F7F7]">
      {/* 헤더 */}
      <div className="pt-4 px-5 pb-4 bg-white">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/league')}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-[#F0F0F0]"
          >
            <ChevronLeft size={20} className="text-[#555555]" />
          </button>
          <h2 className="text-base font-bold text-[#111111]">리그 안내</h2>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden">
        <Spacing size={20} />
        <div className="px-5">
          <div className="bg-white rounded-2xl overflow-hidden">
            <List>
              {RULES.map(({ icon, title, desc }) => (
                <ListRow
                  key={title}
                  border="none"
                  left={<span className="text-2xl w-9 text-center shrink-0">{icon}</span>}
                  contents={
                    <ListRow.Texts
                      type="2RowTypeA"
                      top={<span className="text-[#111111]">{title}</span>}
                      bottom={<span className="text-[#888888]">{desc}</span>}
                    />
                  }
                />
              ))}
            </List>
          </div>
        </div>
        <Spacing size={40} />
      </div>
    </div>
  );
};

export default LeagueRulesScreen;
