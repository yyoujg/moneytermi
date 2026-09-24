import { BottomSheet } from '@toss/tds-mobile';

const FAQ_ITEMS = [
  { q: '포인트는 어디에 쓰고 어떻게 얻나요?', a: '레슨을 시작할 때 10P가 들어요(퀴즈·복습은 무료). 퀴즈 정답 10~20P, 미션 보상 10~50P, XP 50마다 +50P, 광고 시청으로 모을 수 있어요. 처음 시작하면 100P를 드려요.' },
  { q: '복습은 어떻게 작동하나요?', a: '"오늘 복습할 단어"만 골라서 보여줘요. 자주 틀리는 단어는 자주, 익숙한 단어는 점점 뜸하게 나오는 간격 반복 방식이에요. 홈의 복습 카드로 시작할 수 있어요.' },
  { q: '리그 순위는 어떻게 결정되나요?', a: '이번 주에 학습으로 얻은 XP 순이에요(새 단어 1 · 퀴즈 정답 2 · 출석 3 · 미션 5 XP). 매주 월요일 0시에 초기화돼요. 포인트는 순위와 무관해요.' },
  { q: '다크 모드를 쓸 수 있나요?', a: '마이페이지 > 테마 설정에서 시스템/라이트/다크 중에 고를 수 있어요.' },
  { q: '학습 기록은 어디에 저장되나요?', a: '토스 계정에 연결된 프로필로 서버에 저장돼요. 앱을 지웠다 깔거나 기기를 바꿔도 같은 토스 계정이면 이어서 학습할 수 있어요.' },
  { q: '앱 사용법이 궁금해요', a: '홈의 패스에서 다음 노드를 누르면 단어 3~5개를 배우고, 퀴즈·복습 노드로 익혀요. 앞 코스를 끝내야 다음 코스가 열려요. 매일 들어오면 출석 미션도 채워져요.' },
];

export const GuideSheet = ({ open, onClose }: { open: boolean; onClose: () => void }) => (
  <BottomSheet open={open} onDimmerClick={onClose} header={<span style={{ paddingLeft: '20px', fontWeight: 700, color: 'var(--color-ink)' }}>앱 사용법 & FAQ</span>}>
    <div className="px-5 pb-6 flex flex-col gap-3">
      {FAQ_ITEMS.map((item, i) => (
        <div key={i} className="bg-[var(--color-canvas)] rounded-card px-4 py-4">
          <p className="text-sm font-bold text-[var(--color-ink)] mb-1.5!">Q. {item.q}</p>
          <p className="text-xs text-[var(--color-ink-3)] leading-relaxed">{item.a}</p>
        </div>
      ))}
    </div>
  </BottomSheet>
);
