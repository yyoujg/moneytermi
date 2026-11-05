import React, { useMemo, useRef, useLayoutEffect, useEffect, useState } from 'react';
import { LockKeyhole } from '../components/ui/OtterIcons';
import { BottomSheet, List, ListRow } from '@toss/tds-mobile';
import { TopicThumb } from '../components/TopicThumb';
import { COURSE_NAMES } from '../lib/topicImages';
import { ChevronDown, ChevronRight } from '../components/ui/ControlIcons';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { logClick } from '../lib/analytics';
import { ENERGY_ACTION_COST, levelLabel } from '../constants';
import { feedbackNodeTap } from '../lib/feedback';
import { loadDoneNodes } from '../lib/pathProgress';
import { Storage } from '../lib/storage';
import { COURSE_REVIEW_COUNT, LESSON_WARMUP_COUNT, firstUnknownWordIndex, learnedOrFallbackWords, selectCourseQuizWords } from '../lib/coursePractice';
import { ActionButton } from '../components/ui/ActionButton';
import { buildPath, type PathNode } from '../lib/path';

const SEEN_KEY = 'path_seen_done';   // 코스 화면에서 마지막으로 본 완료 노드들(도장 연출용)
// 징검다리 옆 장식 수달: 수달 포즈와 리그 등급 장면(이전 등급 그림 v3)을 번갈아 쓴다
const STEP_BUDDIES = [
  '/otter/v5/otter-explain.svg', '/league/v3/league-02-ledger.svg', '/otter/v5/otter-cheer.svg', '/league/v3/league-04-savings.svg',
  '/otter/v5/otter-idle.svg', '/league/v3/league-06-news.svg', '/otter/v5/otter-shock.svg', '/league/v3/league-07-investor.svg',
  '/league/v3/league-01-empty.svg', '/league/v3/league-03-saver.svg', '/league/v3/league-05-routine.svg', '/league/v3/league-08-holder.svg',
  '/league/v3/league-09-rich.svg', '/league/v3/league-10-master.svg',
];
const LEVEL_TABS = ['전체', '기초', '중급', '고급', '심화'];

// 노드를 누르면 브랜드색 원이 화면 가득 퍼지고 로고를 보여준 뒤 다음 화면으로 넘어간다.
// 오버레이를 body에 붙여 화면 전환 뒤에도 남게 한다. 동작 줄이기·WAAPI 미지원이면 바로 넘어간다.
// 코스 표시 이름: 용어로 지은 이름(COURSE_NAMES), 없으면 원래 제목
const courseName = (course: { id: string; title: string }) => COURSE_NAMES[course.id] ?? course.title;

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
      title: node.words.length > 1 ? `${node.words[0].word} 외 ${node.words.length - 1}개` : node.words[0]?.word ?? '새 용어',
    };
  }
  if (node.type === 'quiz') {
    return {
      kind: '용어 퀴즈',
      title: '살펴본 용어 확인하기',
    };
  }
  const finalReview = node.id.endsWith('-r');
  return {
    kind: finalReview ? '누적 복습' : '중간 복습',
    title: finalReview ? '배운 용어 다시 연결하기' : '오늘 익힌 용어 다시 보기',
  };
};

const CourseScreen = () => {
  const navigate = useNavigate();
  const isCatalog = useLocation().pathname === '/course/topics';
  const [searchParams, setSearchParams] = useSearchParams();
  const { hydrated, contentStatus, retryContent, viewedIds: knownIds, courses, energy, energyMax, spendEnergy, pickRecallWords, openShop } = useAppContext();
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

  // 필수 단계(학습·퀴즈)는 전체 학습 순서(기초의 모든 주제 → 중급 …, courses의 sort_order)대로만 연다.
  // 안 끝낸 첫 단계 하나만 열고 그 뒤의 미완료 단계는 다른 주제·다음 난이도까지 모두 잠근다. 복습은 선택이라 잠그지 않는다
  const sections = useMemo(() => {
    let opened = false;
    return buildPath(courses, knownIds).map(sec => {
      return { ...sec, nodes: sec.nodes.map(node => {
        if (node.type === 'review') return node;
        const done = node.state === 'done' || (doneNodes.has(node.id) && node.state === 'available');
        if (done) return node;
        if (!opened) { opened = true; return node; }
        return { ...node, state: 'locked' as const };
      }) };
    });
  }, [courses, knownIds, doneNodes]);
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
      // 잠김 = 남은 필수 단계가 있는데 지금 할 수 있는 단계가 하나도 없음(전체 순서상 앞 코스를 덜 끝냄)
      locked: (() => {
        const steps = parts.flatMap(part => part.section.nodes).filter(node => node.type !== 'review');
        const doneStep = (node: PathNode) => node.state === 'done' || (doneNodes.has(node.id) && node.state === 'available');
        return steps.some(node => !doneStep(node)) && !steps.some(node => !doneStep(node) && node.state !== 'locked');
      })(),
    };
  }), [sections, doneNodes]);
  const requestedTopic = searchParams.get('topic');
  const topicIndex = requestedTopic !== null && /^\d+$/.test(requestedTopic) ? Number(requestedTopic) : -1;
  const activeTopic = isCatalog ? null : topics[topicIndex] ?? null;
  // 학습에서 돌아올 코스(뒤로 경로에 넣어 그 코스 머리로 스크롤): 요청한 코스(?course=), 없으면 안 끝낸 첫 코스, 다 끝냈으면 마지막 코스
  const requestedCourse = searchParams.get('course');
  const shownPart = activeTopic
    ? activeTopic.parts.find(part => part.section.course.id === requestedCourse)
      ?? activeTopic.parts.find(part => part.section.nodes.some(node => node.type !== 'review' && node.state !== 'done' && !(doneNodes.has(node.id) && node.state === 'available')))
      ?? activeTopic.parts[activeTopic.parts.length - 1]
    : undefined;
  const backPath = activeTopic ? `/course?topic=${topicIndex}${shownPart ? `&course=${shownPart.section.course.id}` : ''}` : '/course';
  const focusRef = useRef<HTMLButtonElement>(null);

  const isDone = (node: PathNode) => node.state === 'done' || (doneNodes.has(node.id) && node.state === 'available');
  const isStep = (node: PathNode) => node.type !== 'review';
  // 복습은 단계로 세지 않는다(순서를 막지 않는 덤이라 번호 대신 배지로 표시). 진행은 학습·퀴즈 단계로만 센다
  const topicSteps = (topic: (typeof topics)[number]) => topic.parts.reduce((acc, part) => { const steps = part.section.nodes.filter(isStep); return { done: acc.done + steps.filter(isDone).length, total: acc.total + steps.length }; }, { done: 0, total: 0 });
  const topicStepsDone = (topic: (typeof topics)[number]) => { const steps = topicSteps(topic); return steps.total > 0 && steps.done >= steps.total; };

  // 지난번에 본 뒤 새로 끝낸 노드: 도장 연출 + 들어오는 경로가 색으로 그려진다. 첫 방문(기록 없음)은 연출 없이 기록만.
  const [newlyDone, setNewlyDone] = useState<Map<string, number>>(new Map());
  // 길에는 돌(체크·번호·복습)만 두고, 돌을 누르면 그 단계(역할·제목·열기)를 옆 말풍선으로 띄운다.
  // 한 번에 하나, 바깥을 누르면 닫힘. 처음엔 지금 할 단계(focus) 말풍선을 열어 둔다(undefined = 기본값)
  const [bubbleId, setBubbleId] = useState<string | null>(null);
  // 주제 머리도 스크롤 중 고정한다. 코스 머리는 그 높이만큼 아래에 붙는다(CSS --topic-header-h)
  const topicHeaderRef = useRef<HTMLDivElement>(null);
  const [topicHeaderH, setTopicHeaderH] = useState(0);
  // 내용이 로딩 화면일 땐 머리가 없어 0이 되므로 로딩 상태도 다시 잰다
  useLayoutEffect(() => { setTopicHeaderH(topicHeaderRef.current?.offsetHeight ?? 0); }, [activeTopic?.category, contentStatus]);
  // 학습 결과에서 '코스에서 이어 하기'로 오면 다음 할 단계 말풍선을 바로 열어 둔다
  const openFocusOnReturn = useRef((useLocation().state as { openFocus?: boolean } | null)?.openFocus === true);
  const homeRailRef = useRef<HTMLDivElement>(null);
  // 주제 화면 머리를 누르면 같은 난이도의 다른 주제로 옮기는 시트
  const [topicPicker, setTopicPicker] = useState(false);
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
      // 지금 할 단계 = 잠기지 않은 첫 미완료 필수 단계(앞 퀴즈를 안 풀었으면 퀴즈)
      const k = sec.nodes.findIndex(node => isStep(node) && !isDone(node) && node.state !== 'locked');
      if (k >= 0) return { id: sec.nodes[k].id, type: sec.nodes[k].type, index: k, courseId: sec.course.id, words: sec.nodes[k].words };
    }
    return null;
  };
  const focus = findFocus();
  const focusId = focus?.id ?? null;
  useEffect(() => {
    // 완료 기록이 다 오기 전엔 focus가 이미 끝낸 단계를 가리킬 수 있다
    if (!openFocusOnReturn.current || !focusId || !hydrated || !doneNodesLoaded) return;
    openFocusOnReturn.current = false;
    setBubbleId(focusId);
  }, [focusId, hydrated, doneNodesLoaded]);
  // 홈 코스 줄: 지금 학습 중인 코스 카드가 왼쪽에 오게 가로 위치를 맞춘다
  useEffect(() => {
    const rail = homeRailRef.current;
    const current = rail?.querySelector<HTMLElement>('[data-current]');
    if (rail && current) rail.scrollLeft = current.offsetLeft - rail.offsetLeft - 20;
  }, [focus?.courseId, topicPicker]);
  // 홈 화면은 따로 없다: /course(첫 화면 ?resume=1 포함)는 지금 할 단계가 있는 주제·코스 화면으로 바꾼다. 다 끝냈으면 첫 주제
  const isHome = !activeTopic && !isCatalog;
  useEffect(() => {
    if (!isHome || !hydrated || !doneNodesLoaded || topics.length === 0) return;
    const index = focus ? topics.findIndex(topic => topic.parts.some(part => part.section.course.id === focus.courseId)) : -1;
    setSearchParams(index >= 0 && focus ? { topic: String(index), course: focus.courseId } : { topic: '0' }, { replace: true });
  }, [isHome, hydrated, doneNodesLoaded, topics, focus, setSearchParams]);
  useEffect(() => {
    if (!bubbleId) return;
    const close = (event: PointerEvent) => { if (!(event.target as Element).closest?.('[data-step-bubble], .course-step-marker')) setBubbleId(null); };
    document.addEventListener('pointerdown', close);
    return () => document.removeEventListener('pointerdown', close);
  }, [bubbleId]);
  const newlyDoneCount = newlyDone.size;
  const requestedLevel = searchParams.get('level') ?? '전체';
  const selectedLevel = LEVEL_TABS.includes(requestedLevel) ? requestedLevel : '전체';
  const setSelectedLevel = (level: string) => setSearchParams(level === '전체' ? {} : { level }, { replace: true });
  const visibleTopics = topics.filter(topic => selectedLevel === '전체' || topic.level === selectedLevel);
  const focusTopic = focus ? topics.find(topic => topic.parts.some(part => part.section.course.id === focus.courseId)) : null;

  useLayoutEffect(() => {
    document.querySelector('.course-screen')?.scrollTo({ top: 0 });
    if (isCatalog) document.querySelector<HTMLHeadingElement>('#course-catalog-title')?.focus({ preventScroll: true });
  }, [requestedTopic, isCatalog, contentStatus]);

  useEffect(() => {
    if (!hydrated || !stampCheckReady || newlyDoneCount > 0) return;
    // 홈 카드로 특정 코스를 지정해 들어왔으면 그 코스 머리로, 아니면 지금 할 단계로 스크롤한다
    const requested = activeTopic && requestedCourse && requestedCourse !== focus?.courseId ? document.querySelector<HTMLElement>(`[data-course-section="${requestedCourse}"]`) : null;
    const target = requested ?? (activeTopic ? focusRef.current : null);
    if (!target) return;
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    const t = setTimeout(() => target.scrollIntoView({ block: 'center', behavior: reduce ? 'auto' : 'smooth' }), reduce ? 0 : 80);
    return () => clearTimeout(t);
  }, [hydrated, stampCheckReady, newlyDoneCount, activeTopic, focusId, focus?.courseId, requestedTopic, requestedCourse]);

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
      const destination = recallWords.length > 0
        ? {
          pathname: '/quiz',
          state: {
            quizQueue: recallWords,
            backPath,
            reviewMode: true,
            mode: 'lesson_warmup',
            courseId: node.courseId,
            lessonId: node.id,
            nextRoute: { pathname: '/word-card', state: lessonState, label: '새 용어 보기' },
          },
        }
        : { pathname: '/word-card', state: lessonState };
      // 처음 여는 레슨은 배울 용어와 진행 순서를 먼저 보여준다. 다시 보는 레슨은 바로 시작한다.
      if (node.state !== 'done') navigate('/lesson-intro', { state: { courseTitle, words: node.words, warmupCount: recallWords.length, courseId: node.courseId, nodeId: node.id, next: destination } });
      else navigate(destination.pathname, { state: destination.state });
    } finally {
      spending.current = false;
    }
  };

  if (contentStatus === 'error' || (contentStatus === 'ready' && courses.length === 0)) return (
    <div className="app-soft-screen flex h-full flex-col items-center justify-center gap-3 px-5 text-center">
      <h1 className="text-lg font-bold text-[var(--color-ink)]">학습 내용을 불러오지 못했어요</h1>
      <p className="text-sm text-[var(--color-ink-2)]">연결을 확인하고 다시 시도해 주세요.</p>
      <ActionButton fullWidth onClick={retryContent} className="mt-3">다시 시도</ActionButton>
    </div>
  );

  // 글자 한 줄 대신 실제 화면 모양을 먼저 보여줘 기다림을 짧게 느끼게 한다(도허티 임계)
  if (contentStatus === 'loading') return (
    <div className="course-screen app-soft-screen flex h-full flex-col overflow-hidden" role="status" aria-live="polite">
      <span className="sr-only">학습 내용을 불러오는 중이에요</span>
      <div aria-hidden="true" className="course-home-header">
        <div className="h-6 w-32 rounded-chip bg-[var(--color-surface)] animate-pulse" />
        <div className="mt-4 h-4 w-24 rounded-chip bg-[var(--color-surface)] animate-pulse" />
      </div>
      <div aria-hidden="true" className="course-home-hero">
        <div className="h-3 w-20 rounded-chip bg-[var(--color-surface)] animate-pulse" />
        <div className="mt-3 h-6 w-40 rounded-chip bg-[var(--color-surface)] animate-pulse" />
        <div className="mt-5 h-1 w-full rounded-full bg-[var(--color-surface)] animate-pulse" />
        <div className="mt-6 h-[var(--size-action)] w-full rounded-button bg-[var(--color-surface)] animate-pulse" />
      </div>
      <div aria-hidden="true" className="course-home-catalog flex flex-col gap-5">
        {[1, 2, 3].map(i => (
          <div key={i} className="flex flex-col gap-2">
            <div className="h-5 w-36 rounded-chip bg-[var(--color-surface)] animate-pulse" />
            <div className="h-3 w-24 rounded-chip bg-[var(--color-surface)] animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className={`course-screen ${isCatalog ? 'bg-[var(--color-card)]' : activeTopic ? 'course-topic-screen' : 'app-soft-screen'} flex flex-col h-full pb-nav overflow-y-auto [&::-webkit-scrollbar]:hidden`} style={{ '--topic-header-h': `${topicHeaderH}px` } as React.CSSProperties}>
      {/* 에너지 칩은 주제 카드와 따로 화면 위에 고정한다 */}
      {activeTopic && <div className="course-energy-bar">
        <button type="button" className="course-energy-entry is-compact" aria-label={`학습 에너지 ${energy}/${energyMax}, 충전 방법 보기`} onClick={() => openShop('energy')}>
          <span><img src="/icons/stat/icon-energy.svg" alt="" aria-hidden="true" width={20} height={20} data-stat-icon="energy" /><span><span className="course-energy-label">에너지 </span><strong>{energy}/{energyMax}</strong></span></span>
          <span className="course-energy-action">충전 방법<ChevronRight size={16} aria-hidden="true" /></span>
        </button>
      </div>}
      <div ref={activeTopic ? topicHeaderRef : undefined} className={activeTopic ? 'course-topic-header' : 'course-home-header'}>
        {activeTopic ? (
          <div className="flex items-center gap-3">
            {/* 뒤로가기는 토스 내비게이션 바가 맡는다(자체 뒤로가기 중복은 검수 반려 사유) */}
            <button type="button" className="course-topic-switch min-w-0 text-left" aria-haspopup="dialog" aria-label={`${activeTopic.category}, 다른 주제로 이동`} onClick={() => setTopicPicker(true)}>
              {/* 난이도는 제목 위 작은 글자(코스 머리의 '코스 n/N'과 같은 자리). 코스 수·진행은 코스 머리와 겹쳐 두지 않는다 */}
              <p className="course-topic-level">{levelLabel(activeTopic.level)}</p>
              <h1 className="type-page-title flex items-center gap-1"><span className="truncate">{activeTopic.category}</span><ChevronDown size={16} aria-hidden="true" className="shrink-0 text-[var(--color-ink-3)]" /></h1>
            </button>
          </div>
        ) : isCatalog ? (
          <div className="flex items-center gap-2">
            {/* 뒤로가기는 토스 내비게이션 바가 맡는다(자체 뒤로가기 중복은 검수 반려 사유) */}
            <h1 id="course-catalog-title" tabIndex={-1} className="type-page-title">주제 둘러보기</h1>
          </div>
        ) : (
          // 앱 이름은 토스 내비게이션 바가 보여준다. 화면에는 제목을 숨기고 스크린리더용으로만 남긴다
          <h1 className="sr-only">홈</h1>
        )}
      </div>
      {isCatalog && <>
        <div className="px-5">
          <div role="tablist" aria-label="학습 난이도" className="course-home-filters">
            {LEVEL_TABS.map((level, index) => <button
              key={level}
              id={`course-level-${index}`}
              type="button"
              role="tab"
              aria-selected={selectedLevel === level}
              aria-controls="course-level-panel"
              tabIndex={selectedLevel === level ? 0 : -1}
              onClick={() => setSelectedLevel(level)}
              onKeyDown={event => {
                const next = event.key === 'ArrowRight' ? (index + 1) % LEVEL_TABS.length
                  : event.key === 'ArrowLeft' ? (index + LEVEL_TABS.length - 1) % LEVEL_TABS.length
                  : event.key === 'Home' ? 0 : event.key === 'End' ? LEVEL_TABS.length - 1 : null;
                if (next === null) return;
                event.preventDefault();
                setSelectedLevel(LEVEL_TABS[next]);
                event.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>('[role="tab"]')[next]?.focus();
              }}
              className="course-home-filter"
            >{level === '전체' ? level : levelLabel(level)}</button>)}
          </div>
        </div>
        <section id="course-level-panel" role="tabpanel" aria-labelledby={`course-level-${LEVEL_TABS.indexOf(selectedLevel)}`} tabIndex={0} className="course-home-catalog">
          <div className="course-home-catalog-heading">
            <h2>주제 둘러보기</h2><span>{visibleTopics.length}개 주제</span>
          </div>

          <List className="course-home-topic-list">
            {visibleTopics.length === 0 && <p className="type-supporting py-5 text-center">이 난이도의 학습을 준비하고 있어요.</p>}
            {visibleTopics.map((topic, i) => {
              const locked = topic.locked;
              const steps = topicSteps(topic);
              const done = topicStepsDone(topic);
              const isCurrent = topic.index === focusTopic?.index;
              // 전체 탭은 같은 주제명이 레벨마다 있어서 레벨이 바뀔 때 소제목을 넣는다
              const levelHeading = selectedLevel === '전체' && (i === 0 || visibleTopics[i - 1].level !== topic.level);
              // 같은 책 아이콘 반복 대신 상태 글자와 화살표만 둔다
              return <React.Fragment key={`${topic.level}-${topic.category}`}>
              {levelHeading && <h3 className="course-home-level-heading">{levelLabel(topic.level)}<span>{visibleTopics.filter(t => t.level === topic.level).length}개 주제</span></h3>}
              <ListRow as="button" border="none" disabled={locked} data-locked={locked || undefined} data-topic-index={topic.index} data-current={isCurrent || undefined}
                onClick={() => { if (!locked) navigate(`/course?topic=${topic.index}`); }} aria-disabled={locked || undefined} aria-label={`${levelLabel(topic.level)} ${topic.category} 주제 열기`} aria-describedby={`topic-summary-${topic.index}`} className="course-home-topic w-full"
                contents={<span className="flex flex-col">
                  <span className="course-home-topic-title">{topic.category}</span>
                  <span id={`topic-summary-${topic.index}`} className="course-home-topic-meta">{steps.done}/{steps.total}단계 완료</span>
                </span>}
                right={locked
                  // 잠김은 글자 대신 회색 원 안 자물쇠로 보여 준다(글자는 화면 읽기용)
                  ? <span className="course-topic-lock"><LockKeyhole size={16} aria-hidden="true" /><span className="sr-only">잠김</span></span>
                  : <span className="flex items-center gap-1 text-xs text-[var(--color-ink-3)]">{done ? '완료' : steps.done > 0 || topic.known > 0 ? '진행 중' : '시작 가능'}<ChevronRight size={16} aria-hidden="true" /></span>}
              />
              </React.Fragment>;
            })}
          </List>
        </section>
      </>}
      {/* 주제의 코스를 한 페이지에 모두 차례로 보여준다 */}
      {activeTopic && activeTopic.parts.map(({ section: sec, si }, partIndex) => {
        const steps = sec.nodes.filter(isStep);
        const stepsDone = steps.filter(isDone).length;
        const pct = steps.length ? Math.round((stepsDone / steps.length) * 100) : 0;
        return (
        <section key={sec.course.id} data-section-index={si} data-course-section={sec.course.id} className="scroll-mt-4">
          <div className={`course-topic-summary sticky top-0 z-10 mx-5 mt-3 mb-4 overflow-hidden py-3 ${sec.course.id === focus?.courseId ? 'anim-fade' : ''}`}>
            {/* 코스 이름(COURSE_NAMES)이 주제명과 같으면 반복하지 않고 진행 정도만 보여준다 */}
            {courseName(sec.course) !== activeTopic.category && <div className="relative mb-3 flex items-start gap-3">
              <div className="flex min-w-0 items-baseline gap-2">
                <p className="course-topic-course-meta shrink-0">코스 {partIndex + 1}/{activeTopic.parts.length}</p>
                <h3 className="flex items-center gap-1 text-[length:var(--font-size-body)] font-semibold text-[var(--color-ink)] break-keep leading-snug">{courseName(sec.course)}</h3>
              </div>
            </div>}
            {/* 진행은 막대 + 오른쪽 단계 수 한 줄(같은 값을 %로 한 번 더 쓰지 않는다) */}
            <div className="relative flex items-center gap-3">
              <div role="progressbar" aria-label={`${courseName(sec.course)} 진행률`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct} className="h-2 flex-1 overflow-hidden rounded-full bg-[var(--color-button-secondary)]">
                <div className={`h-full rounded-full bg-[var(--color-progress)] ${sec.course.id === focus?.courseId ? 'course-progress-reveal' : ''}`} style={{ width: `${pct}%` }} />
              </div>
              <p className="course-topic-steps"><strong>{stepsDone}</strong>/{steps.length}단계</p>
            </div>
          </div>

          <div className="course-steps">
          {sec.nodes.map((node, k) => {
            const isFocus = node.id === focusId;
            const done = isDone(node);
            const locked = node.state === 'locked';
            const copy = nodeCopy(node);
            const inProgress = node.type === 'lesson' && !done && node.words.some(word => knownIds.has(word.id));
            // 다음에 할 단계만 카드로 띄우고, 끝났거나 잠긴 단계는 평평한 행으로 둔다
            const nodeCardClass = isFocus && !locked ? 'course-node-current border-[var(--color-line)] bg-[var(--color-card)] px-4' : 'border-transparent bg-transparent px-0';
            // 상태어는 완료 / 진행 중 / 시작 가능 / 잠김 4개만 쓴다
            const nodeStatus = done ? '완료' : locked ? '잠김' : inProgress ? '진행 중' : '시작 가능';
            const isReview = node.type === 'review';
            return (
              <div key={node.id} className="course-step" data-step-state={done ? 'done' : locked ? 'locked' : isFocus ? 'current' : 'open'}>
                {/* 곡선이 가장 멀리 휜 돌(8개 중 3·7번째) 반대편 빈자리에 장식 수달을 둔다 */}
                {k % 4 === 2 && <img className="course-step-buddy" src={STEP_BUDDIES[(partIndex * 3 + Math.floor(k / 4)) % STEP_BUDDIES.length]} alt="" aria-hidden="true" data-step-buddy />}
                <button ref={isFocus ? focusRef : undefined} type="button" className="course-step-marker" data-step-kind={isReview ? 'review' : 'step'} aria-expanded={bubbleId === node.id}
                  aria-label={`${copy.kind} ${copy.title} ${nodeStatus}, ${bubbleId === node.id ? '닫기' : '보기'}`} onClick={() => setBubbleId(bubbleId === node.id ? null : node.id)}>
                  {/* 징검다리 돌은 상태별 노드 그림(public/path): 잠김 > 복습 > 완료 > 지금 할 학습 */}
                  <img src={`/path/node-${locked ? 'locked' : isReview ? 'review' : done ? 'done' : 'current'}.svg`} alt="" aria-hidden="true" width={72} height={72} data-node-icon />
                </button>
                <span className="course-step-bubble" data-step-bubble data-open={bubbleId === node.id}><button type="button" disabled={locked} data-own-sfx data-node-id={node.id}
                  onClick={() => handleNodeTap(node, k, sec.knownCount, courseName(sec.course))}
                  className={`course-node-card flex w-full items-center gap-3 border py-3 text-left disabled:cursor-default ${nodeCardClass} ${newlyDone.has(node.id) ? 'anim-stamp' : ''}`}
                  style={{ borderRadius: 'var(--shape-card)', '--d': `${0.2 + (newlyDone.get(node.id) ?? 0) * 0.15}s` } as React.CSSProperties}>
                  <span className="min-w-0 flex-1">
                    <span className={`flex flex-wrap items-center gap-x-2 gap-y-1 text-2xs ${locked ? 'text-[var(--color-ink-4)]' : 'text-[var(--color-ink-3)]'}`}>
                      {isReview ? (
                        <span data-review-badge className="inline-flex items-center rounded-chip border border-[var(--color-line-strong)] px-1.5 py-0.5 font-semibold text-[var(--color-ink-2)]">{copy.kind} · 선택</span>
                      ) : (
                        <span data-learning-kind={node.type}>{copy.kind}</span>
                      )}
                      {/* 완료는 왼쪽 체크로 보이므로 글자는 화면 읽기용으로만 둔다 */}
                      <span data-learning-status className={done || nodeStatus === '시작 가능' ? 'sr-only' : `font-normal ${locked ? 'text-[var(--color-ink-4)]' : isFocus ? 'text-[var(--color-ink-2)]' : 'text-[var(--color-ink-3)]'}`}>{nodeStatus}</span>
                    </span>
                    <span className={`mt-1 block text-sm break-keep ${locked ? 'font-semibold text-[var(--color-ink-3)]' : done ? 'font-semibold text-[var(--color-ink-2)]' : 'font-bold text-[var(--color-ink)]'}`}>{copy.title}</span>
                    {locked && <span className="mt-1 block text-xs text-[var(--color-ink-3)]">앞 단계를 끝내면 열려요</span>}
                  </span>
                  {!locked && <ChevronRight size={20} strokeWidth={1.75} aria-hidden="true" data-learning-action className="shrink-0 text-[var(--color-ink-3)]" />}
                </button></span>
              </div>
            );
          })}
          </div>
        </section>
        );
      })}
      {activeTopic && <BottomSheet open={topicPicker} onDimmerClick={() => setTopicPicker(false)} header={<span className="sheet-title">코스 고르기</span>}>
        <div className="course-picker pb-6">
          {[...new Set(topics.map(topic => topic.level))].map(level => (
            <section key={level} aria-label={`${levelLabel(level)} 코스`}>
              <div className="course-home-section-heading">
                <h2 className="course-topic-level">{levelLabel(level)}</h2>
              </div>
              <div ref={level === (focusTopic?.level ?? topics[0]?.level) ? homeRailRef : undefined} className="course-home-rail" role="list" aria-label={`${levelLabel(level)} 코스`}>
                {topics.filter(topic => topic.level === level).flatMap(topic => topic.parts.map(({ section }, pi) => {
                  const steps = section.nodes.filter(isStep);
                  const done = steps.filter(isDone).length;
                  // 잠김 = 남은 필수 단계가 있는데 지금 할 수 있는 단계가 없음(예전에 일부 푼 코스도 앞 코스를 끝내기 전엔 잠김)
                  const locked = done < steps.length && !steps.some(node => !isDone(node) && node.state !== 'locked');
                  const name = COURSE_NAMES[section.course.id] ?? (topic.parts.length > 1 ? `${topic.category} ${pi + 1}` : topic.category);
                  return (
                    <button key={section.course.id} type="button" role="listitem" className="course-home-rail-card" data-locked={locked}
                      data-current={section.course.id === focus?.courseId || undefined}
                      onClick={() => { setTopicPicker(false); navigate(`/course?topic=${topic.index}&course=${section.course.id}`); }} aria-label={`${topic.category} ${name} 코스 열기, ${locked ? '잠김' : `${done}/${steps.length}단계 완료`}`}>
                      <span className="course-home-rail-thumb">
                        <TopicThumb category={topic.category} courseId={section.course.id} size={160} height={120} />
                        {locked && <span className="course-home-rail-lock"><LockKeyhole size={20} aria-hidden="true" /></span>}
                      </span>
                      <span className="course-home-rail-text">
                        <span className="course-home-rail-title">{name}</span>
                      </span>
                    </button>
                  );
                }))}
              </div>
            </section>
          ))}
        </div>
      </BottomSheet>}
    </div>
  );
};

export default CourseScreen;
