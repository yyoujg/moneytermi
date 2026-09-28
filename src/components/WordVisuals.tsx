import { useEffect, useState } from 'react';
import { BarChart3, ArrowDown } from 'lucide-react';
import type { WordVisual } from '../types';
import { Card } from './ui/Card';

// 단어 설명용 선 그래프·비교표·한국은행 실제 통계. 차트 라이브러리 없이 SVG로 그린다.
const COLORS = ['var(--color-brand-500)', 'var(--color-ink-3)'];
const W = 320;
const H = 160;
const PAD = { l: 34, r: 8, t: 10, b: 22 };

const fmt = (v: number) => (Math.abs(v) >= 100 ? Math.round(v).toLocaleString('ko-KR') : String(Math.round(v * 100) / 100));

const LineChart = ({ x, series, unit }: { x: string[]; series: { name: string; values: number[] }[]; unit?: string }) => {
  const all = series.flatMap(s => s.values);
  const min = Math.min(...all);
  const max = Math.max(...all);
  const span = max - min || 1;
  const lo = min - span * 0.1;
  const hi = max + span * 0.1;
  const px = (i: number) => PAD.l + (x.length === 1 ? 0 : (i / (x.length - 1)) * (W - PAD.l - PAD.r));
  const py = (v: number) => PAD.t + (1 - (v - lo) / (hi - lo)) * (H - PAD.t - PAD.b);
  const ticks = [0, Math.floor((x.length - 1) / 2), x.length - 1].filter((v, i, a) => a.indexOf(v) === i);

  return (
    <div className="flex flex-col gap-2">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" role="img">
        {[max, (max + min) / 2, min].map((v, i) => (
          <g key={i}>
            <line x1={PAD.l} x2={W - PAD.r} y1={py(v)} y2={py(v)} stroke="var(--color-line)" strokeDasharray="3 3" />
            <text x={PAD.l - 4} y={py(v) + 3} textAnchor="end" fontSize="9" fill="var(--color-ink-4)">{fmt(v)}</text>
          </g>
        ))}
        {ticks.map(i => (
          <text key={i} x={px(i)} y={H - 6} textAnchor={i === 0 ? 'start' : i === x.length - 1 ? 'end' : 'middle'} fontSize="9" fill="var(--color-ink-4)">{x[i]}</text>
        ))}
        {series.map((s, si) => (
          <g key={s.name}>
            <polyline
              points={s.values.map((v, i) => `${px(i)},${py(v)}`).join(' ')}
              fill="none"
              stroke={COLORS[si % COLORS.length]}
              strokeWidth="2.5"
              strokeLinejoin="round"
              strokeLinecap="round"
            />
            <circle cx={px(s.values.length - 1)} cy={py(s.values[s.values.length - 1])} r="3.5" fill={COLORS[si % COLORS.length]} />
          </g>
        ))}
      </svg>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-2xs text-[var(--color-ink-3)]">
        {series.map((s, si) => (
          <span key={s.name} className="flex items-center gap-1">
            <span className="w-2.5 h-2.5" style={{ borderRadius: 9999, background: COLORS[si % COLORS.length] }} />
            {s.name} {fmt(s.values[s.values.length - 1])}{unit ?? ''}
          </span>
        ))}
      </div>
    </div>
  );
};

const Table = ({ columns, rows }: { columns: string[]; rows: string[][] }) => (
  <div className="overflow-x-auto [&::-webkit-scrollbar]:hidden">
    <table className="w-full text-xs border-collapse">
      <thead>
        <tr>
          {columns.map((c, i) => (
            <th key={i} className={`py-2 px-2 text-left font-bold break-keep ${i === 0 ? 'text-[var(--color-ink-4)]' : 'text-brand-500'} bg-[var(--color-surface)] first:rounded-l-md last:rounded-r-md`}>{c}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((r, ri) => (
          <tr key={ri} className="border-b border-[var(--color-surface)] last:border-0">
            {r.map((cell, ci) => (
              <td key={ci} className={`py-2.5 px-2 align-top break-keep leading-[1.5] ${ci === 0 ? 'font-bold text-[var(--color-ink-2)]' : 'text-[var(--color-ink-2)]'}`}>{cell}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

// 원인 -> 결과 사슬. 단계마다 한 칸, 사이에 아래 화살표
const Flow = ({ steps }: { steps: string[] }) => (
  <div className="flex flex-col items-center gap-1">
    {steps.map((s, i) => (
      <div key={i} className="w-full flex flex-col items-center gap-1">
        {i > 0 && <ArrowDown size={14} className="text-brand-500" />}
        <p className="w-full py-2.5 px-3 rounded-chip bg-[var(--color-surface)] text-center text-[13px] font-semibold text-[var(--color-ink-2)] break-keep">{s}</p>
      </div>
    ))}
  </div>
);

type Point = { time: string; value: number };

// 한국은행 ECOS 통계. 키는 서버(ecos-series 함수)에만 있다.
const EcosChart = ({ v }: { v: Extract<WordVisual, { type: 'ecos' }> }) => {
  const [points, setPoints] = useState<Point[] | null>(null);
  useEffect(() => {
    let cancelled = false;
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
    const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;
    fetch(`${supabaseUrl}/functions/v1/ecos-series`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${anonKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ stat: v.stat, item: v.item, cycle: v.cycle, months: v.months ?? 60 }),
    })
      .then(r => r.json())
      .then(d => { if (!cancelled) setPoints(Array.isArray(d) ? d : []); })
      .catch(() => { if (!cancelled) setPoints([]); });
    return () => { cancelled = true; };
  }, [v.stat, v.item, v.cycle, v.months]);

  if (points === null) return <div className="h-40 bg-[var(--color-surface)] rounded-chip animate-pulse" />;
  if (points.length < 2) return <p className="text-[13px] text-[var(--color-ink-4)]">통계를 불러오지 못했어요</p>;
  const label = (t: string) => `${t.slice(2, 4)}.${t.slice(4, 6)}`;
  return (
    <div className="flex flex-col gap-1">
      <LineChart x={points.map(p => label(p.time))} series={[{ name: `최근(${label(points[points.length - 1].time)})`, values: points.map(p => p.value) }]} unit={v.unit} />
      <p className="text-3xs text-[var(--color-ink-4)]">출처: 한국은행 경제통계시스템(ECOS)</p>
    </div>
  );
};

export const WordVisuals = ({ visuals }: { visuals: WordVisual[] }) => (
  <>
    {visuals.map((v, i) => (
      <Card key={i} pad="none" className="px-5 pt-4 pb-5 flex flex-col gap-3">
        <div className="flex flex-col gap-1">
          <p className="flex items-center gap-1.5 text-xs font-bold text-[var(--color-ink-4)] tracking-[0.02em]"><BarChart3 size={13} />{v.type === 'ecos' ? '실제 통계' : v.type === 'table' ? '한눈에 비교' : v.type === 'flow' ? '이해하기' : '그래프로 보기'}</p>
          <p className="text-sm font-bold text-[var(--color-ink)] break-keep">{v.title}</p>
        </div>
        {v.type === 'line' && <LineChart x={v.x} series={v.series} unit={v.unit} />}
        {v.type === 'table' && <Table columns={v.columns} rows={v.rows} />}
        {v.type === 'ecos' && <EcosChart v={v} />}
        {v.type === 'flow' && <Flow steps={v.steps} />}
        {v.caption && <p className="text-xs text-[var(--color-ink-3)] break-keep leading-[1.6] whitespace-pre-line">{v.caption}</p>}
      </Card>
    ))}
  </>
);
