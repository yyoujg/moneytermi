import { Pencil } from 'lucide-react';

// 작은 조작 표시는 베이지 입체 이미지 대신 테마의 본문색과 선명한 선을 사용한다.
// 접근성 이름과 터치 영역은 바깥 버튼이 제공한다.
export const ProfileEditIcon = ({ size = 18 }: { size?: number }) => (
  <Pencil
    size={size}
    strokeWidth={2.25}
    absoluteStrokeWidth
    aria-hidden="true"
    focusable="false"
    className="shrink-0 text-[var(--color-ink)]"
  />
);
