import { BottomSheet } from '@toss/tds-mobile';

const FAQ_ITEMS = [
  { q: '포인트는 어떻게 얻나요?', a: '퀴즈와 복습에서 정답을 맞히면 10~20P를 획득해요. 초성 힌트를 안 쓰면 더 많이, 연속 정답 시 보너스가 붙어요!' },
  { q: '복습은 어떻게 작동하나요?', a: '"오늘 복습할 단어"만 골라서 보여줘요. 자주 틀리는 단어는 자주, 익숙한 단어는 점점 뜸하게 나오는 간격 반복 방식이에요. 홈의 복습 카드로 시작할 수 있어요.' },
  { q: '실천 탭은 뭔가요?', a: '배운 개념을 행동으로 옮기는 체크리스트예요. 단어 카드의 "실천하기"로 항목을 담거나 직접 추가하고, 실천 탭에서 체크하면 돼요.' },
  { q: '리그 순위는 어떻게 결정되나요?', a: '보유 포인트 순으로 순위가 정해져요. 매주 초기화되니 꾸준히 풀어보세요.' },
  { q: '다크 모드를 쓸 수 있나요?', a: '마이페이지 > 테마 설정에서 시스템/라이트/다크 중에 고를 수 있어요.' },
  { q: '게스트 계정은 안전한가요?', a: '게스트 계정의 학습 기록은 이 기기에만 저장돼요. 이메일로 연결하면 어디서든 이어서 학습할 수 있어요.' },
  { q: '앱 사용법이 궁금해요', a: '홈 → 오늘 학습 시작 → 단어 카드 → 퀴즈/복습으로 익히고, 실천 탭에서 행동으로 옮겨보세요. 매일 출석하면 포인트도 받아요!' },
];

export const GuideSheet = ({ open, onClose }: { open: boolean; onClose: () => void }) => (
  <BottomSheet open={open} onDimmerClick={onClose} header={<span style={{ paddingLeft: '20px', fontWeight: 700, color: 'var(--color-ink)' }}>앱 사용법 & FAQ</span>}>
    <div className="px-5 pb-6 flex flex-col gap-3">
      {FAQ_ITEMS.map((item, i) => (
        <div key={i} className="bg-[var(--color-canvas)] rounded-2xl px-4 py-4">
          <p className="text-sm font-bold text-[var(--color-ink)] mb-1.5">Q. {item.q}</p>
          <p className="text-xs text-[var(--color-ink-3)] leading-relaxed">{item.a}</p>
        </div>
      ))}
    </div>
  </BottomSheet>
);
