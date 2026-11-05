import React, { useMemo, useRef, useLayoutEffect, useEffect, useState } from 'react';
import { LockKeyhole } from '../components/ui/OtterIcons';
import { List, ListRow } from '@toss/tds-mobile';
import { COURSE_NAMES } from '../lib/topicImages';
import { ChevronRight } from '../components/ui/ControlIcons';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { useAuth } from '../hooks/useAuth';
import { logClick } from '../lib/analytics';
import { ENERGY_ACTION_COST, levelLabel } from '../constants';
import { feedbackNodeTap } from '../lib/feedback';
import { calcStreak } from '../lib/streak';
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
  // 가운데 그림은 로딩 화면과 같은 수달(용어 카드를 보는 애니메이션). 초록 바탕 앱 아이콘(logo.png)은 쓰지 않는다
  const logo = document.createElement('img');
  logo.src = '/loading/otter-study.svg';
  logo.alt = '';
  Object.assign(logo.style, { width: 'auto', height: '150px', transform: 'translateY(-32px)', opacity: '0', transition: 'opacity 180ms ease-out' });
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
  const { hydrated, contentStatus, retryContent, viewedIds: knownIds, courses, energy, energyMax, spendEnergy, pickRecallWords, openShop, xp, attendanceDates } = useAppContext();
  // 이 기기에서 끝낸 퀴즈·복습 노드. 화면에 돌아올 때마다 다시 읽는다(퀴즈 끝내고 돌아온 직후 반영).
  const [doneNodes, setDoneNodes] = useState<Set<string>>(new Set());
  const [doneNodesLoaded, setDoneNodesLoaded] = useState(false);
  const [resumeCourseId, setResumeCourseId] = useState<string | null>(null);
  const profileId = useAuth().user?.id;
  useEffect(() => {
    let cancelled = false;
    Storage.getItem('learning_resume_course_v1').then(id => { if (!cancelled) setResumeCourseId(id); }).catch(() => {});
    loadDoneNodes(profileId)
      .then(nodes => { if (!cancelled) setDoneNodes(nodes); })
      .finally(() => { if (!cancelled) setDoneNodesLoaded(true); });
    return () => { cancelled = true; };
  }, [profileId]);

  // 필수 단계(학습·퀴즈)는 전체 학습 순서(기초의 모든 주제 → 중급 …, courses의 sort_order)대로만 연다.
  // 안 끝낸 첫 단계 하나만 열고 그 뒤의 미완료 단계는 다른 주제·다음 난이도까지 모두 잠근다. 복습은 선택이라 잠그지 않는다
  const sections = useMemo(() => {
    let opened = false;
    const path = buildPath(courses, knownIds);
    // 퀴즈 완료는 기기에만 남아 재설치·기기 변경 때 사라진다. 같은 코스에서 그 뒤 학습을 서버 기록으로 이미 끝냈다면 앞 퀴즈도 끝낸 것으로 본다
    // (다른 코스까지 보면 다른 주제에서 익힌 단어 때문에 아직 안 푼 퀴즈가 건너뛰어진다)
    const passedIds = new Set(path.flatMap(sec => {
      const lastServerDone = sec.nodes.reduce((at, node, i) => node.type === 'lesson' && node.state === 'done' ? i : at, -1);
      return sec.nodes.slice(0, Math.max(0, lastServerDone)).map(node => node.id);
    }));
    return path.map(sec => {
      return { ...sec, nodes: sec.nodes.map(node => {
        if (node.type === 'review') return node;
        if (node.state === 'available' && !doneNodes.has(node.id) && passedIds.has(node.id)) return { ...node, state: 'done' as const };
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
  // 학습 결과에서 '코스에서 이어 하기'로 오면 다음 할 단계 말풍선을 바로 열어 둔다
  const openFocusOnReturn = useRef((useLocation().state as { openFocus?: boolean } | null)?.openFocus === true);
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
    if (!openFocusOnReturn.current || !hydrated || !doneNodesLoaded) return;
    // 열 단계가 없어도 한 번 판단하면 끈다(다음 주제 전환 때 엉뚱하게 열리지 않게)
    openFocusOnReturn.current = false;
    if (focusId) setBubbleId(focusId);
  }, [focusId, hydrated, doneNodesLoaded]);
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
    // 뼈대는 지금 주제 화면 모양(에너지 칩, 주제·코스 카드, 지그재그 노드)을 그대로 따른다
    <div className="course-screen course-topic-screen flex h-full flex-col overflow-hidden" role="status" aria-live="polite">
      <span className="sr-only">학습 내용을 불러오는 중이에요</span>
      <div aria-hidden="true" className="flex justify-end px-5 py-2">
        <div className="h-11 w-24 rounded-full bg-[var(--color-card)] animate-pulse" />
      </div>
      <div aria-hidden="true" className="mx-5 rounded-[var(--shape-card)] bg-[var(--color-card)] px-4 py-3">
        <div className="h-3 w-10 rounded-chip bg-[var(--color-surface)] animate-pulse" />
        <div className="mt-2 h-5 w-36 rounded-chip bg-[var(--color-surface)] animate-pulse" />
        <div className="mt-3 h-4 w-44 rounded-chip bg-[var(--color-surface)] animate-pulse" />
        <div className="mt-3 h-2 w-full rounded-full bg-[var(--color-surface)] animate-pulse" />
      </div>
      <div aria-hidden="true" className="mt-8 flex flex-col items-center gap-3">
        {[0, 36, 0, -36].map((x, i) => (
          <div key={i} className="h-[72px] w-[72px] rounded-full bg-[var(--color-card)] animate-pulse" style={{ transform: `translateX(${x}px)` }} />
        ))}
      </div>
    </div>
  );

  return (
    <div className={`course-screen ${isCatalog ? 'bg-[var(--color-card)]' : activeTopic ? 'course-topic-screen' : 'app-soft-screen'} flex flex-col h-full pb-nav overflow-y-auto [&::-webkit-scrollbar]:hidden`}>
      {/* 에너지 칩은 주제 카드와 따로 화면 위에 고정한다 */}
      {activeTopic && <div className="course-energy-bar">
        {/* 마이의 학습 기록 중 리그를 뺀 세 가지와 에너지를 같은 모양으로 한 줄에 고르게 둔다. 에너지만 눌러서 충전 방법을 연다 */}
        <ul className="course-home-stats" aria-label="학습 기록">
          {[
            { icon: 'terms', label: '살펴본 용어', value: knownIds.size, unit: '개' },
            { icon: 'streak', label: '연속 학습', value: calcStreak(attendanceDates), unit: '일' },
            { icon: 'xp', label: '경험치', value: xp, unit: 'XP' },
          ].map(stat => (
            <li key={stat.icon} aria-label={`${stat.label} ${stat.value.toLocaleString()}${stat.unit}`}>
              <img src={`/icons/stat/icon-${stat.icon}.svg`} alt="" aria-hidden="true" width={20} height={20} data-stat-icon={stat.icon} />
              <strong aria-hidden="true">{stat.value.toLocaleString()}</strong><span aria-hidden="true">{stat.unit}</span>
            </li>
          ))}
          <li>
            <button type="button" className="course-home-stat-button" aria-label={`학습 에너지 ${energy}/${energyMax}, 충전 방법 보기`} onClick={() => openShop('energy')}>
              <img src="/icons/stat/icon-energy.svg" alt="" aria-hidden="true" width={20} height={20} data-stat-icon="energy" />
              <strong aria-hidden="true">{energy}/{energyMax}</strong>
            </button>
          </li>
        </ul>
      </div>}
      {/* 주제 화면은 따로 머리를 두지 않고 코스 카드(이름 + 주제 목록 버튼)만 둔다. 주제 이름은 스크린리더용 제목으로만 */}
      {activeTopic && <h1 className="sr-only">{activeTopic.category}</h1>}
      {!activeTopic && <div className="course-home-header">
        {isCatalog ? (
          <div className="flex items-center gap-2">
            {/* 뒤로가기는 토스 내비게이션 바가 맡는다(자체 뒤로가기 중복은 검수 반려 사유) */}
            <h1 id="course-catalog-title" tabIndex={-1} className="type-page-title">주제 고르기</h1>
          </div>
        ) : (
          // 앱 이름은 토스 내비게이션 바가 보여준다. 화면에는 제목을 숨기고 스크린리더용으로만 남긴다
          <h1 className="sr-only">홈</h1>
        )}
      </div>}
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
            <h2>주제 고르기</h2><span>{visibleTopics.length}개 주제</span>
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
        return (
        <section key={sec.course.id} data-section-index={si} data-course-section={sec.course.id} className="scroll-mt-4">
          <div className={`course-topic-summary sticky top-0 z-10 mx-5 mt-3 mb-4 overflow-hidden py-3 ${sec.course.id === focus?.courseId ? 'anim-fade' : ''}`}>
            {/* 코스 카드 전체가 주제 고르기 버튼. 아이콘만 두면 앱 메뉴로 읽혀 '다른 주제'를 글자로 적는다. 진행은 아래 단계 노드로 보인다 */}
            <button type="button" className="course-topic-list-button" aria-label={`${courseName(sec.course)}, 다른 주제 고르기`} onClick={() => navigate('/course/topics')}>
              <h3 className="min-w-0 flex-1 text-[length:var(--font-size-headline)] font-bold text-[var(--color-ink)] break-keep leading-snug">{courseName(sec.course)}</h3>
              <span className="course-topic-list-hint" aria-hidden="true">다른 주제<ChevronRight size={16} /></span>
            </button>
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
    </div>
  );
};

export default CourseScreen;
