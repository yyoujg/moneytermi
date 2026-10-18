import type { ButtonHTMLAttributes } from 'react';

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  tone?: 'primary' | 'secondary' | 'soft';
  size?: 'md' | 'lg';
  fullWidth?: boolean;
};

// 주요 행동은 배경·글자색·크기를 한 묶음으로 관리한다.
// TDS의 버튼 리셋과 충돌하지 않도록 실제 스타일은 공통 CSS에 둔다.
export const ActionButton = ({
  tone = 'primary', size = 'md', fullWidth = false,
  type = 'button', className = '', children, ...props
}: Props) => (
  <button {...props} type={type} data-tone={tone} data-size={size}
    className={`action-button ${fullWidth ? 'w-full' : ''} ${className}`.trim()}>
    {children}
  </button>
);
