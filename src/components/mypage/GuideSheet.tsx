import { BottomSheet } from '@toss/tds-mobile';

const FAQ_ITEMS = [
  { q: '포인트는 어떻게 얻나요?', a: '퀴즈에서 정답을 맞히면 10~20P를 획득해요. 연속 정답 시 보너스 포인트가 붙어요!' },
  { q: '단어를 "알고 있어요" 표시하면?', a: '학습 완료로 기록되고 복습 리스트에 추가돼요. 체크 해제도 언제든지 가능해요.' },
  { q: '리그 순위는 어떻게 결정되나요?', a: '보유 포인트 순으로 순위가 정해져요. 매주 초기화되니 꾸준히 퀴즈를 풀어보세요.' },
  { q: '코스는 어떻게 구성돼 있나요?', a: '경제 카테고리별(거시경제, 금융, 주식/기업 등)로 묶인 단어 묶음이에요. 난이도순으로 학습해요.' },
  { q: '게스트 계정은 안전한가요?', a: '게스트 계정의 학습 기록은 이 기기에만 저장돼요. 이메일로 연결하면 어디서든 이어서 학습할 수 있어요.' },
  { q: '앱 사용법이 궁금해요', a: '홈 → 오늘 학습 시작 → 단어 카드 → 퀴즈 순서로 사용해보세요. 매일 출석하면 포인트도 받아요!' },
];

export const GuideSheet = ({ open, onClose }: { open: boolean; onClose: () => void }) => (
  <BottomSheet open={open} onDimmerClick={onClose} header={<span style={{ paddingLeft: '20px', fontWeight: 700 }}>앱 사용법 & FAQ</span>}>
    <div className="px-5 pb-6 flex flex-col gap-3">
      {FAQ_ITEMS.map((item, i) => (
        <div key={i} className="bg-[#F7F7F7] rounded-2xl px-4 py-4">
          <p className="text-sm font-bold text-[#111111] mb-1.5">Q. {item.q}</p>
          <p className="text-xs text-[#666666] leading-relaxed">{item.a}</p>
        </div>
      ))}
    </div>
  </BottomSheet>
);
