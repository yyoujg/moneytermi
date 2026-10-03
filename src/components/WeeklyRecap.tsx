import { useEffect, useState } from 'react';
import { RollingNumber } from './RollingNumber';

// 지난주 리그 결과 스토리. 새 주 첫 방문에 한 번. 장마다 윗줄 막대가 차오르며 자동으로 넘어가고, 누르면 다음 장.
export type WeekSnapshot = { week: number; rank: number | null; total: number; points: number };

const STEP_MS = 3200;

export const WeeklyRecap = ({ snap, onClose }: { snap: WeekSnapshot; onClose: () => void }) => {
  const slides = [
    { key: 'xp', label: '지난주 모은 XP', value: snap.points, unit: 'XP', note: snap.points >= 500 ? '꾸준함이 쌓였어요' : '작은 걸음도 쌓여요' },
    ...(snap.rank ? [{ key: 'rank', label: `${snap.total.toLocaleString()}명 중`, value: snap.rank, unit: '위', note: snap.rank <= 3 ? '시상대에 올랐어요' : snap.rank <= 10 ? 'TOP 10이에요' : '이번 주엔 한 계단 더' }] : []),
  ];
  const [i, setI] = useState(0);
  const last = i === slides.length;   // 마지막 장: 이번 주 시작

  useEffect(() => {
    if (last) return;
    const t = setTimeout(() => setI(n => n + 1), STEP_MS);
    return () => clearTimeout(t);
  }, [i, last]);

  const s = slides[i];
  return (
    <div className="original-modal fixed inset-0 z-[1500] flex flex-col bg-brand-500 text-[var(--color-on-brand)] anim-fade" onClick={() => !last && setI(n => n + 1)}>
      {/* 장 진행 막대 */}
      <div className="flex gap-1 px-4 pt-4">
        {[...slides, null].map((_, k) => (
          <div key={k} className="flex-1 h-1 rounded-full bg-white/30 overflow-hidden">
            {/* 지난 장은 꽉 참, 지금 장은 0에서 STEP_MS 동안 차오름(key로 장마다 새로 그린다) */}
            <div key={`${k}-${i}`} className="h-full bg-white rounded-full"
              style={{ width: k < i || (last && k === i) ? '100%' : '0%' }}
              ref={el => {
                if (!el || k !== i || last) return;
                requestAnimationFrame(() => { el.style.transition = `width ${STEP_MS}ms linear`; el.style.width = '100%'; });
              }} />
          </div>
        ))}
      </div>
      {/* 앱 자체 닫기·뒤로 아이콘은 검수 반려 사유라 글자 버튼으로 둔다 */}
      <button type="button" onClick={e => { e.stopPropagation(); onClose(); }} className="self-end m-3 px-2 py-1 text-xs font-bold text-[var(--color-on-brand)] active:opacity-60">
        건너뛰기
      </button>

      <div key={i} className="flex-1 flex flex-col items-center justify-center px-8 text-center">
        {!last ? (
          <>
            <p className="text-base font-bold anim-fade-up">{s.label}</p>
            <p className="mt-3! text-6xl font-black anim-pop-in" style={{ '--i': 2 } as React.CSSProperties}>
              <RollingNumber value={s.value} /><span className="text-3xl ml-1">{s.unit}</span>
            </p>
            <p className="mt-5! text-sm font-semibold anim-fade-up" style={{ '--i': 6 } as React.CSSProperties}>{s.note}</p>
          </>
        ) : (
          <>
            <p className="text-2xl font-black anim-pop-in">새로운 한 주가 시작됐어요</p>
            <p className="mt-3! text-sm anim-fade-up" style={{ '--i': 3 } as React.CSSProperties}>리그가 초기화됐어요. 이번 주도 함께 올라가 봐요.</p>
            <button type="button" onClick={e => { e.stopPropagation(); onClose(); }}
              className="mt-8! w-full py-4 rounded-button bg-white text-[var(--color-brand-deep)] text-sm font-bold active:opacity-90 anim-fade-up" style={{ '--i': 6 } as React.CSSProperties}>
              이번 주 시작하기
            </button>
          </>
        )}
      </div>
    </div>
  );
};
