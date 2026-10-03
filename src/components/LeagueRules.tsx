import { GROWTH_STAGES } from '../constants';

// 리그 안내 항목. 마이페이지 '앱 사용법' 시트(GuideSheet)와 같은 카드 블록 스타일.
// 티어 이름·기준은 리그 화면과 같은 GROWTH_STAGES에서 만든다(이름이 따로 놀지 않게)
const RULES = [
  { title: '리그 티어', desc: `누적 XP로 올라가요. ${GROWTH_STAGES.map(s => `${s.name} ${s.minPoints}`).join(' · ')} XP.` },
  { title: 'XP 획득', desc: '새 단어 1 · 퀴즈 정답 2 · 출석 3 · 미션 보상 수령 5 XP. 학습으로만 쌓여요.' },
  { title: '주간 순위', desc: '이번 주에 얻은 XP로 순위를 매기고, 매주 월요일 0시에 초기화돼요.' },
  { title: '포인트', desc: '순위와 무관한 재화예요. 레슨 시작(10P)과 XP 2배 부스트(300P · 30분)에 써요. 퀴즈 정답·미션 보상·광고, 그리고 XP 50마다 +50P로 모아요.' },
];

export const LeagueRules = () => (
  <div className="flex flex-col gap-3">
    {RULES.map((item, i) => (
      <div key={item.title} className="bg-[var(--color-canvas)] rounded-card px-4 py-4 anim-fade-up" style={{ '--i': i } as React.CSSProperties}>
        <p className="text-sm font-bold text-[var(--color-ink)] mb-1.5!">{item.title}</p>
        <p className="text-sm text-[var(--color-ink-3)] leading-relaxed break-keep">{item.desc}</p>
      </div>
    ))}
  </div>
);
