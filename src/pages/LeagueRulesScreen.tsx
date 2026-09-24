import { Spacing } from '@toss/tds-mobile';
import { LeagueRules } from '../components/LeagueRules';

// 딥링크(/league/rules)용. 리그 화면 안에서는 같은 내용을 바텀시트로 띄운다.
const LeagueRulesScreen = () => (
  <div className="flex flex-col h-full bg-[var(--color-canvas)]">
    <div className="pt-4 px-5 pb-4 bg-[var(--color-card)]">
      <h2 className="text-base font-bold text-[var(--color-ink)]">리그 안내</h2>
    </div>
    <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden">
      <Spacing size={20} />
      <div className="px-5">
        <LeagueRules />
      </div>
      <Spacing size={40} />
    </div>
  </div>
);

export default LeagueRulesScreen;
