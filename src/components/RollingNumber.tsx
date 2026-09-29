import { useEffect, useState } from 'react';

// 자릿수마다 0~9 띠를 굴려 새 값에 멈추는 숫자(오도미터). 처음 나타날 때는 0에서 굴러 올라온다.
// 자리는 오른쪽(일의 자리)부터 key를 매겨, 999 -> 1,000처럼 자릿수가 늘어도 기존 자리는 이어서 구른다.
const H = 1.2;   // 한 칸 높이(em). 글자 줄 높이와 맞춘다

const Digit = ({ d, delay }: { d: number; delay: number }) => {
  const [shown, setShown] = useState(0);
  useEffect(() => {
    const id = requestAnimationFrame(() => setShown(d));
    return () => cancelAnimationFrame(id);
  }, [d]);
  return (
    <span aria-hidden="true" className="inline-block overflow-hidden align-top" style={{ height: `${H}em`, lineHeight: `${H}em` }}>
      <span
        className="block transition-transform motion-reduce:transition-none"
        style={{ transform: `translateY(-${shown * H}em)`, transitionDuration: 'var(--dur-emph)', transitionTimingFunction: 'var(--ease-soft)', transitionDelay: `${delay}ms` }}
      >
        {Array.from({ length: 10 }, (_, n) => <span key={n} className="block text-center">{n}</span>)}
      </span>
    </span>
  );
};

export const RollingNumber = ({ value }: { value: number }) => {
  const chars = value.toLocaleString('ko-KR').split('');
  return (
    <span className="inline-flex tabular-nums" style={{ lineHeight: `${H}em` }}>
      {/* 화면 낭독기는 0~9 띠 대신 실제 값만 읽는다 */}
      <span className="sr-only">{value.toLocaleString('ko-KR')}</span>
      {chars.map((c, i) => {
        const pos = chars.length - i;   // 일의 자리 = 1
        return /\d/.test(c)
          ? <Digit key={`d${pos}`} d={Number(c)} delay={(pos - 1) * 40} />
          : <span key={`s${pos}`} aria-hidden="true">{c}</span>;
      })}
    </span>
  );
};
