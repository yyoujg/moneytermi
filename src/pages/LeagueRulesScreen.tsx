import { ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { List, ListRow, Spacing } from '@toss/tds-mobile';
import { Card } from '../components/ui/Card';

const RULES = [
  { icon: '🌱', title: '캐릭터 성장', desc: '포인트를 모으면 캐릭터가 알개미 → 뽀시래기 → 왕개미 → 전투개미 → 슈퍼개미 순서로 자라요.' },
  { icon: '⚡', title: '포인트 획득', desc: '학습 완료, 퀴즈 정답, 미션 달성, 출석 시 포인트를 얻어요.' },
  { icon: '🎁', title: '친구 초대', desc: '친구를 초대하면 추가 포인트를 받을 수 있어요.' },
  { icon: '📺', title: '광고 시청', desc: '광고를 끝까지 보면 추가 포인트를 받을 수 있어요.' },
];

const LeagueRulesScreen = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col h-full bg-[var(--color-canvas)]">
      {/* 헤더 */}
      <div className="pt-4 px-5 pb-4 bg-[var(--color-card)]">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/league')}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-[var(--color-surface)]"
          >
            <ChevronLeft size={20} className="text-[var(--color-ink-2)]" />
          </button>
          <h2 className="text-base font-bold text-[var(--color-ink)]">캐릭터 키우기 안내</h2>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden">
        <Spacing size={20} />
        <div className="px-5">
          <Card pad="none" className="overflow-hidden">
            <List>
              {RULES.map(({ icon, title, desc }) => (
                <ListRow
                  key={title}
                  border="none"
                  left={<span className="text-2xl w-9 text-center shrink-0">{icon}</span>}
                  contents={
                    <ListRow.Texts
                      type="2RowTypeA"
                      top={<span className="text-[var(--color-ink)]">{title}</span>}
                      bottom={<span className="text-[var(--color-ink-3)]">{desc}</span>}
                    />
                  }
                />
              ))}
            </List>
          </Card>
        </div>
        <Spacing size={40} />
      </div>
    </div>
  );
};

export default LeagueRulesScreen;
