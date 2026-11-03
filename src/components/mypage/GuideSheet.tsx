import { BottomSheet } from '@toss/tds-mobile';
import { useNavigate } from 'react-router-dom';

// 규칙(XP·티어·에너지 수치)은 여기 적지 않는다. 리그 안내·에너지 시트 한 곳에만 두고 이곳은 어디서 보는지만 알려준다
const FAQ_ITEMS: { q: string; a: string; link?: { label: string; to: string } }[] = [
  { q: '앱은 어떻게 쓰나요?', a: '주제를 고르면 용어를 배우고 바로 문제로 확인해요. 배운 용어는 퀘스트의 \'오늘 다시 볼 용어\'에서 다시 풀어요.' },
  { q: '에너지는 무엇인가요?', a: '새 레슨과 코스 퀴즈를 시작할 때 써요. 남은 양과 채우는 방법은 홈 맨 위 에너지를 누르면 볼 수 있어요.' },
  { q: '리그 순위는 어떻게 정해지나요?', a: '이번 주에 얻은 XP 순이에요. XP를 얻는 방법과 티어 기준은 리그 안내에 있어요.', link: { label: '리그 안내 보기', to: '/league/rules' } },
  { q: '다시 보기는 어떻게 작동하나요?', a: '틀린 용어를 먼저 다시 물어보고, 맞힌 용어는 점점 긴 간격을 두고 다시 나와요.' },
  { q: '다크 모드를 쓸 수 있나요?', a: '마이 > 앱 설정 > 테마에서 고를 수 있어요.' },
  { q: '학습 기록은 어디에 저장되나요?', a: '토스 계정에 저장돼요. 앱을 다시 깔거나 기기를 바꿔도 이어서 학습할 수 있어요.' },
];

export const GuideSheet = ({ open, onClose }: { open: boolean; onClose: () => void }) => {
  const navigate = useNavigate();
  return (
    <BottomSheet open={open} onDimmerClick={onClose} header={<span className="sheet-title">앱 사용법</span>}>
      <div className="px-5 pb-6 flex flex-col">
        {FAQ_ITEMS.map((item, i) => (
          <div key={item.q} className="py-4 border-b border-[var(--color-line)] last:border-0 anim-fade-up" style={{ '--i': i } as React.CSSProperties}>
            <p className="text-sm font-bold text-[var(--color-ink)] mb-1!">{item.q}</p>
            <p className="text-sm text-[var(--color-ink-3)] leading-relaxed break-keep">{item.a}</p>
            {item.link && (
              <button type="button" onClick={() => { onClose(); navigate(item.link!.to); }}
                className="mt-2 min-h-[44px] text-sm font-semibold text-[var(--color-accent-foreground)] active:opacity-60">
                {item.link.label}
              </button>
            )}
          </div>
        ))}
      </div>
    </BottomSheet>
  );
};
