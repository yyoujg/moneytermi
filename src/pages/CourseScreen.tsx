import React, { useMemo, useRef, useLayoutEffect, useEffect, useState } from 'react';
import { BookOpen, Check, Lock, PenLine, RotateCcw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { logClick } from '../lib/analytics';
import { LESSON_COST } from '../constants';
import { feedbackNodeTap } from '../lib/feedback';
import { loadDoneNodes } from '../lib/pathProgress';
import { Storage } from '../lib/storage';

const SEEN_KEY = 'path_seen_done';   // 코스 화면에서 마지막으로 본 완료 노드들(도장 연출용)
const GATE_KEY = 'path_seen_levels';  // 열린 것을 본 레벨들(관문 연출용)

// 노드를 누르면 노드 색 원이 화면 가득 퍼진 뒤 다음 화면으로 넘어가고, 새 화면 위에서 그 색이 걷힌다.
// 오버레이를 body에 붙여 화면 전환 뒤에도 남게 한다. 동작 줄이기·WAAPI 미지원이면 바로 넘어간다.
const expandFromNode = (nodeId: string) => new Promise<void>(resolve => {
  const el = document.querySelector<HTMLElement>(`[data-node-id="${nodeId}"]`);
  if (!el || typeof el.animate !== 'function' || window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) { resolve(); return; }
  const root = getComputedStyle(document.documentElement);
  const token = (k: string, fallback: string) => root.getPropertyValue(k).trim() || fallback;
  const r = el.getBoundingClientRect();
  const at = `${r.left + r.width / 2}px ${r.top + r.height / 2}px`;
  const ov = document.createElement('div');
  Object.assign(ov.style, { position: 'fixed', inset: '0', zIndex: '2000', pointerEvents: 'none', background: el.dataset.color ?? '#c4511a' });
  document.body.appendChild(ov);
  const grow = ov.animate(
    [{ clipPath: `circle(${r.width / 2}px at ${at})` }, { clipPath: `circle(150vmax at ${at})` }],
    { duration: parseFloat(token('--dur-base', '320ms')), easing: token('--ease-soft', 'ease-out'), fill: 'forwards' },
  );
  const fadeOut = () => {
    const f = ov.animate([{ opacity: 1 }, { opacity: 0 }], { duration: parseFloat(token('--dur-slow', '500ms')), easing: 'ease-out', fill: 'forwards' });
    f.onfinish = () => ov.remove();
  };
  grow.onfinish = () => { resolve(); requestAnimationFrame(() => requestAnimationFrame(fadeOut)); };
  setTimeout(() => ov.remove(), 3000);   // 어떤 이유로든 남지 않게
});

// 레벨 관문: 레벨 이름·설명·레벨 전체 진행. 잠긴 레벨은 흐리게, 새로 열린 레벨은 주황 문짝이 좌우로 열리며 드러난다
const LevelGate = ({ level, title, stat, locked, opening }: {
  level: string; title: string; stat: { known: number; total: number }; locked: boolean; opening: boolean;
}) => {
  const pct = stat.total ? Math.round((stat.known / stat.total) * 100) : 0;
  return (
    <div className={`relative mx-5 mt-10 overflow-hidden rounded-card border border-[var(--color-line)] bg-[var(--color-card)] px-5 py-4 ${locked ? 'opacity-60' : ''}`}>
      <div className="flex items-center gap-2">
        <span className={`px-2.5 py-1 text-white text-2xs font-black ${locked ? 'bg-[var(--color-ink-4)]' : 'bg-brand-500'} ${opening ? 'anim-pop-in' : ''}`}
          style={{ borderRadius: 9999, '--i': 10 } as React.CSSProperties}>{level}</span>
        <span className="text-sm font-bold text-[var(--color-ink)] break-keep">{title}</span>
        {locked && <Lock size={14} className="ml-auto text-[var(--color-ink-4)]" />}
      </div>
      <div className="mt-3 flex items-center gap-3">
        <div className="flex-1 h-1.5 rounded-full bg-[var(--color-surface)] overflow-hidden">
          <div className="h-full rounded-full bg-brand-500 transition-all duration-[var(--dur-draw)] ease-soft" style={{ width: `${pct}%` }} />
        </div>
        <span className="text-2xs font-bold text-[var(--color-ink-4)] tabular-nums">{stat.known}/{stat.total}</span>
      </div>
      {locked && <p className="mt-2 text-2xs text-[var(--color-ink-4)]">앞 레벨을 마치면 열려요</p>}
      {opening && (
        <div aria-hidden className="absolute inset-0 flex pointer-events-none">
          <div className="flex-1 bg-brand-500 anim-gate-l flex items-center justify-end pr-1" style={{ '--d': '0.35s' } as React.CSSProperties}>
            <span className="text-white text-sm font-black">{level}</span>
          </div>
          <div className="flex-1 bg-brand-500 anim-gate-r flex items-center pl-1" style={{ '--d': '0.35s' } as React.CSSProperties}>
            <span className="text-white text-sm font-black">열림</span>
          </div>
        </div>
      )}
    </div>
  );
};
import { buildPath, connectorD, NODE, nodeOffsetX, ROW, SPAN, sectionColor, type PathNode } from '../lib/path';

// 노드 원. TDS 리셋이 <button>의 rounded-*를 먹으므로 borderRadius는 인라인 스타일로 준다
// (인라인이 unlayered 리셋을 이긴다). button을 유지해야 포커스/Enter/disabled가 공짜로 따라온다.
// 레벨 이름은 courses.level (words_bok/categories.py LEVEL_NAMES)
const LEVEL_TITLES: Record<string, string> = { 기초: '경제 뉴스의 기본 단어', 중급: '용어끼리 연결하기', 고급: '경제 메커니즘 설명하기', 심화: '모형과 제도 깊이 보기' };

const NodeCircle = ({ node, index, color, isFocus, onTap, nodeRef, stamp }: {
  node: PathNode;
  index: number;
  color: { face: string; shadow: string };
  isFocus: boolean;
  onTap: () => void;
  nodeRef?: React.Ref<HTMLButtonElement>;
  stamp?: number;   // 지난번 이후 새로 끝낸 노드면 도장 순번(0부터). 순서대로 찍힌다
}) => {
  const locked = node.state === 'locked';
  const done = node.state === 'done';
  // 잠긴 노드도 자기 색을 알파로 흐리게 보여준다. 전부 회색이면 팔레트가 보이지 않는다.
  const outlined = node.type === 'quiz' || node.type === 'review';
  // 퀴즈·복습 노드는 테두리만 있는 모양이지만, 끝낸 뒤에는 레슨처럼 색을 채워 체크가 보이게 한다
  const face = locked
    ? `${color.face}33`
    : outlined && !done
      ? 'var(--color-card)'
      : color.face;
  const shadow = locked ? `${color.shadow}33` : color.shadow;

  return (
    <button
      ref={nodeRef}
      type="button"
      disabled={locked}
      data-own-sfx
      data-node-id={node.id}
      data-color={color.face}
      onClick={onTap}
      aria-label={`${node.type === 'quiz' ? '퀴즈' : node.type === 'review' ? '누적 복습' : '학습'} ${index + 1}`}
      className={`absolute flex items-center justify-center active:translate-y-[3px] disabled:opacity-50 disabled:pointer-events-none ${isFocus ? 'animate-node-hop' : stamp != null ? 'anim-stamp' : ''}`}
      style={{
        top: (ROW - NODE) / 2,
        left: `calc(50% + ${nodeOffsetX(index)}px)`,
        marginLeft: -NODE / 2,
        width: NODE,
        height: NODE,
        borderRadius: 9999,
        background: face,
        boxShadow: `0 5px 0 ${shadow}${isFocus ? `, 0 0 0 6px ${color.face}33` : ''}`,
        border: outlined && !locked && !done ? `2px solid ${color.face}` : 'none',
        ...(stamp != null ? { '--d': `${0.2 + stamp * 0.15}s` } : {}),
      } as React.CSSProperties}
    >
      {locked
        ? <Lock size={22} style={{ color: color.shadow, opacity: 0.55 }} />
        : done
          ? <Check size={26} strokeWidth={3} className="text-white" />
          : node.type === 'quiz'
            ? <PenLine size={22} style={{ color: color.face }} />
            : node.type === 'review'
              ? <RotateCcw size={22} style={{ color: color.face }} />
              : <BookOpen size={24} className="text-white" />}
    </button>
  );
};

const CourseScreen = () => {
  const navigate = useNavigate();
  const { hydrated, knownIds, courses, points, spendPoints, openShop } = useAppContext();
  // 이 기기에서 끝낸 퀴즈·복습 노드. 화면에 돌아올 때마다 다시 읽는다(퀴즈 끝내고 돌아온 직후 반영).
  const [doneNodes, setDoneNodes] = useState<Set<string>>(new Set());
  useEffect(() => { loadDoneNodes().then(setDoneNodes); }, []);

  const sections = useMemo(() => buildPath(courses, knownIds), [courses, knownIds]);
  // 레벨별 배운 단어 수 / 전체
  const levelStats = useMemo(() => {
    const m = new Map<string, { known: number; total: number }>();
    for (const sec of sections) {
      const s = m.get(sec.course.level) ?? { known: 0, total: 0 };
      s.known += sec.knownCount; s.total += sec.course.words.length;
      m.set(sec.course.level, s);
    }
    return m;
  }, [sections]);

  // 새로 열린 레벨: 관문 문이 좌우로 열리는 연출을 한 번. 첫 방문(기록 없음)은 연출 없이 기록만
  const [openingLevels, setOpeningLevels] = useState<Set<string>>(new Set());
  const gateRef = useRef(false);
  useEffect(() => {
    if (gateRef.current || !hydrated || sections.length === 0) return;
    gateRef.current = true;
    const open = [...new Set(sections.filter(sec => sec.nodes[0]?.state !== 'locked').map(sec => sec.course.level))];
    Storage.getItem(GATE_KEY).catch(() => null).then(raw => {
      if (raw) {
        const seen = new Set<string>(JSON.parse(raw));
        setOpeningLevels(new Set(open.filter(l => !seen.has(l))));
      }
      Storage.setItem(GATE_KEY, JSON.stringify(open)).catch(() => {});
    });
  }, [hydrated, sections]);

  const isDone = (node: PathNode) => node.state === 'done' || (doneNodes.has(node.id) && node.state === 'available');

  // 지난번에 본 뒤 새로 끝낸 노드: 도장 연출 + 들어오는 경로가 색으로 그려진다. 첫 방문(기록 없음)은 연출 없이 기록만.
  const [newlyDone, setNewlyDone] = useState<Map<string, number>>(new Map());
  const stampedRef = useRef(false);
  useEffect(() => {
    if (stampedRef.current || !hydrated || sections.length === 0) return;
    stampedRef.current = true;
    const now = sections.flatMap(sec => sec.nodes.filter(isDone).map(n => n.id));
    Storage.getItem(SEEN_KEY).catch(() => null).then(raw => {
      if (raw) {
        const seen = new Set<string>(JSON.parse(raw));
        const fresh = now.filter(id => !seen.has(id)).slice(-8);   // 한 번에 너무 많이 찍히지 않게 최근 8개만
        setNewlyDone(new Map(fresh.map((id, i) => [id, i])));
      }
      Storage.setItem(SEEN_KEY, JSON.stringify(now)).catch(() => {});
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated, sections, doneNodes]);

  // 도장 연출이 있으면 첫 도장 노드를 먼저 보여주고, 마지막 도장·경로가 끝나면 지금 할 노드로 부드럽게 내려간다
  useEffect(() => {
    if (newlyDone.size === 0) return;
    const first = [...newlyDone.entries()].find(([, i]) => i === 0)?.[0];
    document.querySelector(`[data-node-id="${first}"]`)?.scrollIntoView({ block: 'center' });
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    const t = setTimeout(() => focusRef.current?.scrollIntoView({ block: 'center', behavior: 'smooth' }),
      reduce ? 0 : 400 + newlyDone.size * 150 + 900);
    return () => clearTimeout(t);
  }, [newlyDone]);

  // current 노드는 코스마다 하나씩 생긴다. 장식(링·"시작" 말풍선)은 패스 순서상 첫 번째에만 붙인다.
  // 진행 중인 노드와 그 노드가 섹션 안에서 몇 번째인지 (계산이 가벼워 memo 없이)
  const findFocus = () => {
    for (const sec of sections) {
      const k = sec.nodes.findIndex(node => node.state === 'current');
      if (k >= 0) return { id: sec.nodes[k].id, index: k, courseId: sec.course.id };
    }
    return null;
  };
  const focus = findFocus();
  const focusId = focus?.id ?? null;

  const focusRef = useRef<HTMLButtonElement>(null);
  const focusSectionRef = useRef<HTMLElement>(null);
  const didScroll = useRef(false);
  // 첫 진입 스크롤: 진행 중인 섹션이 화면 맨 위에 오게 한다. 노드가 섹션 앞부분이면 배너부터 보이도록 섹션 시작에,
  // 더 아래면 노드를 가운데에(배너는 sticky라 위에 붙어 어느 섹션인지 보인다). 이전 완료 섹션 배너가 같이 보이지 않게.
  useLayoutEffect(() => {
    if (didScroll.current || !hydrated || !focus) return;
    didScroll.current = true;
    if (focus.index <= 2) focusSectionRef.current?.scrollIntoView({ block: 'start' });
    else focusRef.current?.scrollIntoView({ block: 'center' });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated, focusId]);

  const spending = useRef(false);   // 연타로 spend_points가 두 번 나가지 않게
  const handleNodeTap = async (node: PathNode, index: number, courseKnown: number) => {
    // disabled 버튼은 click이 안 오지만, 웹뷰/리셋 CSS에 따라 새는 경우가 있어 한 번 더 막는다.
    if (node.state === 'locked') return;
    logClick('path_node_click', { course_id: node.courseId, type: node.type, index, state: node.state });

    if (node.type === 'quiz' || node.type === 'review') {
      // 복습은 지금까지 배운 것 중에서만 낸다. 아직 아무것도 안 배웠으면 그냥 앞에서 자른다.
      const learned = node.words.filter(w => knownIds.has(w.id));
      const pool = learned.length > 0 ? learned : node.words;
      const size = node.type === 'review' ? 10 : 5;
      const queue = [...pool].sort(() => Math.random() - 0.5).slice(0, size);
      feedbackNodeTap();
      await expandFromNode(node.id);
      navigate('/quiz', { state: { quizQueue: queue, backPath: '/course', nodeId: node.id } });
      return;
    }

    if (node.state !== 'done' && courseKnown === 0) {
      logClick('course_start', { course_id: node.courseId, title: node.courseId });
    }

    // 레슨은 포인트가 든다. 부족하면 상점(광고 보기)으로, 서버 차감이 실패해도 마찬가지.
    if (points < LESSON_COST) { logClick('lesson_blocked_points', { points }); openShop('lesson'); return; }
    if (spending.current) return;
    spending.current = true;
    try {
      if (!(await spendPoints(LESSON_COST, 'lesson'))) { openShop('lesson'); return; }
    } finally { spending.current = false; }
    feedbackNodeTap();
    await expandFromNode(node.id);
    navigate('/word-card', { state: { words: node.words, index: 0, backPath: '/course', autoAdvance: true } });
  };

  return (
    <div className="flex flex-col h-full bg-[var(--color-canvas)] pb-nav overflow-y-auto [&::-webkit-scrollbar]:hidden">


      {/* 패스 */}
      {sections.map((sec, si) => {
        const color = sectionColor(si);
        return (
        <section key={sec.course.id} ref={sec.course.id === focus?.courseId ? focusSectionRef : undefined}>
          {/* 레벨이 바뀌는 첫 코스 위에 레벨 관문 */}
          {LEVEL_TITLES[sec.course.level] && sec.course.level !== sections[si - 1]?.course.level && (
            <LevelGate
              level={sec.course.level}
              title={LEVEL_TITLES[sec.course.level]}
              stat={levelStats.get(sec.course.level)!}
              locked={sec.nodes[0]?.state === 'locked'}
              opening={openingLevels.has(sec.course.level)}
            />
          )}
          {/* 코스 배너 */}
          <div className="sticky top-4 z-10 mx-5 mt-5 mb-1 rounded-card px-5 py-4 shadow-md" style={{ background: color.face }}>
            <p className="text-2xs font-bold text-white/70">{sec.course.level} · 코스 {si + 1}/{sections.length}</p>
            <h3 className="text-base font-bold text-white mt-1! break-keep">{sec.course.title}</h3>
            <p className="text-2xs text-white/80 mt-1.5!">{sec.knownCount} / {sec.course.words.length} 단어</p>
          </div>

          {sec.nodes.map((node, k) => {
            const isFocus = node.id === focusId;
            return (
              <div key={node.id} className="relative" style={{ height: ROW }}>
                {k > 0 && (
                  <svg
                    aria-hidden
                    width={SPAN * 2}
                    height={ROW}
                    className="absolute pointer-events-none"
                    style={{ left: `calc(50% - ${SPAN}px)`, top: -ROW / 2 }}
                  >
                    <path
                      d={connectorD(nodeOffsetX(k - 1), nodeOffsetX(k))}
                      fill="none"
                      strokeWidth={6}
                      strokeLinecap="round"
                      strokeDasharray="1 14"
                      stroke={node.state === 'done' && !newlyDone.has(node.id) ? color.face : 'var(--color-ink-4)'}
                    />
                    {/* 새로 끝낸 노드와 지금 할 노드로 들어오는 길: 회색 점 위로 색 점이 앞에서부터 그려진다(마스크가 선처럼 자란다) */}
                    {(newlyDone.has(node.id) || (isFocus && isDone(sec.nodes[k - 1]))) && (
                      <>
                        <mask id={`trail-${node.id}`}>
                          <path d={connectorD(nodeOffsetX(k - 1), nodeOffsetX(k))} fill="none" stroke="#fff" strokeWidth={10} strokeLinecap="round"
                            pathLength={1} className="anim-draw"
                            style={{ animationDelay: `${newlyDone.has(node.id) ? 0.1 + newlyDone.get(node.id)! * 0.15 : 0.3}s` }} />
                        </mask>
                        <path d={connectorD(nodeOffsetX(k - 1), nodeOffsetX(k))} fill="none" strokeWidth={6} strokeLinecap="round"
                          strokeDasharray="1 14" stroke={color.face} mask={`url(#trail-${node.id})`} />
                      </>
                    )}
                  </svg>
                )}

                {/* 진행할 노드: 제자리에서 통통 뛰고, 바닥 그림자가 반대 위상으로 줄었다 커진다 */}
                {isFocus && (
                  <span
                    aria-hidden
                    className="absolute pointer-events-none animate-node-ground"
                    style={{
                      top: (ROW - NODE) / 2 + NODE + 6, left: `calc(50% + ${nodeOffsetX(k)}px)`, marginLeft: -NODE * 0.4,
                      width: NODE * 0.8, height: 10, borderRadius: 9999,
                      background: color.shadow,
                    }}
                  />
                )}

                <NodeCircle
                  node={doneNodes.has(node.id) && node.state === 'available' ? { ...node, state: 'done' } : node}
                  index={k}
                  color={color}
                  isFocus={isFocus}
                  nodeRef={isFocus ? focusRef : undefined}
                  stamp={newlyDone.get(node.id)}
                  onTap={() => handleNodeTap(node, k, sec.knownCount)}
                />
              </div>
            );
          })}
        </section>
        );
      })}
    </div>
  );
};

export default CourseScreen;
