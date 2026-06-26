import { ChevronLeft, ChevronRight, Lock, CheckCircle } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Badge, Spacing } from '@toss/tds-mobile';
import type { Course } from '../types';
import { useAppContext } from '../context/AppContext';
import { Card } from '../components/ui/Card';

const CourseWordListScreen = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { knownWords } = useAppContext();

  const course = (location.state as { course: Course } | null)?.course ?? null;

  if (!course) {
    navigate('/course', { replace: true });
    return null;
  }

  const courseKnownCount = course.words.filter(w => knownWords.some(kw => kw.id === w.id)).length;
  const progressPct = Math.round((courseKnownCount / course.words.length) * 100);
  const isCompleted = progressPct === 100;

  // 난이도 순 정렬
  const sortedWords = [...course.words].sort((a, b) => a.difficulty - b.difficulty);

  // 첫 번째 미완료 단어까지만 접근 가능
  const firstLockedIdx = sortedWords.findIndex(w => !knownWords.some(kw => kw.id === w.id));
  const isAccessible = (idx: number) => firstLockedIdx === -1 || idx <= firstLockedIdx;

  return (
    <div className="flex flex-col h-full bg-[var(--color-canvas)]">
      {/* 헤더 */}
      <div className="pt-4 px-5 pb-4 bg-[var(--color-card)]">
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => navigate('/course')}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-[var(--color-surface)] shrink-0"
          >
            <ChevronLeft size={20} className="text-[var(--color-ink-2)]" />
          </button>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-2xs font-medium text-[var(--color-ink-3)] px-2.5 py-1 rounded-full" style={{ backgroundColor: 'var(--color-surface)' }}>{course.level}</span>
              {isCompleted && <Badge color="green" size="small" variant="fill">완료</Badge>}
            </div>
            <h2 className="text-base font-bold text-[var(--color-ink)] mt-1 truncate">{course.title}</h2>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex-1 bg-[var(--color-surface)] rounded-full h-1.5 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${isCompleted ? 'bg-brand-500' : 'bg-brand-300'}`}
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <span className="text-xs font-bold text-[var(--color-ink-3)] shrink-0">{courseKnownCount}/{course.words.length}</span>
        </div>
      </div>

      {/* 단어 리스트 */}
      <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden">
        <Spacing size={16} />
        <div className="px-5">
          <p className="text-xs font-bold text-[var(--color-ink-3)] mb-2">수록 단어 {course.words.length}개</p>
        </div>

        <div className="px-5">
          <Card pad="none" className="overflow-hidden divide-y divide-[var(--color-surface)]">
            {sortedWords.map((word, idx) => {
              const isKnown = knownWords.some(kw => kw.id === word.id);
              const accessible = isAccessible(idx);
              const locked = !accessible;
              return (
                <div key={word.id} className={`flex items-start gap-3 px-4 py-3.5 ${locked ? 'opacity-40' : ''}`}>
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5
                      ${isKnown ? 'bg-brand-500 text-white' : 'bg-[var(--color-surface)] text-[var(--color-ink-3)]'}`}
                  >
                    {isKnown ? <CheckCircle size={14} strokeWidth={2.5} /> : locked ? <Lock size={13} /> : idx + 1}
                  </div>
                  <button
                    disabled={locked}
                    className="flex-1 flex items-start gap-2 text-left active:opacity-60 disabled:pointer-events-none"
                    onClick={() => navigate('/word-card', {
                      state: { words: sortedWords, index: idx, backPath: '/course/words', backState: { course } }
                    })}
                  >
                    <div className="flex-1 flex flex-col gap-0.5">
                      <p className="text-[15px] font-semibold text-[var(--color-ink)] break-keep">{word.word}</p>
                      <p className="text-[13px] text-[var(--color-ink-3)] break-keep">{word.meaning}</p>
                    </div>
                    {!locked && <ChevronRight size={16} className="text-[var(--color-ink-4)] shrink-0 mt-1" />}
                  </button>
                </div>
              );
            })}
          </Card>
        </div>

        <Spacing size={112} />
      </div>
    </div>
  );
};

export default CourseWordListScreen;
