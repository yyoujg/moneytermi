import { useId } from 'react';
import type { Word } from '../../types';
import { keepShortUnitsTogether } from '../../lib/formatText';
import { spokenDefinition } from '../../lib/learningText';
import { ChevronRight } from '../ui/ControlIcons';
import { StudyText } from './StudyText';

export const WordMeaningCard = ({ word, sources = [], onDetail, className = '', section }: {
  word: Word;
  sources?: string[];
  onDetail?: () => void;
  className?: string;
  section?: 'meaning' | 'definition' | 'example';
}) => {
  const titleId = useId();
  const hypothetical = /^\s*학습용 가정\s*:/.test(word.learningExample ?? '');
  const example = word.learningExample?.replace(/^\s*학습용 가정\s*:\s*/, '').trim();
  return (
    <section className={`word-meaning-card word-study-definition card-surface card-padding ${className}`} aria-labelledby={titleId} data-study-section={section}>
      {!section && <header className="word-meaning-heading type-caption"><span>용어 뜻</span></header>}
      <h1 id={titleId} className="type-content-title">{word.word}</h1>
      {section !== 'example' && <div className="word-meaning-definition">{!section && <h2 className="type-supporting type-emphasis">핵심 뜻</h2>}<p className={section ? 'type-reading' : 'type-body'}>{section ? <strong className="study-definition type-emphasis"><StudyText text={keepShortUnitsTogether(spokenDefinition(word.meaning))} word={word.word} /></strong> : keepShortUnitsTogether(word.meaning)}</p></div>}
      {section !== 'definition' && example && <section className="word-meaning-example" aria-label="생활 속 예시">
        {!section && <div className="word-meaning-example-heading"><h2 className="type-supporting type-emphasis">생활 속 예시</h2>{hypothetical && <span className="type-caption">학습용 가정</span>}</div>}
        {section && <p className="word-example-intro type-supporting">{hypothetical ? '이런 상황이라고 해보자.' : '예를 들면 이런 거야.'}</p>}
        <p className={section ? 'type-reading' : 'type-body'}>{section ? <StudyText text={keepShortUnitsTogether(example)} word={word.word} /> : keepShortUnitsTogether(example)}</p>
      </section>}
      {(sources.length > 0 || onDetail) && <footer className="word-meaning-footer">
        {sources.length > 0 && <p className="word-meaning-source type-supporting">{sources.join(' · ')} 참고</p>}
        {onDetail && <button type="button" onClick={onDetail} aria-label={section ? '더 알아보기' : undefined} aria-haspopup={section ? 'dialog' : undefined} className={section ? 'word-resource-entry' : 'word-meaning-detail'}>{section ? '더 알아보기' : '자세히 보기'}<ChevronRight size={16} aria-hidden="true" /></button>}
      </footer>}
    </section>
  );
};
