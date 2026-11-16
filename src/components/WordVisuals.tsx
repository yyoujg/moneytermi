import { memo, useEffect, useId, useRef, useState } from 'react';
import { ArrowDown, X } from './ui/OtterIcons';
import { ArrowRight } from './ui/ControlIcons';
import type { WordVisual } from '../types';
import { Card } from './ui/Card';
import { ActionButton } from './ui/ActionButton';
import { StudyText } from './learning/StudyText';
import './WordVisuals.css';

// 단어 설명용 선 그래프·비교표·한국은행 실제 통계. 차트 라이브러리 없이 SVG로 그린다.
const COLORS = ['var(--color-accent-foreground)', 'var(--color-ink-3)'];
const W = 320;
const H = 160;
const PAD = { l: 34, r: 8, t: 10, b: 22 };

const fmt = (v: number) => (Math.round(v * 100) / 100).toLocaleString('ko-KR', { maximumFractionDigits: 2 });

const LineChart = ({ x, series, unit }: { x: string[]; series: { name: string; values: number[] }[]; unit?: string }) => {
  const [selected, setSelected] = useState<number | null>(null);
  const inputId = useId();
  const safeSeries = series.filter(s => s.values.length === x.length && s.values.every(Number.isFinite));
  const all = safeSeries.flatMap(s => s.values);
  if (x.length === 0 || all.length === 0) return null;

  const min = Math.min(...all);
  const max = Math.max(...all);
  const span = max - min || 1;
  const lo = min - span * 0.1;
  const hi = max + span * 0.1;
  const px = (i: number) => PAD.l + (x.length === 1 ? 0 : (i / (x.length - 1)) * (W - PAD.l - PAD.r));
  const py = (v: number) => PAD.t + (1 - (v - lo) / (hi - lo)) * (H - PAD.t - PAD.b);
  const ticks = [0, Math.floor((x.length - 1) / 2), x.length - 1].filter((v, i, a) => a.indexOf(v) === i);
  const point = Math.min(selected ?? x.length - 1, x.length - 1);

  return (
    <div className="word-line-chart">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" role="img" aria-label={`${x[0]}부터 ${x[x.length - 1]}까지 ${safeSeries.map(s => s.name).join(', ')} 변화${unit ? `, 단위 ${unit}` : ''}`}>
        {[max, (max + min) / 2, min].map((v, i) => (
          <g key={i}>
            <line x1={PAD.l} x2={W - PAD.r} y1={py(v)} y2={py(v)} stroke="var(--color-line)" strokeDasharray="3 3" />
            <text x={PAD.l - 4} y={py(v) + 3} textAnchor="end" className="type-caption" fill="currentColor">{fmt(v)}</text>
          </g>
        ))}
        {ticks.map(i => (
          <text key={i} x={px(i)} y={H - 6} textAnchor={i === 0 ? 'start' : i === x.length - 1 ? 'end' : 'middle'} className="type-caption" fill="currentColor">{x[i]}</text>
        ))}
        <line x1={px(point)} x2={px(point)} y1={PAD.t} y2={H - PAD.b} stroke="var(--color-line-strong)" strokeDasharray="2 4" />
        {safeSeries.map((s, si) => (
          <g key={s.name}>
            <polyline
              points={s.values.map((v, i) => `${px(i)},${py(v)}`).join(' ')}
              fill="none"
              stroke={COLORS[si % COLORS.length]}
              strokeWidth="2.5"
              strokeDasharray={si % 2 ? '5 4' : undefined}
              strokeLinejoin="round"
              strokeLinecap="round"
            />
            <circle cx={px(point)} cy={py(s.values[point])} r="4" fill={COLORS[si % COLORS.length]} stroke="var(--color-card)" strokeWidth="1.5" />
          </g>
        ))}
      </svg>
      {x.length > 1 && <div className="word-chart-control">
        <label htmlFor={inputId} className="type-supporting">지점을 움직여 비교해 봐</label>
        <input id={inputId} type="range" min={0} max={x.length - 1} step={1} value={point} onChange={event => setSelected(Number(event.target.value))} aria-valuetext={x[point]} />
      </div>}
      <div className="word-chart-values" aria-live="polite" aria-atomic="true">
        <p className="type-reading type-emphasis">{x[point]}</p>
        {safeSeries.map((s, si) => (
          <div key={s.name} className="word-chart-value type-reading">
            <span><i aria-hidden="true" style={{ borderColor: COLORS[si % COLORS.length], borderTopStyle: si % 2 ? 'dashed' : 'solid' }} />{s.name}</span>
            <strong className="type-emphasis">{fmt(s.values[point])}{unit ?? ''}</strong>
          </div>
        ))}
      </div>
    </div>
  );
};

const textWeight = (value: string) =>
  Array.from(value).reduce((sum, ch) => sum + (/[a-zA-Z0-9%.,+-]/.test(ch) ? 0.65 : 1), 0);

// 열이 많거나 긴 설명이 있는 표는 글자를 줄이지 않고 가로로 넘겨 읽는다.
const tableMinWidth = (columns: string[], rows: string[][]) => {
  const count = columns.length;
  const maxCell = Math.max(0, ...columns.map((column, i) => Math.max(textWeight(column), ...rows.map(row => textWeight(row[i] ?? '')))));
  return count >= 4 ? Math.max(520, count * 128) : maxCell >= 30 ? 430 : undefined;
};

const DemandComparison = ({ columns, rows }: { columns: string[]; rows: string[][] }) => {
  const [price, setPrice] = useState<'상승' | '하락'>('상승');
  const directions = ['상승', '하락'] as const;
  return (
    <div className="word-demand-explorer">
      <p className="type-supporting">다른 조건은 같고, 아래 상품의 가격만 바뀐다면?</p>
      <div className="word-demand-price" role="group" aria-label="관련 상품의 가격 변화">
        {directions.map(direction => (
          <button key={direction} type="button" aria-pressed={price === direction} onClick={() => setPrice(direction)}>
            <span aria-hidden="true">{direction === '상승' ? '↑' : '↓'}</span> 가격 {direction}
          </button>
        ))}
      </div>
      <div className="word-demand-legend type-supporting" aria-hidden="true">
        <span><i className="word-demand-key-before" />기존 수요</span>
        <span><i className="word-demand-key-after" />변한 수요</span>
      </div>
      <div aria-live="polite" aria-atomic="true">
        {directions.map(direction => (
          <div key={direction} className="word-demand-results" data-price={direction} hidden={price !== direction}>
            {rows.filter(row => row[0].endsWith(`값 ${direction}`))
              .sort((a, b) => Number(b[0].includes('(보완재)')) - Number(a[0].includes('(보완재)')))
              .map(row => {
                const shift = row[1] === '증가' ? 28 : -28;
                const arrowEnd = 90 + shift;
                const arrowBack = arrowEnd - Math.sign(shift) * 6;
                return (
                <div key={row[0]} className="word-demand-result">
                  <h4 className="type-reading type-emphasis">
                    <span>{row[0].split('(')[0]}</span><span className="type-supporting">{row[0].match(/\(.*?\)/)?.[0]}</span><span className="sr-only"> 값 {direction}</span>
                  </h4>
                  <svg viewBox="0 0 180 156" className="word-demand-chart" role="img" aria-label={`${row[0]}일 때 햄버거 수요 ${row[1]}, 수요곡선 ${row[2]}. 세로축은 햄버거 가격, 가로축은 햄버거 수량.`}>
                    <path d="M24 28V124H168" className="word-demand-axis" />
                    <text x="24" y="17" className="word-demand-axis-label">가격</text>
                    <text x="168" y="146" textAnchor="end" className="word-demand-axis-label">수량</text>
                    <line x1="60" y1="40" x2="120" y2="116" className="word-demand-curve-before" />
                    <line x1={60 + shift} y1="40" x2={120 + shift} y2="116" className="word-demand-curve-after" />
                    <path d={`M90 78H${arrowEnd} M${arrowBack} 73L${arrowEnd} 78L${arrowBack} 83`} className="word-demand-shift" />
                  </svg>
                  <dl>
                    <div>
                      <dt className="type-supporting">{columns[1]}</dt>
                      <dd className="type-section-title"><span aria-hidden="true">{row[1] === '증가' ? '↑' : '↓'} </span>{row[1]}</dd>
                    </div>
                    <div>
                      <dt className="type-supporting">{columns[2]}</dt>
                      <dd className="type-reading">{row[2]}</dd>
                    </div>
                  </dl>
                </div>
                );
              })}
          </div>
        ))}
      </div>
    </div>
  );
};

const Table = ({ title, columns, rows }: { title: string; columns: string[]; rows: string[][] }) => {
  if (title === '햄버거 수요는 어떻게 움직일까') return <DemandComparison columns={columns} rows={rows} />;
  const transpose = columns.slice(1).some(column => ['뜻', '의미', '내용', '예', '예시'].includes(column));
  const headings = transpose ? [columns[0], ...rows.map(row => row[0])] : columns;
  const entries = transpose ? columns.slice(1).map((column, ci) => [column, ...rows.map(row => row[ci + 1])]) : rows;
  const minWidth = tableMinWidth(headings, entries);
  return (
    <div className="word-table-region">
      <div className="word-table-scroll" role="region" aria-label={`${title} 표`} tabIndex={0}>
      <table className="word-data-table type-reading" aria-label={title} style={minWidth ? { minWidth } : undefined}>
        <colgroup>
          <col className="word-table-label-column" />
          {headings.slice(1).map((_, i) => <col key={i} />)}
        </colgroup>
        <thead>
          <tr>
            {headings.map((c, i) => (
              <th key={i} scope="col" className="type-reading type-emphasis">{c}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {entries.map((r, ri) => (
            <tr key={ri}>
              {r.map((cell, ci) => (
                ci === 0 ? <th key={ci} scope="row" className="type-reading type-emphasis">{cell}</th>
                  : <td key={ci} className="type-reading">{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      </div>
      {minWidth && <p className="type-supporting">좌우로 밀어서 비교해 보세요.</p>}
    </div>
  );
};

const Flow = ({ steps, caption }: { steps: string[]; caption?: string }) => (
  <div className="word-flow">
    <ol className="word-flow-steps">
      {steps.map((step, i) => (
        <li key={i}>
          {i > 0 && <ArrowDown size={16} className="word-flow-connector" aria-hidden="true" />}
          <div className="word-flow-step">
            <span className="word-flow-number type-supporting" aria-hidden="true">{i + 1}</span>
            <p className="type-reading">{step.split(/([↑↓])/).map((part, j) => /[↑↓]/.test(part)
              ? <strong key={j} className="type-emphasis">{part}</strong> : part)}</p>
          </div>
        </li>
      ))}
    </ol>
    {caption && <p className="word-visual-note type-reading">{caption}</p>}
  </div>
);

type Point = { time: string; value: number };

// 한국은행 ECOS 통계. 키는 서버(ecos-series 함수)에만 있다.
// fail(true)면 인증키 문제 같은 서버 오류(모든 통계 카드를 숨김), fail(false)면 이 통계만 없음
const fetchSeries = async (stat: string, item: string, cycle: string, months: number): Promise<Point[] | 'down'> => {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;
  const r = await fetch(`${supabaseUrl}/functions/v1/ecos-series`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${anonKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ stat, item, cycle, months }),
  });
  const d = await r.json();
  return Array.isArray(d) ? d : 'down';
};

const EcosChart = ({ v, onFail }: { v: Extract<WordVisual, { type: 'ecos' }>; onFail: (down: boolean) => void }) => {
  const defs = v.series ?? [{ name: '', stat: v.stat, item: v.item }];
  const key = defs.map(d => `${d.stat}/${d.item}`).join(',');
  const [data, setData] = useState<Point[][] | null>(null);
  useEffect(() => {
    let cancelled = false;
    Promise.all(defs.map(d => fetchSeries(d.stat, d.item, v.cycle, v.months ?? 60)))
      .then(res => {
        if (cancelled) return;
        if (res.includes('down')) { setData([]); onFail(true); return; }
        const lists = res as Point[][];
        if (lists.some(l => l.length < 2)) { setData([]); onFail(false); return; }
        setData(lists);
      })
      .catch(() => { if (!cancelled) { setData([]); onFail(true); } });
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, v.cycle, v.months]);

  if (data === null) return <div className="h-40 bg-[var(--color-surface)] rounded-chip animate-pulse" />;
  if (data.length === 0) return null;
  const label = (t: string) => `${t.slice(2, 4)}.${t.slice(4, 6)}`;
  // 여러 통계는 모두 값이 있는 달만 맞춰 그린다
  const times = data.map(l => new Set(l.map(p => p.time)));
  const common = data[0].map(p => p.time).filter(t => times.every(s => s.has(t)));
  if (common.length < 2) return null;

  const k = v.scale ?? 1;
  const last = label(common[common.length - 1]);
  const series = data.map((l, i) => {
    const byTime = new Map(l.map(p => [p.time, p.value * k]));
    return { name: defs[i].name ? `${defs[i].name}(${last})` : `최근(${last})`, values: common.map(t => byTime.get(t)!) };
  });
  return (
    <div className="flex flex-col gap-1">
      <LineChart x={common.map(label)} series={series} unit={v.unit} />
      <p className="text-3xs text-[var(--color-ink-4)]">출처: 한국은행 경제통계시스템(ECOS)</p>
    </div>
  );
};

// 통계를 못 받으면 카드 자체를 숨긴다(빈 카드·에러 문구를 보이지 않게)
const EcosCard = ({ v, showTitle }: { v: Extract<WordVisual, { type: 'ecos' }>; showTitle: boolean }) => {
  const [failed, setFailed] = useState(false);
  if (failed || ecosDown) return null;
  return (
    <Card pad="none" className="pt-4 pb-5 flex flex-col gap-3">
      <div className="flex flex-col gap-1">
        <p className="type-caption">실제 통계</p>
        {showTitle && <h3 className="type-section-title break-keep">{v.title}</h3>}
      </div>
      <EcosChart v={v} onFail={down => { if (down) ecosDown = true; setFailed(true); }} />
      {v.caption && <p className="type-supporting break-keep whitespace-pre-line">{v.caption}</p>}
    </Card>
  );
};

// ponytail: 모듈 플래그. 서버 오류(인증키 없음 등)가 한 번 나면 이 세션에서는 통계 카드를 아예 숨긴다. 통계 하나가 비는 건 그 카드만 숨긴다.
let ecosDown = false;

// 본문에서 고른 용어의 뜻과 등록된 예시를 밝은 설명 카드로 펼친다. 이동은 별도 버튼으로 구분한다.
// 이름이 '주당순이익(EPS)'이면 괄호 앞 '주당순이익'도 찾는다. 같은 용어는 글마다 처음 한 번만 강조한다.
export type Terms = {
  names: string[];
  meaningOf: (name: string) => string | undefined;
  exampleOf?: (name: string) => string | undefined;
  onClick: (name: string) => void;
};
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
const LinkedText = ({ text, terms, emphasisWord }: { text: string; terms?: Terms; emphasisWord?: string }) => {
  const [open, setOpen] = useState<string | null>(null);
  const panelId = useId();
  const panelRef = useRef<HTMLSpanElement>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  useEffect(() => {
    if (!open) return;
    panelRef.current?.scrollIntoView?.({ block: 'nearest', behavior: 'auto' });
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      setOpen(null);
      triggerRef.current?.focus({ preventScroll: true });
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open]);
  if (!terms || terms.names.length === 0) return emphasisWord ? <StudyText text={text} word={emphasisWord} /> : <>{text}</>;
  const { re, full } = termIndex(terms.names);
  if (!re) return emphasisWord ? <StudyText text={text} word={emphasisWord} /> : <>{text}</>;
  const seen = new Set<string>();
  return (
    <>
      {text.split(re).map((part, i) => {
        const name = full.get(part);
        if (!name || seen.has(name)) return emphasisWord ? <StudyText key={i} text={part} word={emphasisWord} /> : part;
        seen.add(name);
        return (
          <button key={i} type="button" onClick={event => {
            triggerRef.current = event.currentTarget;
            setOpen(o => (o === name ? null : name));
          }}
            aria-expanded={open === name}
            aria-controls={open === name ? panelId : undefined}
            className="word-term-button inline font-normal">
            {part}
          </button>
        );
      })}
      {open && (
        <span ref={panelRef} id={panelId} role="region" aria-label={`${open} 뜻 설명`} className="word-term-panel card-surface card-padding anim-pop-in">
          <span className="word-term-panel-header">
            <span className="min-w-0">
              <span className="word-term-panel-label type-caption">용어 뜻</span>
              <span role="heading" aria-level={2} className="word-term-panel-title type-section-title">{open}</span>
            </span>
            <button type="button" className="word-term-close" aria-label="뜻 설명 닫기" onClick={() => {
              setOpen(null);
              triggerRef.current?.focus({ preventScroll: true });
            }}><X size={20} strokeWidth={1.75} aria-hidden="true" /></button>
          </span>
          <span className="word-term-panel-meaning type-body">{terms.meaningOf(open) || '이 용어 설명은 준비 중이야.'}</span>
          {terms.exampleOf?.(open) && (
            <span className="word-term-example">
              <span className="word-term-example-label type-supporting type-emphasis">예를 들면</span>
              <span className="word-term-example-copy type-body">{terms.exampleOf(open)}</span>
            </span>
          )}
          <ActionButton tone="soft" fullWidth onClick={() => terms.onClick(open)} className="word-term-card-link">
            용어 카드 보기<ArrowRight size={16} aria-hidden="true" />
          </ActionButton>
        </span>
      )}
    </>
  );
};

const VisualCard = ({ v, className = '', terms, emphasisWord, showTitle }: { v: Exclude<WordVisual, { type: 'ecos' | 'quiz' }>; className?: string; terms?: Terms; emphasisWord?: string; showTitle: boolean }) => (
  <Card pad="none" className={`word-visual-section pt-4 pb-5 flex flex-col gap-3 ${className}`}>
    {v.type === 'text' ? (
      <>
        {showTitle && v.title && <h3 className="type-section-title break-keep">{v.title}</h3>}
        <div className="word-visual-paragraphs">{v.body.split(/\n+/).filter(paragraph => paragraph.trim()).map((paragraph, i) => (
          <p key={i} className="type-reading"><LinkedText text={paragraph} terms={terms} emphasisWord={emphasisWord} /></p>
        ))}</div>
      </>
    ) : <>
    {(showTitle || v.type !== 'table') && <div className="flex flex-col gap-1">
      {/* 표는 제목만으로 충분해 '한눈에 비교' 라벨을 두지 않는다 */}
      {v.type !== 'table' && <p className="type-caption">{v.type === 'flow' ? '흐름으로 이해하기' : '그래프로 보기'}</p>}
      {showTitle && <h3 className="type-section-title break-keep">{v.title}</h3>}
    </div>}
    {v.type === 'line' && <LineChart x={v.x} series={v.series} unit={v.unit} />}
    {v.type === 'table' && <Table title={v.title} columns={v.columns} rows={v.rows} />}
    {v.type === 'flow' && <Flow steps={v.steps} caption={v.caption} />}
    </>}
    {v.caption && v.type !== 'flow' && <p className={`word-visual-note type-reading break-keep whitespace-pre-line${v.title === '햄버거 수요는 어떻게 움직일까' ? ' word-demand-note' : ''}`}>{emphasisWord ? <StudyText text={v.caption} word={emphasisWord} /> : v.caption}</p>}
  </Card>
);

export const WordVisuals = memo(({ visuals, terms, emphasisWord, showTitle = true }: { visuals: WordVisual[]; terms?: Terms; emphasisWord?: string; showTitle?: boolean }) => {
  // quiz는 출시 이후 생긴 이해 확인 문제라 카드로 그리지 않는다
  const list = visuals.filter((v): v is Exclude<WordVisual, { type: 'quiz' }> => v.type !== 'quiz' && (v.type !== 'ecos' || !ecosDown));
  const demandIndex = list.findIndex(v => v.type === 'table' && v.title === '햄버거 수요는 어떻게 움직일까');
  const comparisonIndex = list.findIndex(v => v.type === 'table' && v.title === '보완재와 대체재');
  if (demandIndex >= 0 && comparisonIndex > demandIndex) {
    [list[demandIndex], list[comparisonIndex]] = [list[comparisonIndex], list[demandIndex]];
  }
  return (
    <>
      {list.map((v, i) =>
        v.type === 'ecos' ? <EcosCard key={i} v={v} showTitle={showTitle} />
        : <VisualCard key={i} v={v} terms={terms} emphasisWord={emphasisWord} showTitle={showTitle} />
      )}
    </>
  );
});
