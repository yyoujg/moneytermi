import React, { useMemo, useRef, useLayoutEffect, useEffect, useState } from 'react';
import { BookOpen, Check, Lock, PenLine, RotateCcw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { logClick } from '../lib/analytics';
import { LESSON_COST } from '../constants';
import { feedbackNodeTap, feedbackSpend } from '../lib/feedback';
import { loadDoneNodes } from '../lib/pathProgress';
import { buildPath, connectorD, NODE, nodeOffsetX, ROW, SPAN, sectionColor, type PathNode } from '../lib/path';

// 노드 원. TDS 리셋이 <button>의 rounded-*를 먹으므로 borderRadius는 인라인 스타일로 준다
// (인라인이 unlayered 리셋을 이긴다). button을 유지해야 포커스/Enter/disabled가 공짜로 따라온다.
const NodeCircle = ({ node, index, color, isFocus, onTap, nodeRef }: {
  node: PathNode;
  index: number;
  color: { face: string; shadow: string };
  isFocus: boolean;
  onTap: () => void;
  nodeRef?: React.Ref<HTMLButtonElement>;
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
      onClick={onTap}
      aria-label={`${node.type === 'quiz' ? '퀴즈' : node.type === 'review' ? '누적 복습' : '학습'} ${index + 1}`}
      className={`absolute flex items-center justify-center active:translate-y-[3px] disabled:opacity-50 disabled:pointer-events-none ${isFocus ? 'animate-node-hop' : ''}`}
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
      }}
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
    feedbackSpend();
    navigate('/word-card', { state: { words: node.words, index: 0, backPath: '/course', autoAdvance: true } });
  };

  return (
    <div className="flex flex-col h-full bg-[var(--color-canvas)] pb-nav overflow-y-auto [&::-webkit-scrollbar]:hidden">


      {/* 패스 */}
      {sections.map((sec, si) => {
        const color = sectionColor(si);
        return (
        <section key={sec.course.id} ref={sec.course.id === focus?.courseId ? focusSectionRef : undefined}>
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
                      stroke={node.state === 'done' ? color.face : 'var(--color-ink-4)'}
                    />
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
