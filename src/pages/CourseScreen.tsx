import React, { useMemo, useRef, useLayoutEffect, useEffect, useState } from 'react';
import { BookOpenText, Brain, Check, ChevronRight, CircleHelp, Clock3, House, Landmark, Layers3, Lock, LockKeyhole, TrendingUp } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { logClick } from '../lib/analytics';
import { LESSON_COST } from '../constants';
import { feedbackNodeTap } from '../lib/feedback';
import { loadDoneNodes } from '../lib/pathProgress';
import { Storage } from '../lib/storage';
import { showModal } from '../components/AlertModal';

const SEEN_KEY = 'path_seen_done';   // 코스 화면에서 마지막으로 본 완료 노드들(도장 연출용)
const GATE_KEY = 'path_seen_levels';  // 열린 것을 본 레벨들(관문 연출용)

// 노드를 누르면 브랜드색 원이 화면 가득 퍼지고 로고를 보여준 뒤 다음 화면으로 넘어간다.
// 오버레이를 body에 붙여 화면 전환 뒤에도 남게 한다. 동작 줄이기·WAAPI 미지원이면 바로 넘어간다.
const expandFromNode = (nodeId: string, courseTitle: string) => new Promise<void>(resolve => {
  const el = document.querySelector<HTMLElement>(`[data-node-id="${nodeId}"]`);
  if (!el || typeof el.animate !== 'function' || window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) { resolve(); return; }
  const root = getComputedStyle(document.documentElement);
  const token = (k: string, fallback: string) => root.getPropertyValue(k).trim() || fallback;
  const r = el.getBoundingClientRect();
  const app = document.querySelector<HTMLElement>('[data-app-shell]')?.getBoundingClientRect();
  const left = app?.left ?? 0;
  const top = app?.top ?? 0;
  const at = `${r.left + r.width / 2 - left}px ${r.top + r.height / 2 - top}px`;
  const ov = document.createElement('div');
  ov.setAttribute('aria-hidden', 'true');
  Object.assign(ov.style, { position: 'fixed', left: `${left}px`, top: `${top}px`, width: `${app?.width ?? window.innerWidth}px`, height: `${app?.height ?? window.innerHeight}px`, zIndex: '2000', pointerEvents: 'none', overflow: 'hidden', background: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center' });
  const logo = document.createElement('img');
  logo.src = '/logo.png';
  logo.alt = '';
  Object.assign(logo.style, { width: '180px', height: '180px', objectFit: 'contain', transform: 'translateY(-32px)', opacity: '0', transition: 'opacity 180ms ease-out' });
  ov.appendChild(logo);
  const title = document.createElement('span');
  title.textContent = courseTitle;
  Object.assign(title.style, { position: 'absolute', top: 'calc(50% + 66px)', left: '24px', right: '24px', color: 'var(--color-ink-2)', textAlign: 'center', fontSize: '13px', fontWeight: '700', opacity: '0', transition: 'opacity 180ms ease-out' });
  ov.appendChild(title);
  document.body.appendChild(ov);
  const grow = ov.animate(
    [{ clipPath: `circle(${r.width / 2}px at ${at})` }, { clipPath: `circle(150vmax at ${at})` }],
    { duration: parseFloat(token('--dur-base', '320ms')), easing: token('--ease-soft', 'ease-out'), fill: 'forwards' },
  );
  const fadeOut = () => {
    const f = ov.animate([{ opacity: 1 }, { opacity: 0 }], { duration: parseFloat(token('--dur-slow', '500ms')), easing: 'ease-out', fill: 'forwards' });
    f.onfinish = () => ov.remove();
  };
  grow.onfinish = () => {
    logo.style.opacity = '1';
    title.style.opacity = '1';
    setTimeout(() => { resolve(); requestAnimationFrame(() => requestAnimationFrame(fadeOut)); }, 320);
  };
  setTimeout(() => ov.remove(), 3000);   // 어떤 이유로든 남지 않게
});

// 레벨 관문: 레벨 이름·설명·레벨 전체 진행. 잠긴 레벨은 흐리게, 새로 열린 레벨은 주황 문짝이 좌우로 열리며 드러난다
const LevelGate = ({ level, title, stat, locked, opening }: {
  level: string; title: string; stat: { known: number; total: number }; locked: boolean; opening: boolean;
}) => {
  const pct = stat.total ? Math.round((stat.known / stat.total) * 100) : 0;
  return (
    <div className={`relative mx-5 mt-8 overflow-hidden rounded-card px-1 py-2 ${locked ? 'opacity-60' : ''}`}>
      <div className="flex items-center gap-2">
        <span className={`border px-2.5 py-1 text-2xs font-black ${locked ? 'border-transparent bg-[var(--color-surface)] text-[var(--color-ink-4)]' : 'border-[var(--color-line)] bg-[var(--color-card)] text-[var(--color-ink-2)]'} ${opening ? 'anim-pop-in' : ''}`}
          style={{ borderRadius: 9999, '--i': 10 } as React.CSSProperties}>{level}</span>
        <span className="text-sm font-bold text-[var(--color-ink)] break-keep">{title}</span>
        {locked && <Lock size={14} className="ml-auto text-[var(--color-ink-4)]" />}
      </div>
      <div className="mt-3 flex items-center gap-3">
        <div className="flex-1 h-1.5 rounded-full bg-[var(--color-button-secondary)] overflow-hidden">
          <div className="h-full rounded-full bg-brand-500 transition-all duration-[var(--dur-draw)] ease-soft" style={{ width: `${pct}%` }} />
        </div>
        <span className="text-2xs font-bold text-[var(--color-ink-4)] tabular-nums">{stat.known}/{stat.total}</span>
      </div>
      {locked && <p className="mt-2 text-2xs text-[var(--color-ink-4)]">앞 레벨을 마치면 열려요</p>}
      {opening && (
        <div aria-hidden className="absolute inset-0 flex pointer-events-none">
          <div className="flex-1 bg-brand-500 anim-gate-l flex items-center justify-end pr-1" style={{ '--d': '0.35s' } as React.CSSProperties}>
            <span className="text-[var(--color-on-brand)] text-sm font-black">{level}</span>
          </div>
          <div className="flex-1 bg-brand-500 anim-gate-r flex items-center pl-1" style={{ '--d': '0.35s' } as React.CSSProperties}>
            <span className="text-[var(--color-on-brand)] text-sm font-black">열림</span>
          </div>
        </div>
      )}
    </div>
  );
};
import { buildPath, type PathNode } from '../lib/path';

const LEVEL_TITLES: Record<string, string> = { 기초: '경제 뉴스의 기본 단어', 중급: '용어끼리 연결하기', 고급: '경제 메커니즘 설명하기', 심화: '모형과 제도 깊이 보기' };
const COURSE_ROW = 136;
const COURSE_NODE = 54;
const courseNodeX = (index: number) => [12, 22, 14, 24, 16, 20][index % 6];
const COURSE_ART = [BookOpenText, House, TrendingUp, Landmark];

const CourseScreen = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { hydrated, contentStatus, retryContent, knownIds, courses, points, spendPoints, claimFirstLesson, openShop } = useAppContext();
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
  // 주제 = 레벨 안의 카테고리. courses는 sort_order가 레벨 순이라 첫 등장 순서대로 묶으면 기초→심화로 나열된다
  const topicKey = (sec: { course: { level: string; category: string } }) => `${sec.course.level}|${sec.course.category}`;
  const topics = useMemo(() => [...new Set(sections.map(topicKey))].map((key, index) => {
    const parts = sections.map((section, si) => ({ section, si })).filter(part => topicKey(part.section) === key);
    return {
      category: parts[0]!.section.course.category,
      index,
      parts,
      level: parts[0]!.section.course.level,
      known: parts.reduce((sum, part) => sum + part.section.knownCount, 0),
      total: parts.reduce((sum, part) => sum + part.section.course.words.length, 0),
      locked: parts[0]!.section.nodes[0]?.state === 'locked',
    };
  }), [sections]);
  const requestedTopic = searchParams.get('topic');
  const topicIndex = requestedTopic !== null && /^\d+$/.test(requestedTopic) ? Number(requestedTopic) : -1;
  const activeTopic = topics[topicIndex] ?? null;
  const backPath = activeTopic ? `/course?topic=${topicIndex}` : '/course';

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
    if (newlyDone.size === 0 || !activeTopic) return;
    const first = [...newlyDone.entries()].find(([, i]) => i === 0)?.[0];
    document.querySelector(`[data-node-id="${first}"]`)?.scrollIntoView({ block: 'center' });
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    const t = setTimeout(() => focusRef.current?.scrollIntoView({ block: 'center', behavior: 'smooth' }),
      reduce ? 0 : 400 + newlyDone.size * 150 + 900);
    return () => clearTimeout(t);
  }, [newlyDone, activeTopic]);

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
  const levelTabs = useMemo(() => ['전체', ...new Set(topics.map(topic => topic.level))], [topics]);
  const [selectedLevel, setSelectedLevel] = useState('전체');
  const jumpToLevel = (level: string) => {
    setSelectedLevel(level);
    if (level === '전체') {
      document.querySelector('.course-screen')?.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    const index = topics.findIndex(topic => topic.level === level);
    document.querySelector(`[data-topic-index="${index}"]`)?.scrollIntoView({ block: 'start', behavior: 'smooth' });
  };

  const focusRef = useRef<HTMLButtonElement>(null);
  useLayoutEffect(() => {
    document.querySelector('.course-screen')?.scrollTo({ top: 0 });
  }, [requestedTopic]);

  const spending = useRef(false);   // 연타로 spend_points가 두 번 나가지 않게
  const handleNodeTap = async (node: PathNode, index: number, courseKnown: number, courseTitle: string) => {
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
      await expandFromNode(node.id, courseTitle);
      navigate('/quiz', { state: { quizQueue: queue, backPath, nodeId: node.id, courseTitle } });
      return;
    }

    if (node.state !== 'done' && courseKnown === 0) {
      logClick('course_start', { course_id: node.courseId, title: node.courseId });
    }

    // 로컬 개발 서버에서는 포인트 없이 학습 화면을 확인할 수 있다.
    if (!import.meta.env.DEV) {
      if (spending.current) return;
      spending.current = true;
      try {
        const firstLesson = node.id === sections[0]?.nodes[0]?.id;
        const firstLessonAccess = firstLesson ? await claimFirstLesson(node.courseId) : 'ineligible';
        if (firstLessonAccess === 'error') {
          showModal('학습을 시작하지 못했어요. 잠시 후 다시 시도해 주세요', 'error');
          return;
        }
        if (firstLessonAccess !== 'free') {
          if (points < LESSON_COST) { logClick('lesson_blocked_points', { points }); openShop('lesson'); return; }
          if (!(await spendPoints(LESSON_COST, 'lesson'))) { openShop('lesson'); return; }
        }
      } finally { spending.current = false; }
    }
    feedbackNodeTap();
    await expandFromNode(node.id, courseTitle);
    navigate('/word-card', { state: { words: node.words, index: Math.max(0, node.words.findIndex(word => !knownIds.has(word.id))), backPath, autoAdvance: true, courseTitle } });
  };

  if (contentStatus === 'error' || (contentStatus === 'ready' && courses.length === 0)) return (
    <div className="flex h-full flex-col items-center justify-center gap-3 px-5 text-center bg-[var(--color-canvas)]">
      <h1 className="text-lg font-bold text-[var(--color-ink)]">학습 내용을 불러오지 못했어요</h1>
      <p className="text-sm text-[var(--color-ink-2)]">연결을 확인하고 다시 시도해 주세요.</p>
      <button type="button" onClick={retryContent} className="mt-3 w-full rounded-button bg-brand-500 py-4 text-sm font-bold">다시 시도</button>
    </div>
  );

  if (contentStatus === 'loading') return (
    <div className="flex h-full items-center justify-center bg-[var(--color-canvas)] text-sm text-[var(--color-ink-2)]">학습 내용을 불러오는 중이에요</div>
  );

  return (
    <div className="course-screen flex flex-col h-full bg-[var(--color-canvas)] pb-nav overflow-y-auto [&::-webkit-scrollbar]:hidden">
      <div className="px-5 pt-5 pb-4">
        {activeTopic ? (
          <div className="flex items-center gap-3">
            {/* 뒤로가기는 토스 내비게이션 바가 맡는다(자체 뒤로가기 중복은 검수 반려 사유) */}
            <div className="min-w-0">
              <h1 className="truncate text-xl font-bold tracking-tight text-[var(--color-ink)]">{activeTopic.category}</h1>
              <p className="mt-1! text-xs text-[var(--color-ink-3)]">{activeTopic.level} · {activeTopic.parts.length}개 코스 · {activeTopic.known}/{activeTopic.total}개 단어 학습</p>
            </div>
          </div>
        ) : (
          <>
            <h1 className="text-xl font-bold tracking-tight text-[var(--color-ink)]">전체 주제</h1>
            <p className="mt-1! text-xs text-[var(--color-ink-3)]">{topics.length}개 주제를 하나씩 완성해요</p>
          </>
        )}
      </div>
      {!activeTopic && <div className="sticky top-0 z-20 flex shrink-0 gap-2 overflow-x-auto bg-[var(--color-canvas)] px-5 py-3 [&::-webkit-scrollbar]:hidden">
        {levelTabs.map(level => (
          <button key={level} type="button" onClick={() => jumpToLevel(level)} aria-pressed={selectedLevel === level}
            className={`min-h-11 shrink-0 whitespace-nowrap px-4 py-2 text-xs font-semibold ${selectedLevel === level ? 'bg-[var(--color-ink)] text-[var(--color-card)]' : 'bg-[var(--color-card)] text-[var(--color-ink-2)]'}`}
            style={{ borderRadius: 9999 }}>
            {level}
          </button>
        ))}
      </div>}
      {!activeTopic && topics.map((topic, ti) => {
        const locked = topic.locked;
        const done = topic.total > 0 && topic.known >= topic.total;
        const Art = COURSE_ART[ti % COURSE_ART.length];
        const levelTopics = topics.filter(t => t.level === topic.level);
        const pathD = ti > 0 ? `M ${courseNodeX(ti - 1) + COURSE_NODE / 2} 28 C ${courseNodeX(ti - 1) + COURSE_NODE / 2} 76, ${courseNodeX(ti) + COURSE_NODE / 2} 52, ${courseNodeX(ti) + COURSE_NODE / 2} 101` : '';
        return (
          <section key={`${topic.level}-${topic.category}`} data-topic-index={ti} className="scroll-mt-14">
            {topic.level !== topics[ti - 1]?.level && LEVEL_TITLES[topic.level] && (
              <LevelGate level={topic.level} title={LEVEL_TITLES[topic.level]} stat={levelStats.get(topic.level)!}
                locked={locked} opening={openingLevels.has(topic.level)} />
            )}
            <div className="relative" style={{ height: COURSE_ROW }}>
              {ti > 0 && topic.level === topics[ti - 1]?.level && (
                <svg aria-hidden width={110} height={COURSE_ROW} className="absolute pointer-events-none" style={{ left: 0, top: -COURSE_ROW / 2 }}>
                  <path d={pathD} fill="none" stroke="var(--color-line-strong)" strokeWidth={3} strokeLinecap="round" strokeDasharray="2 10" />
                </svg>
              )}
              <button type="button" disabled={locked}
                onClick={() => setSearchParams({ topic: String(ti) })} aria-label={`${topic.level} ${topic.category} 주제 열기`}
                className={`absolute flex items-center justify-center disabled:cursor-default ${done ? 'bg-[var(--color-brand-soft)] text-brand-500' : locked ? 'bg-[var(--color-card)] text-[var(--color-ink-3)]' : 'bg-brand-500 text-white'}`}
                style={{ top: (COURSE_ROW - COURSE_NODE) / 2, left: courseNodeX(ti), width: COURSE_NODE, height: COURSE_NODE, borderRadius: 9999 }}>
                {locked ? <LockKeyhole size={23} /> : done ? <Check size={27} strokeWidth={3} /> : <Art size={25} strokeWidth={2.2} />}
              </button>
              <button type="button" disabled={locked} onClick={() => setSearchParams({ topic: String(ti) })}
                className={`absolute left-[98px] right-5 top-3 flex min-h-28 flex-col justify-center border-2 bg-[var(--color-card)] px-4 py-3 text-left disabled:cursor-default ${!done && !locked ? 'border-brand-500' : 'border-transparent'}`}
                style={{ borderRadius: 18 }}>
                <span className="flex items-center justify-between gap-2 text-2xs text-[var(--color-ink-3)]">
                  <span>{topic.level} · 주제 {levelTopics.indexOf(topic) + 1}/{levelTopics.length}</span>
                  {/* 지금 할 주제만 선명하게, 완료는 조용하게 */}
                  {!done && !locked
                    ? <span className="rounded-full bg-brand-500 px-2 py-0.5 text-2xs font-bold text-white">이어하기</span>
                    : <span className="font-semibold">{done ? '완료' : '잠김'}</span>}
                </span>
                <span className="mt-1.5 block text-sm font-bold text-[var(--color-ink)] leading-snug break-keep">{topic.category}</span>
                {locked && <span className="mt-1 text-2xs text-[var(--color-ink-2)]">앞의 레슨을 마치면 시작할 수 있어요</span>}
                <span className="mt-2 flex items-center gap-2 text-2xs text-[var(--color-ink-3)]">
                  <span className="h-1.5 min-w-0 flex-1 overflow-hidden rounded-full bg-[var(--color-button-secondary)]">
                    <span className={`block h-full rounded-full ${done ? 'bg-[var(--color-line-strong)]' : 'bg-brand-500'}`} style={{ width: `${topic.total ? (topic.known / topic.total) * 100 : 0}%` }} />
                  </span>
                  <span className="shrink-0 tabular-nums">{topic.known}/{topic.total}</span>
                </span>
              </button>
            </div>
          </section>
        );
      })}
      {activeTopic && activeTopic.parts.map(({ section: sec, si }) => {
        const Art = COURSE_ART[si % COURSE_ART.length];
        return (
        <section key={sec.course.id} data-section-index={si} className="scroll-mt-4">
          <div className={`sticky top-0 z-10 mx-5 mt-4 mb-3 overflow-hidden rounded-card bg-[var(--color-card)] px-5 py-5 ${sec.course.id === focus?.courseId ? 'anim-fade' : ''}`}>
            {/* 코스 제목이 화면 제목(주제명)과 같으면 반복하지 않고 진행 정도만 보여준다 */}
            {sec.course.title !== activeTopic.category && <div className="relative mb-4 flex items-center gap-4">
              <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[var(--color-brand-soft)] text-brand-500"><Art size={30} strokeWidth={1.8} /></span>
              <div className="min-w-0">
                <p className="text-2xs text-[var(--color-ink-3)]">{sec.course.level} · {si + 1}/{sections.length}</p>
                <h3 className="mt-1! text-base font-bold text-[var(--color-ink)] break-keep tracking-[-0.025em]">{sec.course.title}</h3>
              </div>
            </div>}
            <p className="mb-2 text-xs font-semibold text-[var(--color-ink-2)]">{sec.course.words.length}개 단어 중 {sec.knownCount}개 학습</p>
            <div className="relative flex items-center gap-3">
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[var(--color-button-secondary)]">
                <div className={`h-full rounded-full bg-brand-500 ${sec.course.id === focus?.courseId ? 'course-progress-reveal' : ''}`} style={{ width: `${sec.course.words.length ? (sec.knownCount / sec.course.words.length) * 100 : 0}%` }} />
              </div>
              <span className="min-w-10 text-right text-2xs font-semibold tabular-nums text-[var(--color-ink-3)]">{sec.course.words.length ? Math.round((sec.knownCount / sec.course.words.length) * 100) : 0}%</span>
            </div>
          </div>

          {sec.nodes.map((node, k) => {
            const isFocus = node.id === focusId;
            const done = isDone(node);
            const locked = node.state === 'locked';
            const title = node.type === 'lesson'
              ? `${node.words[0]?.word ?? '단어 학습'}${node.words.length > 1 ? ` 외 ${node.words.length - 1}개` : ''}`
              : node.type === 'quiz' ? '배운 단어 확인하기' : '핵심 단어 복습하기';
            const Icon = node.type === 'quiz' ? CircleHelp : node.type === 'review' ? Brain : Layers3;
            return (
              <div key={node.id} className="mx-5 mb-2.5">
                <button ref={isFocus ? focusRef : undefined} type="button" disabled={locked} data-own-sfx data-node-id={node.id}
                  onClick={() => handleNodeTap(node, k, sec.knownCount, sec.course.title)}
                  className={`flex w-full items-center gap-3 border-2 px-4 py-4 text-left disabled:cursor-default ${isFocus ? 'border-brand-500 bg-[var(--color-brand-soft)]' : 'border-transparent bg-[var(--color-card)]'} ${newlyDone.has(node.id) ? 'anim-stamp' : ''}`}
                  style={{ borderRadius: 18, '--d': `${0.2 + (newlyDone.get(node.id) ?? 0) * 0.15}s` } as React.CSSProperties}>
                  <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${done ? 'bg-[var(--color-brand-soft)] text-brand-500' : isFocus ? 'bg-brand-500 text-white' : 'bg-[var(--color-surface)] text-[var(--color-ink-3)]'}`}>
                    {locked ? <LockKeyhole size={20} /> : done ? <Check size={22} strokeWidth={3} /> : <Icon size={21} />}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2 text-2xs text-[var(--color-ink-3)]">
                      {si + 1}-{k + 1} · {node.type === 'lesson' ? '학습' : node.type === 'quiz' ? '퀴즈' : '복습'}
                      <span className={isFocus ? 'font-bold text-brand-600' : done ? 'font-bold text-brand-500' : ''}>{done ? '완료' : isFocus ? '진행 중' : locked ? '잠김' : '도전 가능'}</span>
                    </span>
                    <span className="mt-1 block text-sm font-bold text-[var(--color-ink)] break-keep">{title}</span>
                    {locked && <span className="mt-1 block text-2xs text-[var(--color-ink-2)]">앞의 레슨을 마치면 시작할 수 있어요</span>}
                    <span className="mt-1 flex items-center gap-1 text-2xs text-[var(--color-ink-3)]"><Clock3 size={12} />{node.words.length}개 용어</span>
                  </span>
                  {!locked && <ChevronRight size={17} className="shrink-0 text-[var(--color-ink-3)]" />}
                </button>
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
