import { BottomSheet } from '@toss/tds-mobile';

const FAQ_ITEMS = [
  { q: '앱은 어떻게 쓰나요?', a: '홈에서 궁금한 주제를 자유롭게 고르세요. 주제 안에서는 용어 3~5개씩 순서대로 살펴봐요. 설명을 읽은 기록과 문제를 맞힌 결과는 구분해 안내해요. 준비된 상황 문제로 이해를 확인하고, 퀘스트의 ‘오늘 다시 볼 용어’에서 기억을 확인해요. 다시 볼 용어가 있을 때 복습 카드가 나타나요.' },
  { q: '학습할 때 무엇이 필요한가요?', a: '새 레슨과 코스 퀴즈를 처음 시작할 때 에너지 1을 써요. 조개는 필요하지 않아요. 완료한 레슨과 복습은 무료이고, 같은 기기에 시작 기록이 남아 있으면 중단한 레슨도 무료로 이어가요. 에너지는 1시간마다 1씩 회복돼요.' },
  { q: '조개는 어디에 쓰고 어떻게 얻나요?', a: '번개 아이콘은 에너지를 뜻해요. 조개는 원하는 경우 에너지 충전과 XP 부스트에 써요. 퀴즈 정답, 미션 보상, XP 보너스, 광고 시청으로 모을 수 있어요.' },
  { q: '리그 순위는 어떻게 결정되나요?', a: '이번 주에 학습으로 얻은 XP 순이에요(새 용어 1 · 퀴즈 정답 2 · 출석 3 · 미션 5 XP). 매주 월요일 0시에 초기화돼요. 조개는 순위와 무관해요.' },
  { q: '다시 보기는 어떻게 작동하나요?', a: '오늘 익힌 용어가 잊히기 전에 다시 물어봐요. 틀린 용어와 밀린 용어를 작은 묶음으로 먼저 보여주고, 맞힌 용어는 점점 더 긴 간격으로 다시 나와요.' },
  { q: '다크 모드를 쓸 수 있나요?', a: '마이페이지 > 앱 설정 > 테마에서 시스템/라이트/다크 중에 고를 수 있어요.' },
  { q: '학습 기록은 어디에 저장되나요?', a: '토스 계정에 연결된 프로필로 서버에 저장돼요. 앱을 지웠다 깔거나 기기를 바꿔도 같은 토스 계정이면 이어서 학습할 수 있어요.' },
];

export const GuideSheet = ({ open, onClose }: { open: boolean; onClose: () => void }) => (
  <BottomSheet open={open} onDimmerClick={onClose} header={<span style={{ paddingLeft: '20px', fontWeight: 700, color: 'var(--color-ink)' }}>앱 사용법 & FAQ</span>}>
    <div className="px-5 pb-6 flex flex-col gap-3">
      {FAQ_ITEMS.map((item, i) => (
        <div key={i} className="bg-[var(--color-canvas)] rounded-card px-4 py-4 anim-fade-up" style={{ '--i': i } as React.CSSProperties}>
          <p className="text-sm font-bold text-[var(--color-ink)] mb-1.5!">Q. {item.q}</p>
          <p className="text-xs text-[var(--color-ink-3)] leading-relaxed">{item.a}</p>
        </div>
      ))}
    </div>
  </BottomSheet>
);
