import { GROWTH_STAGES, LEAGUE_DEMOTE_BOTTOM, LEAGUE_DEMOTE_MIN_PLAYERS, LEAGUE_PROMOTE_TOP } from '../constants';

// 리그 안내 항목. XP·티어 규칙은 여기 한 곳에만 둔다(앱 사용법 시트는 이 화면으로 연결).
// 에너지 규칙은 에너지 시트(EnergyShopContent)에만 둔다.
// 티어 이름·기준은 리그 화면과 같은 GROWTH_STAGES에서 만든다(이름이 따로 놀지 않게)
const RULES = [
  { title: '주간 순위', desc: '이번 주에 얻은 XP로 모든 참여자가 한 판에서 순위를 겨뤄요. 매주 월요일 0시에 끝나고 새로 시작해요.' },
  { title: '승급', desc: `한 주가 끝났을 때 ${LEAGUE_PROMOTE_TOP}위 안에 들면 다음 주에 한 단계 올라가요. 올라가면 앱에 들어올 때 알려 드려요.` },
  { title: '강등', desc: `참여자가 ${LEAGUE_DEMOTE_MIN_PLAYERS}명 이상인 주에는 하위 ${LEAGUE_DEMOTE_BOTTOM}명이 다음 주에 한 단계 내려가요. 그 주에 XP를 얻지 않으면 순위에 들지 않아 등급이 그대로예요.` },
  { title: '리그 티어', desc: `${GROWTH_STAGES.map(s => s.name).join(' → ')}. 모두 ${GROWTH_STAGES[0].name}부터 시작해요. 지금 등급은 리그 화면의 컬러 그림이에요.` },
  { title: 'XP 획득', desc: '새 용어 1 · 퀴즈 정답 2 · 출석 3 · 미션 보상 수령 5 XP. 학습으로만 쌓여요.' },
];

export const LeagueRules = () => (
  // 같은 카드 3개 대신 제목 + 본문을 구분선으로 나눈다
  <div className="flex flex-col">
    {RULES.map((item, i) => (
      <div key={item.title} className="border-b border-[var(--color-line)] py-4 last:border-0 anim-fade-up" style={{ '--i': i } as React.CSSProperties}>
        <p className="text-sm font-bold text-[var(--color-ink)] mb-1!">{item.title}</p>
        <p className="text-sm text-[var(--color-ink-3)] leading-relaxed break-keep">{item.desc}</p>
      </div>
    ))}
  </div>
);
