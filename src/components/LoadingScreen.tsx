// 로딩 화면: 달리가 용어 카드를 보고 갸웃 → 전구 → 만세+체크(4.2초 루프, 움직임은 SVG 안 CSS). 화면 전환(지연 로딩) 대기에 쓴다.
// 300ms 안에 끝나는 로딩은 보여주지 않는다(깜빡임 방지). 문구는 2.4초마다 바뀐다. 앱 첫 진입은 스플래시(SplashScreen)
import { useEffect, useState } from 'react';

const MESSAGES = ['오늘의 단어 준비 중', '달리가 단어장 넘기는 중', '거의 다 됐어!'];

export const LoadingScreen = ({ message, delayMs = 300 }: { message?: string; delayMs?: number }) => {
  const [visible, setVisible] = useState(delayMs === 0);
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    if (delayMs === 0) return;
    const t = setTimeout(() => setVisible(true), delayMs);
    return () => clearTimeout(t);
  }, [delayMs]);

  useEffect(() => {
    if (message || !visible) return;
    const t = setInterval(() => setIdx(i => (i + 1) % MESSAGES.length), 2400);
    return () => clearInterval(t);
  }, [message, visible]);

  if (!visible) return null;
  return (
    <div className="loading-screen" role="status" aria-live="polite">
      <div className="loading-stage" aria-hidden="true">
        <img className="loading-otter" src="/loading/otter-study.svg" alt="" />
        <span className="loading-shadow" />
      </div>
      <div className="loading-dots" aria-hidden="true"><i /><i /><i /></div>
      <p className="loading-text">{message ?? MESSAGES[idx]}</p>
    </div>
  );
};
