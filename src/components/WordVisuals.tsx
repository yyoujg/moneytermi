import { useEffect, useState } from 'react';
import { BarChart3, ArrowDown } from 'lucide-react';
import type { WordVisual } from '../types';
import { feedbackCorrect, feedbackWrong } from '../lib/feedback';
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
// 원인 -> 결과 사슬을 직접 맞혀 보며 배운다. 첫 칸(원인)만 보여 주고, 다음 칸이 오를지(↑) 내릴지(↓) 고르면 정답을 펼친다.
// 화살표가 하나뿐인 칸만 문제로 내고, 화살표가 없거나 여러 개인 칸은 '다음 보기'로 펼친다. 다 펼치면 설명(caption)이 나온다.
const ARROW = /[↑↓]/g;
const Flow = ({ steps, caption }: { steps: string[]; caption?: string }) => {
  const [shown, setShown] = useState(1);   // 펼쳐진 칸 수
  const [picked, setPicked] = useState<Record<number, '↑' | '↓'>>({});
  const done = shown >= steps.length;
  const next = steps[shown];
  const quiz = next != null && (next.match(ARROW) ?? []).length === 1;
  const answer = quiz ? (next.match(ARROW)![0] as '↑' | '↓') : null;

  const pick = (a: '↑' | '↓') => {
    if (a === answer) feedbackCorrect(); else feedbackWrong();
    setPicked(p => ({ ...p, [shown]: a }));
    setShown(n => n + 1);
  };

  return (
    <div className="flex flex-col items-center gap-1">
      {steps.slice(0, shown).map((s, i) => {
        const mine = picked[i];
        const right = mine == null || s.includes(mine);
        return (
          <div key={i} className="w-full flex flex-col items-center gap-1 anim-fade-up">
            {i > 0 && <ArrowDown size={14} className="text-brand-500" />}
            <p className={`w-full py-2.5 px-3 rounded-chip text-center text-[13px] font-semibold break-keep ${mine == null ? 'bg-[var(--color-surface)] text-[var(--color-ink-2)]' : right ? 'bg-success-500/10 text-success-500' : 'bg-danger-500/10 text-danger-500'}`}>
              {s}{mine != null && (right ? ' · 정답' : ` · 내 답 ${mine}`)}
            </p>
          </div>
        );
      })}

      {!done && (
        <div className="w-full flex flex-col items-center gap-1">
          <ArrowDown size={14} className="text-brand-500" />
          {quiz ? (
            <>
              <p className="w-full py-2.5 px-3 rounded-chip border border-dashed border-brand-500/50 text-center text-[13px] font-semibold text-[var(--color-ink-2)] break-keep">
                {next.replace(ARROW, '?')}
              </p>
              <div className="w-full grid grid-cols-2 gap-2 mt-1">
                <button type="button" onClick={() => pick('↑')} className="py-2.5 rounded-button bg-brand-500/10 text-sm font-bold text-brand-500 active:opacity-70">↑ 오른다</button>
                <button type="button" onClick={() => pick('↓')} className="py-2.5 rounded-button bg-brand-500/10 text-sm font-bold text-brand-500 active:opacity-70">↓ 내린다</button>
              </div>
            </>
          ) : (
            <button type="button" onClick={() => setShown(n => n + 1)} className="w-full py-2.5 rounded-chip border border-dashed border-brand-500/50 text-[13px] font-bold text-brand-500 active:opacity-70">
              다음은 무엇일까요? 눌러서 보기
            </button>
          )}
        </div>
      )}

      {done && caption && <p className="w-full mt-2 text-xs text-[var(--color-ink-3)] break-keep leading-[1.6] whitespace-pre-line anim-fade-up">{caption}</p>}
    </div>
  );
};

type Point = { time: string; value: number };

// 한국은행 ECOS 통계. 키는 서버(ecos-series 함수)에만 있다.
const EcosChart = ({ v, onFail }: { v: Extract<WordVisual, { type: 'ecos' }>; onFail: () => void }) => {
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
      .then(d => { if (cancelled) return; const p = Array.isArray(d) ? d : []; setPoints(p); if (p.length < 2) onFail(); })
      .catch(() => { if (!cancelled) { setPoints([]); onFail(); } });
    return () => { cancelled = true; };
  }, [v.stat, v.item, v.cycle, v.months]);

  if (points === null) return <div className="h-40 bg-[var(--color-surface)] rounded-chip animate-pulse" />;
  if (points.length < 2) return null;
  const label = (t: string) => `${t.slice(2, 4)}.${t.slice(4, 6)}`;
  return (
    <div className="flex flex-col gap-1">
      <LineChart x={points.map(p => label(p.time))} series={[{ name: `최근(${label(points[points.length - 1].time)})`, values: points.map(p => p.value) }]} unit={v.unit} />
      <p className="text-3xs text-[var(--color-ink-4)]">출처: 한국은행 경제통계시스템(ECOS)</p>
    </div>
  );
};

// 통계를 못 받으면 카드 자체를 숨긴다(빈 카드·에러 문구를 보이지 않게)
const EcosCard = ({ v }: { v: Extract<WordVisual, { type: 'ecos' }> }) => {
  const [failed, setFailed] = useState(false);
  if (failed || ecosDown) return null;
  return (
    <Card pad="none" className="px-5 pt-4 pb-5 flex flex-col gap-3">
      <div className="flex flex-col gap-1">
        <p className="flex items-center gap-1.5 text-xs font-bold text-[var(--color-ink-4)] tracking-[0.02em]"><BarChart3 size={13} />실제 통계</p>
        <p className="text-sm font-bold text-[var(--color-ink)] break-keep">{v.title}</p>
      </div>
      <EcosChart v={v} onFail={() => { ecosDown = true; setFailed(true); }} />
      {v.caption && <p className="text-xs text-[var(--color-ink-3)] break-keep leading-[1.6] whitespace-pre-line">{v.caption}</p>}
    </Card>
  );
};

// ponytail: 모듈 플래그. 한 번 실패하면(인증키 미발급 등) 이 세션에서는 통계 카드를 아예 숨긴다. 키가 생기면 새로 열 때 다시 뜬다.
let ecosDown = false;

// 설명 글 속 다른 용어를 연한 주황 알약으로 강조한다. 누르면 글 아래에 뜻 말풍선이 뜨고, '카드 보기'로 그 용어 카드로 간다.
// 이름이 '주당순이익(EPS)'이면 괄호 앞 '주당순이익'도 찾는다. 같은 용어는 글마다 처음 한 번만 강조한다.
export type Terms = { names: string[]; meaningOf: (name: string) => string | undefined; onClick: (name: string) => void };
let termCache: { src: string[]; re: RegExp | null; full: Map<string, string> } | null = null;
const termIndex = (names: string[]) => {
  if (termCache?.src === names) return termCache;   // 같은 배열(부모 useMemo)이면 다시 만들지 않는다
  const full = new Map<string, string>();
  for (const n of names) {
    full.set(n, n);
    const base = n.replace(/\(.*\)$/, '').trim();
    if (base.length >= 2 && !full.has(base)) full.set(base, n);
  }
  const alts = [...full.keys()].sort((a, b) => b.length - a.length).map(k => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  termCache = { src: names, re: alts.length ? new RegExp(`(${alts.join('|')})`, 'g') : null, full };
  return termCache;
};
const LinkedText = ({ text, terms }: { text: string; terms?: Terms }) => {
  const [open, setOpen] = useState<string | null>(null);
  if (!terms || terms.names.length === 0) return <>{text}</>;
  const { re, full } = termIndex(terms.names);
  if (!re) return <>{text}</>;
  const seen = new Set<string>();
  return (
    <>
      {text.split(re).map((part, i) => {
        const name = full.get(part);
        if (!name || seen.has(name)) return part;
        seen.add(name);
        return (
          <button key={i} type="button" onClick={() => setOpen(o => (o === name ? null : name))}
            className={`inline px-1! py-0.5! rounded-md text-[#c2410c] font-medium active:opacity-60 ${open === name ? 'bg-brand-200' : 'bg-[var(--color-brand-cream)]'}`}>
            {part}
          </button>
        );
      })}
      {open && (
        <span className="block mt-2 rounded-chip bg-[#222] px-4 py-3 anim-pop-in">
          <span className="block text-xs font-bold text-white">{open}</span>
          <span className="block mt-1 text-xs text-white leading-relaxed break-keep">{terms.meaningOf(open)}</span>
          <button type="button" onClick={() => terms.onClick(open)} className="mt-1.5 text-xs font-bold text-brand-300 active:opacity-60">카드 보기 ›</button>
        </span>
      )}
    </>
  );
};

const VisualCard = ({ v, className = '', terms }: { v: Exclude<WordVisual, { type: 'ecos' }>; className?: string; terms?: Terms }) => (
  <Card pad="none" className={`px-5 pt-4 pb-5 flex flex-col gap-3 ${className}`}>
    {v.type === 'text' ? (
      <>
        <p className="text-sm font-bold text-[var(--color-ink)] break-keep">{v.title}</p>
        <p className="text-sm text-[var(--color-ink-2)] break-keep leading-[1.7] whitespace-pre-line"><LinkedText text={v.body} terms={terms} /></p>
      </>
    ) : <>
    <div className="flex flex-col gap-1">
      <p className="flex items-center gap-1.5 text-xs font-bold text-[var(--color-ink-4)] tracking-[0.02em]"><BarChart3 size={13} />{v.type === 'table' ? '한눈에 비교' : v.type === 'flow' ? '맞혀 보기' : '그래프로 보기'}</p>
      <p className="text-sm font-bold text-[var(--color-ink)] break-keep">{v.title}</p>
    </div>
    {v.type === 'line' && <LineChart x={v.x} series={v.series} unit={v.unit} />}
    {v.type === 'table' && <Table columns={v.columns} rows={v.rows} />}
    {v.type === 'flow' && <Flow steps={v.steps} caption={v.caption} />}
    </>}
    {v.caption && v.type !== 'flow' && <p className="text-xs text-[var(--color-ink-3)] break-keep leading-[1.6] whitespace-pre-line">{v.caption}</p>}
  </Card>
);

// 맞혀 보기가 여러 개면 첫 번째 자리에서 가로로 넘기는 카드 묶음으로 보여준다(뉴스와 같은 방식)
const FlowCarousel = ({ flows }: { flows: Extract<WordVisual, { type: 'flow' }>[] }) => {
  const [page, setPage] = useState(0);
  return (
    <div className="flex flex-col gap-2">
      <div
        className="-mx-5 px-5 scroll-px-5 flex items-start gap-3 overflow-x-auto snap-x snap-mandatory [&::-webkit-scrollbar]:hidden"
        onScroll={e => { const el = e.currentTarget; setPage(Math.round(el.scrollLeft / ((el.firstElementChild as HTMLElement)?.offsetWidth + 12 || 1))); }}
      >
        {flows.map((v, i) => <VisualCard key={i} v={v} className="w-[88%] shrink-0 snap-start" />)}
      </div>
      <div className="flex justify-center gap-1.5">
        {flows.map((_, i) => (
          <span key={i} style={{ borderRadius: 9999 }} className={`h-1.5 transition-all ${i === page ? 'w-4 bg-brand-500' : 'w-1.5 bg-[var(--color-line)]'}`} />
        ))}
      </div>
    </div>
  );
};

export const WordVisuals = ({ visuals, terms }: { visuals: WordVisual[]; terms?: Terms }) => {
  const list = visuals.filter(v => v.type !== 'ecos' || !ecosDown);
  const flows = list.filter((v): v is Extract<WordVisual, { type: 'flow' }> => v.type === 'flow');
  const firstFlow = list.findIndex(v => v.type === 'flow');
  return (
    <>
      {list.map((v, i) =>
        v.type === 'ecos' ? <EcosCard key={i} v={v} />
        : v.type === 'flow' && flows.length > 1 ? (i === firstFlow ? <FlowCarousel key={i} flows={flows} /> : null)
        : <VisualCard key={i} v={v} terms={terms} />
      )}
    </>
  );
};
