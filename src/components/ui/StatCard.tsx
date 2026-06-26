import type { ReactNode } from 'react';
import { Card } from './Card';

export const StatCard = ({ icon, label, value }: { icon: ReactNode; label: string; value: ReactNode }) => (
  <Card pad="sm" className="flex-1 flex items-center gap-3">
    {icon}
    <div>
      <p className="text-3xs text-[var(--color-ink-4)]">{label}</p>
      <p className="text-base font-bold text-[var(--color-ink)] whitespace-nowrap">{value}</p>
    </div>
  </Card>
);
