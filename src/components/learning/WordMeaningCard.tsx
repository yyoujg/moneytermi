import { useId } from 'react';
import type { Word } from '../../types';
import { keepShortUnitsTogether } from '../../lib/formatText';
import { BookOpen, Lightbulb } from '../ui/OtterIcons';
import { ChevronRight } from '../ui/ControlIcons';

export const WordMeaningCard = ({ word, sources = [], onDetail }: {
  word: Word;
  sources?: string[];
  onDetail?: () => void;
}) => {
  const titleId = useId();
  const hypothetical = /^\s*학습용 가정\s*:/.test(word.learningExample ?? '');
  const example = word.learningExample?.replace(/^\s*학습용 가정\s*:\s*/, '').trim();
  return (
    <section className="word-meaning-card word-study-definition" aria-labelledby={titleId}>
      <header className="word-meaning-heading"><span>용어 뜻</span><span>{['기초', '중급', '심화'][word.difficulty - 1]}</span></header>
      <h1 id={titleId}>{word.word}</h1>
      <div className="word-meaning-definition"><h2>핵심 뜻</h2><p>{keepShortUnitsTogether(word.meaning)}</p></div>
      {example && <section className="word-meaning-example" aria-label="생활 속 예시">
        <div className="word-meaning-example-heading"><Lightbulb size={26} /><h2>생활 속 예시</h2>{hypothetical && <span>학습용 가정</span>}</div>
        <p>{keepShortUnitsTogether(example)}</p>
      </section>}
      {(sources.length > 0 || onDetail) && <footer className="word-meaning-footer">
        {sources.length > 0 && <p className="word-meaning-source">{sources.join(' · ')} 참고</p>}
        {onDetail && <button type="button" onClick={onDetail} className="word-meaning-detail"><BookOpen size={20} />자세히 보기<ChevronRight size={16} /></button>}
      </footer>}
    </section>
  );
};
