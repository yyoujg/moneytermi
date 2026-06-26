import type { ReactNode } from 'react';

// 반복되는 아이콘 홀더의 골격만 표준화. 배경/모양(rounded-*, bg-*)은 className으로.
export const IconBox = ({ className = '', children }: { className?: string; children: ReactNode }) => (
  <div className={`w-9 h-9 flex items-center justify-center shrink-0 ${className}`.trim()}>{children}</div>
);
