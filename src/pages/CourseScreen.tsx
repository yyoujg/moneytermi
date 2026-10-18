import React, { useMemo, useRef, useLayoutEffect, useEffect, useState } from 'react';
import { ChevronRight as ActionChevronRight } from 'lucide-react';
import { BookOpenText, ListChecks, LockKeyhole, RotateCcw } from '../components/ui/OtterIcons';
import { ChevronRight } from '../components/ui/ControlIcons';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { logClick } from '../lib/analytics';
import { ENERGY_ACTION_COST } from '../constants';
import { feedbackNodeTap } from '../lib/feedback';
import { loadDoneNodes } from '../lib/pathProgress';
import { Storage } from '../lib/storage';
import { COURSE_REVIEW_COUNT, LESSON_WARMUP_COUNT, firstUnknownWordIndex, learnedOrFallbackWords, selectCourseQuizWords } from '../lib/coursePractice';
import { learningOutcomeFor } from '../lib/learningOutcome';
import { ActionButton } from '../components/ui/ActionButton';
import { OTTER_IMAGES } from '../lib/otter';
import { buildPath, type PathNode } from '../lib/path';

const SEEN_KEY = 'path_seen_done';   // 코스 화면에서 마지막으로 본 완료 노드들(도장 연출용)

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
  Object.assign(ov.style, { position: 'fixed', left: `${left}px`, top: `${top}px`, width: `${app?.width ?? window.innerWidth}px`, height: `${app?.height ?? window.innerHeight}px`, zIndex: '2000', pointerEvents: 'none', overflow: 'hidden', background: 'var(--color-card)', display: 'flex', alignItems: 'center', justifyContent: 'center' });
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

const nodeCopy = (node: PathNode) => {
  if (node.type === 'lesson') {
    return {
      kind: '학습',
      title: `${node.words[0]?.word ?? '새 용어'}부터 시작하기`,
      meta: `${node.words.length}개 용어, 쉬운 예시로 확인`,
    };
  }
  if (node.type === 'quiz') {
    return {
      kind: '용어 퀴즈',
      title: '살펴본 용어 확인하기',
      meta: '용어의 뜻과 예시 확인',
    };
  }
  const finalReview = node.id.endsWith('-r');
  return {
    kind: finalReview ? '누적 복습' : '중간 복습',
    title: finalReview ? '배운 용어 다시 연결하기' : '오늘 익힌 용어 다시 보기',
    meta: `${node.words.length}개 용어 섞어서 복습`,
  };
};

const CourseScreen = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { hydrated, contentStatus, retryContent, viewedIds: knownIds, courses, energy, spendEnergy, pickRecallWords, openShop } = useAppContext();
  // 이 기기에서 끝낸 퀴즈·복습 노드. 화면에 돌아올 때마다 다시 읽는다(퀴즈 끝내고 돌아온 직후 반영).
  const [doneNodes, setDoneNodes] = useState<Set<string>>(new Set());
  const [doneNodesLoaded, setDoneNodesLoaded] = useState(false);
  const [resumeCourseId, setResumeCourseId] = useState<string | null>(null);
  useEffect(() => {
    let cancelled = false;
    Storage.getItem('learning_resume_course_v1').then(id => { if (!cancelled) setResumeCourseId(id); }).catch(() => {});
    loadDoneNodes()
      .then(nodes => { if (!cancelled) setDoneNodes(nodes); })
      .finally(() => { if (!cancelled) setDoneNodesLoaded(true); });
    return () => { cancelled = true; };
  }, []);

  const sections = useMemo(() => buildPath(courses, knownIds), [courses, knownIds]);
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
  const focusRef = useRef<HTMLButtonElement>(null);

  const isDone = (node: PathNode) => node.state === 'done' || (doneNodes.has(node.id) && node.state === 'available');

  // 지난번에 본 뒤 새로 끝낸 노드: 도장 연출 + 들어오는 경로가 색으로 그려진다. 첫 방문(기록 없음)은 연출 없이 기록만.
  const [newlyDone, setNewlyDone] = useState<Map<string, number>>(new Map());
  const [stampCheckReady, setStampCheckReady] = useState(false);
  const stampedRef = useRef(false);
  useEffect(() => {
    if (stampedRef.current || !hydrated || !doneNodesLoaded || sections.length === 0) return;
    stampedRef.current = true;
    const now = sections.flatMap(sec => sec.nodes.filter(isDone).map(n => n.id));
    Storage.getItem(SEEN_KEY).catch(() => null).then(raw => {
      if (raw) {
        const seen = new Set<string>(JSON.parse(raw));
        const fresh = now.filter(id => !seen.has(id)).slice(-8);   // 한 번에 너무 많이 찍히지 않게 최근 8개만
        setNewlyDone(new Map(fresh.map((id, i) => [id, i])));
      }
      Storage.setItem(SEEN_KEY, JSON.stringify(now)).catch(() => {});
    }).finally(() => setStampCheckReady(true));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated, doneNodesLoaded, sections, doneNodes]);

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
    const resumeTopic = topics.find(topic => topic.parts.some(part => part.section.course.id === resumeCourseId));
    const candidates = activeTopic ? activeTopic.parts.map(part => part.section) : [...(resumeTopic?.parts.map(part => part.section) ?? []), ...sections];
    for (const sec of candidates) {
      const k = sec.nodes.findIndex(node => node.state === 'current');
      if (k >= 0) return { id: sec.nodes[k].id, index: k, courseId: sec.course.id };
    }
    return null;
  };
  const focus = findFocus();
  const focusId = focus?.id ?? null;
  const newlyDoneCount = newlyDone.size;
  const levelTabs = useMemo(() => ['전체', ...new Set(topics.map(topic => topic.level))], [topics]);
  const [selectedLevel, setSelectedLevel] = useState('전체');
  const visibleTopics = topics.filter(topic => selectedLevel === '전체' || topic.level === selectedLevel);
  const focusTopic = focus ? topics.find(topic => topic.parts.some(part => part.section.course.id === focus.courseId)) : null;
  const focusPercent = focusTopic?.total ? Math.round(focusTopic.known / focusTopic.total * 100) : 0;

  useLayoutEffect(() => {
    document.querySelector('.course-screen')?.scrollTo({ top: 0 });
  }, [requestedTopic]);

  useEffect(() => {
    if (!hydrated || !stampCheckReady || newlyDoneCount > 0) return;
    const target = activeTopic ? focusRef.current : null;
    if (!target) return;
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    const t = setTimeout(() => target.scrollIntoView({ block: 'center', behavior: reduce ? 'auto' : 'smooth' }), reduce ? 0 : 80);
    return () => clearTimeout(t);
  }, [hydrated, stampCheckReady, newlyDoneCount, activeTopic, focusId, requestedTopic]);

  const spending = useRef(false);   // 연타로 spend_points가 두 번 나가지 않게
  const handleNodeTap = async (node: PathNode, index: number, courseKnown: number, courseTitle: string) => {
    // disabled 버튼은 click이 안 오지만, 웹뷰/리셋 CSS에 따라 새는 경우가 있어 한 번 더 막는다.
    if (node.state === 'locked') return;
    if (spending.current) return;
    spending.current = true;
    logClick('path_node_click', { course_id: node.courseId, type: node.type, index, state: node.state });

    try {
      const needsEnergy = !isDone(node) && node.type !== 'review';
      const accessKey = `${node.id}:${node.words.map(word => word.id).join(',')}`;
      if (node.type === 'quiz' || node.type === 'review') {
        if (needsEnergy && !(await spendEnergy(ENERGY_ACTION_COST, node.type, accessKey))) {
          logClick('energy_blocked', { type: node.type, energy, node_id: node.id, course_id: node.courseId });
          openShop('energy');
          return;
        }
        const pool = learnedOrFallbackWords(node.words, knownIds);
        const queue = node.type === 'review'
          ? pickRecallWords({ candidates: pool, count: COURSE_REVIEW_COUNT })
          : selectCourseQuizWords(node.words, knownIds);
        feedbackNodeTap();
        await expandFromNode(node.id, courseTitle);
        navigate('/quiz', { state: { quizQueue: queue, backPath, nodeId: node.id, courseId: node.courseId, courseTitle, reviewMode: node.type === 'review', mode: node.type === 'review' ? 'course_review' : 'course_quiz' } });
        return;
      }

      if (needsEnergy && !(await spendEnergy(ENERGY_ACTION_COST, node.type, accessKey))) {
        logClick('energy_blocked', { type: node.type, energy, node_id: node.id, course_id: node.courseId });
        openShop('energy');
        return;
      }
      if (node.state !== 'done' && courseKnown === 0) {
        logClick('course_start', { course_id: node.courseId, title: courseTitle });
      }
      logClick('lesson_start', { course_id: node.courseId, node_id: node.id, total: node.words.length, revisiting: node.state === 'done' });
      setResumeCourseId(node.courseId);
      void Storage.setItem('learning_resume_course_v1', node.courseId).catch(() => {});
      feedbackNodeTap();
      await expandFromNode(node.id, courseTitle);
      const lessonState = { words: node.words, index: firstUnknownWordIndex(node.words, knownIds), backPath, autoAdvance: true, courseTitle, courseId: node.courseId, nodeId: node.id };
      const recallWords = needsEnergy ? pickRecallWords({ excludeIds: node.words.map(word => word.id), count: LESSON_WARMUP_COUNT }) : [];
      if (recallWords.length > 0) {
        navigate('/quiz', {
          state: {
            quizQueue: recallWords,
            backPath,
            reviewMode: true,
            mode: 'lesson_warmup',
            courseId: node.courseId,
            lessonId: node.id,
            nextRoute: { pathname: '/word-card', state: lessonState, label: '새 용어 보기' },
          },
        });
      } else {
        navigate('/word-card', { state: lessonState });
      }
    } finally {
      spending.current = false;
    }
  };

  if (contentStatus === 'error' || (contentStatus === 'ready' && courses.length === 0)) return (
    <div className="app-soft-screen flex h-full flex-col items-center justify-center gap-3 px-5 text-center">
      <h1 className="text-lg font-bold text-[var(--color-ink)]">학습 내용을 불러오지 못했어요</h1>
      <p className="text-sm text-[var(--color-ink-2)]">연결을 확인하고 다시 시도해 주세요.</p>
      <button type="button" onClick={retryContent} className="mt-3 w-full rounded-button bg-brand-500 py-4 text-sm font-bold">다시 시도</button>
    </div>
  );

  if (contentStatus === 'loading') return (
    <div className="app-soft-screen flex h-full items-center justify-center text-sm text-[var(--color-ink-2)]">학습 내용을 불러오는 중이에요</div>
  );

  return (
    <div className="course-screen app-soft-screen flex flex-col h-full pb-nav overflow-y-auto [&::-webkit-scrollbar]:hidden">
      <div className={activeTopic ? 'px-5 pt-5 pb-4' : 'course-home-header'}>
        {activeTopic ? (
          <div className="flex items-center gap-3">
            {/* 뒤로가기는 토스 내비게이션 바가 맡는다(자체 뒤로가기 중복은 검수 반려 사유) */}
            <div className="min-w-0">
              <h1 className="truncate text-xl font-bold tracking-tight text-[var(--color-ink)]">{activeTopic.category}</h1>
              <p className="mt-1! text-xs text-[var(--color-ink-3)]">{activeTopic.level} · {activeTopic.parts.length}개 코스 · {activeTopic.known}/{activeTopic.total}개 용어 확인</p>
              <p className="mt-1! text-xs text-[var(--color-ink-3)] break-keep leading-relaxed">{learningOutcomeFor({ category: activeTopic.category })}</p>
            </div>
          </div>
        ) : (
          <>
            <h1 className="text-2xl font-bold tracking-tight text-[var(--color-ink)]">오늘의 학습</h1>
            <p className="mt-1! text-sm leading-relaxed text-[var(--color-ink-3)] break-keep">가볍게 시작하고, 차근차근 쌓아가요.</p>
          </>
        )}
      </div>
      {!activeTopic && <>
        <section aria-label="오늘 할 학습" className="course-home-hero">
          <div className="course-home-hero-heading">
            <div className="min-w-0 flex-1">
              <p className="course-home-eyebrow">{focusTopic ? focusTopic.known > 0 ? '이어서 배울 주제' : '추천 학습' : '차곡차곡 쌓인 배움'}{focusTopic && <span> · {focusTopic.level}</span>}</p>
              <h2 className="course-home-hero-title">{focusTopic?.category ?? '주제를 다시 살펴볼까요?'}</h2>
              {!focusTopic && <p className="course-home-hero-description">배운 용어와 예시를 가볍게 되짚어보세요.</p>}
            </div>
            <img src={OTTER_IMAGES.study} alt="" aria-hidden="true" width={96} height={96} className="course-home-otter" />
          </div>
          {focusTopic && <div className="course-home-hero-progress">
            <div className="flex items-center justify-between gap-3">
              <p>확인한 용어 <span className="font-semibold text-[var(--color-ink-2)]">{focusTopic.known}/{focusTopic.total}개</span></p>
              <span className="tabular-nums">{focusPercent}%</span>
            </div>
            <div role="progressbar" aria-label="이어 배울 주제 진행률" aria-valuemin={0} aria-valuemax={100} aria-valuenow={focusPercent} className="course-home-progress-track">
              <span style={{ width: `${focusPercent}%` }} />
            </div>
          </div>}
          {focus && focusTopic && <ActionButton onClick={() => {
            logClick('learning_continue', { course_id: focus.courseId, node_id: focus.id });
            setSearchParams({ topic: String(focusTopic.index) });
          }} className="course-home-primary">
            <span>{knownIds.size > 0 ? '이어 배우기' : '첫 주제 시작하기'}</span><ActionChevronRight size={20} strokeWidth={2.5} absoluteStrokeWidth aria-hidden="true" focusable="false" />
          </ActionButton>}
        </section>

        <section aria-label="학습 주제" className="course-home-catalog">
          <div className="course-home-catalog-heading">
            <h2>주제 둘러보기</h2><span>{visibleTopics.length}개 주제</span>
          </div>
          <div role="group" aria-label="학습 난이도" className="course-home-filters">
            {levelTabs.map(level => <button key={level} type="button" onClick={() => setSelectedLevel(level)} aria-pressed={selectedLevel === level} className="course-home-filter">{level}</button>)}
          </div>
          <div className="course-home-topic-list">
            {visibleTopics.map(topic => {
              const locked = topic.locked;
              const done = topic.total > 0 && topic.known >= topic.total;
              const isCurrent = topic.index === focusTopic?.index;
              const percent = topic.total ? Math.round(topic.known / topic.total * 100) : 0;
              return <button key={`${topic.level}-${topic.category}`} type="button" disabled={locked} data-topic-index={topic.index} data-current={isCurrent || undefined}
                onClick={() => setSearchParams({ topic: String(topic.index) })} aria-label={`${topic.level} ${topic.category} 주제 열기`} aria-describedby={`topic-summary-${topic.index}`} className="course-home-topic">
                <span className="course-home-topic-heading"><BookOpenText size={30} className="course-home-topic-icon" aria-hidden="true" /><span className="course-home-topic-title">{topic.category}</span>{locked ? <LockKeyhole size={17} aria-hidden="true" /> : <ChevronRight size={18} aria-hidden="true" />}</span>
                <span className="course-home-topic-description">{learningOutcomeFor({ category: topic.category })}</span>
                <span id={`topic-summary-${topic.index}`} className="course-home-topic-meta"><span>{topic.level} · {topic.known}/{topic.total}개 용어 확인</span><span className={isCurrent ? 'font-semibold text-[var(--color-ink-2)]' : ''}>{locked ? '잠김' : done ? '살펴봄' : topic.known > 0 ? '진행 중' : isCurrent ? '추천' : '시작 전'}</span></span>
                <span role="progressbar" aria-label={`${topic.category} 진행률`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={percent} className="course-home-progress-track"><span className={locked || done ? 'course-home-progress-muted' : ''} style={{ width: `${percent}%` }} /></span>
              </button>;
            })}
          </div>
        </section>
      </>}
      {activeTopic && activeTopic.parts.map(({ section: sec, si }, partIndex) => {
        const pct = sec.course.words.length ? Math.round((sec.knownCount / sec.course.words.length) * 100) : 0;
        return (
        <section key={sec.course.id} data-section-index={si} className="scroll-mt-4">
          <div className={`course-topic-summary sticky top-0 z-10 mx-5 mt-3 mb-4 overflow-hidden rounded-card border border-[var(--color-line)] bg-[var(--color-card)] px-4 py-4 ${sec.course.id === focus?.courseId ? 'anim-fade' : ''}`}>
            {/* 코스 제목이 화면 제목(주제명)과 같으면 반복하지 않고 진행 정도만 보여준다 */}
            {sec.course.title !== activeTopic.category && <div className="relative mb-4 flex items-start gap-3">
              <span aria-hidden="true" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-chip border border-[var(--color-line)] text-lg font-semibold tabular-nums text-[var(--color-ink-3)]">{String(partIndex + 1).padStart(2, '0')}</span>
              <div className="min-w-0">
                <p className="text-2xs font-bold text-brand-600">{sec.course.level} · 코스 {partIndex + 1}/{activeTopic.parts.length}</p>
                <h3 className="mt-1! text-[17px] font-black text-[var(--color-ink)] break-keep tracking-[-0.01em] leading-snug">{sec.course.title}</h3>
                <p className="mt-1! text-xs text-[var(--color-ink-3)] break-keep leading-relaxed">{learningOutcomeFor({ category: sec.course.category, title: sec.course.title, words: sec.course.words })}</p>
              </div>
            </div>}
            <div className="mb-2 flex items-center justify-between gap-3 text-xs font-bold">
              <p className="text-[var(--color-ink-2)]"><span className="text-brand-600">{sec.knownCount}개</span> 확인 / {sec.course.words.length}개 용어</p>
              <span className="tabular-nums text-[var(--color-ink-3)]">{pct}%</span>
            </div>
            <div className="relative flex items-center">
              <div role="progressbar" aria-label={`${sec.course.title} 진행률`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct} className="h-2 flex-1 overflow-hidden rounded-full bg-[var(--color-button-secondary)]">
                <div className={`h-full rounded-full bg-brand-500 ${sec.course.id === focus?.courseId ? 'course-progress-reveal' : ''}`} style={{ width: `${sec.course.words.length ? (sec.knownCount / sec.course.words.length) * 100 : 0}%` }} />
              </div>
            </div>
          </div>

          {sec.nodes.map((node, k) => {
            const isFocus = node.id === focusId;
            const done = isDone(node);
            const locked = node.state === 'locked';
            const copy = nodeCopy(node);
            const Icon = node.type === 'quiz' ? ListChecks : node.type === 'review' ? RotateCcw : BookOpenText;
            const inProgress = node.type === 'lesson' && !done && node.words.some(word => knownIds.has(word.id));
            const nodeCardClass = locked
              ? 'border-[var(--color-line)] bg-[var(--color-surface)]'
              : isFocus ? 'course-node-current border-[var(--color-line)] bg-[var(--color-card)]' : 'border-transparent bg-[var(--color-card)]';
            const nodeStatus = done ? node.type === 'lesson' ? '살펴봄' : '풀이 완료' : locked ? '잠김' : inProgress ? '진행 중' : '시작 가능';
            return (
              <div key={node.id} className="mx-5 mb-4">
                <button ref={isFocus ? focusRef : undefined} type="button" disabled={locked} data-own-sfx data-node-id={node.id}
                  onClick={() => handleNodeTap(node, k, sec.knownCount, sec.course.title)}
                  className={`course-node-card flex w-full items-center gap-3 border px-4 py-3.5 text-left disabled:cursor-default ${nodeCardClass} ${newlyDone.has(node.id) ? 'anim-stamp' : ''}`}
                  style={{ borderRadius: 'var(--shape-card)', '--d': `${0.2 + (newlyDone.get(node.id) ?? 0) * 0.15}s` } as React.CSSProperties}>
                  <span className="min-w-0 flex-1">
                    <span className={`flex flex-wrap items-center gap-x-2 gap-y-1 text-2xs ${locked ? 'text-[var(--color-ink-4)]' : 'text-[var(--color-ink-3)]'}`}>
                      <span className="inline-flex items-center gap-1.5">
                        <Icon size={16} strokeWidth={1.75} aria-hidden="true" data-learning-icon={node.type} className="shrink-0" />
                        {partIndex + 1}-{k + 1} · {copy.kind}
                      </span>
                      <span data-learning-status className={`font-medium ${locked ? 'text-[var(--color-ink-4)]' : isFocus ? 'text-[var(--color-ink-2)]' : 'text-[var(--color-ink-3)]'}`}>{nodeStatus}</span>
                    </span>
                    <span className={`mt-1 block text-sm font-bold break-keep ${locked ? 'text-[var(--color-ink-3)]' : 'text-[var(--color-ink)]'}`}>{copy.title}</span>
                    {locked && <span className="mt-1 block text-2xs text-[var(--color-ink-4)]">앞의 레슨을 마치면 시작할 수 있어요</span>}
                    <span className={`mt-1 flex items-center gap-1 text-xs ${locked ? 'text-[var(--color-ink-3)]' : 'text-[var(--color-ink-2)]'}`}>{copy.meta}</span>
                    {!locked && <span className="mt-1 block text-2xs text-[var(--color-ink-4)]">{done || node.type === 'review' ? '무료' : '처음 시작할 때 에너지 1 - 중단 후 이어하기 무료'}</span>}
                  </span>
                  {!locked && <ChevronRight size={20} strokeWidth={1.75} aria-hidden="true" data-learning-action className="shrink-0 text-[var(--color-ink-3)]" />}
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
