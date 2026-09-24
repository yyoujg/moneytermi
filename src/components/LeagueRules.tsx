import { List, ListRow } from '@toss/tds-mobile';
import { Trophy, Sparkles, Zap, CalendarDays } from 'lucide-react';

const RULES = [
  { Icon: Trophy, title: '리그 티어', desc: 'XP를 모으면 브론즈 → 실버 → 골드 → 플래티넘 → 다이아 순서로 티어가 올라가요.' },
  { Icon: Sparkles, title: 'XP 획득', desc: '새 단어 1 · 퀴즈 정답 2 · 출석 3 · 미션 보상 수령 5 XP. 학습으로만 쌓여요.' },
  { Icon: CalendarDays, title: '주간 순위', desc: '이번 주에 얻은 XP로 순위를 매기고, 매주 월요일 0시에 초기화돼요.' },
  { Icon: Zap, title: '포인트', desc: '순위와 무관한 재화예요. 미션·퀴즈·광고·초대로 모아 XP 2배 부스트(300P · 30분)에 써요.' },
];

export const LeagueRules = () => (
  <List>
    {RULES.map(({ Icon, title, desc }) => (
      <ListRow
        key={title}
        border="none"
        left={<span className="w-9 flex justify-center shrink-0 text-brand-500"><Icon size={22} /></span>}
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
);
