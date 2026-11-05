// 닉네임 수정 표시: 수달 3색 연필 그림(public/icons/stat/icon-edit.svg).
// 접근성 이름과 터치 영역은 바깥 버튼이 제공한다.
export const ProfileEditIcon = ({ size = 20 }: { size?: number }) => (
  <img src="/icons/stat/icon-edit.svg" alt="" aria-hidden="true" width={size} height={size} className="shrink-0" data-stat-icon="edit" />
);
