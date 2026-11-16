import { termPattern } from '../../lib/quiz';

const FIGURE = String.raw`[-−+]?\d[\d,]*(?:\.\d+)?(?:\s*[천만억조])?(?:\s*\d[\d,]*(?:\.\d+)?(?:\s*[천만억조])?)*\s*(?:달러|유로|개월|%p|원|엔|%|년|일|배|명|개)`;

export const StudyText = ({ text, word }: { text: string; word: string }) => {
  const term = termPattern(word);
  const keyword = term ? new RegExp(`^(?:${term.source})$`) : null;
  const parts = text.split(new RegExp(`(${term ? `${term.source}|` : ''}${FIGURE})`, 'g'));
  const firstKeyword = parts.findIndex((part, i) => i % 2 === 1 && keyword?.test(part));
  return <>{parts.map((part, i) => {
    if (i % 2 === 0) return part;
    if (keyword?.test(part)) {
      if (i !== firstKeyword) return part;
      return <mark key={i} className="study-keyword type-emphasis">{part}</mark>;
    }
    return <strong key={i} className="study-figure type-emphasis">{part}</strong>;
  })}</>;
};
