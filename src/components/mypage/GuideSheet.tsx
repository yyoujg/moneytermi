import { BottomSheet } from '@toss/tds-mobile';
import { useNavigate } from 'react-router-dom';

// 규칙(XP·티어·에너지 수치)은 여기 적지 않는다. 리그 안내·에너지 시트 한 곳에만 두고 이곳은 어디서 보는지만 알려준다
const FAQ_ITEMS: { q: string; a: string; link?: { label: string; to: string } }[] = [
  { q: '어디서부터 시작할까?', a: '주제를 고르고 용어 하나부터 만나봐. 배운 건 퀴즈로 체크하고, 헷갈린 건 복습으로 한 번 더!' },
  { q: '에너지는 어디에 써?', a: '새 레슨과 코스 퀴즈를 시작할 때 써. 얼마나 남았는지, 어떻게 채우는지는 주제 화면 위쪽 에너지를 눌러봐.' },
  { q: '리그 순위, 어떻게 올라가?', a: '이번 주에 모은 XP로 순위가 정해져. XP 모으는 방법과 등급 기준은 리그 안내에서 확인해 봐.', link: { label: '리그 안내 보기', to: '/league/rules' } },
  { q: '복습은 언제 다시 나와?', a: '헷갈린 용어를 먼저 다시 만나게 돼. 맞힌 용어는 점점 긴 간격으로 다시 나와.' },
  { q: '내 학습 기록은 어디에 있어?', a: '토스 계정에 저장돼. 앱을 다시 깔거나 기기를 바꿔도 이어서 배울 수 있어.' },
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
