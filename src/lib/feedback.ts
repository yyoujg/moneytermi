import { generateHapticFeedback } from '@apps-in-toss/web-framework';

// ── 설정 (useSettings가 로드/토글할 때 갱신) ─────────────────────
// useSettings는 화면마다 독립 상태라, 설정 시트에서 바꾼 값을 다른 화면이 바로 따르게 하려면 모듈 플래그가 필요하다.
export const hapticPrefs = { enabled: true };
export const soundPrefs = { enabled: true };

// ── 햅틱 ─────────────────────────────────────────────────────────
type Haptic = 'tickWeak' | 'tap' | 'tickMedium' | 'softMedium' | 'basicWeak' | 'basicMedium' | 'success' | 'error' | 'wiggle' | 'confetti';
const haptic = (type: Haptic) => {
  if (!hapticPrefs.enabled) return;
  if (import.meta.env.DEV) (window as unknown as { __lastHaptic?: string }).__lastHaptic = type;   // 브라우저 검증용
  // 웹뷰 밖(브라우저)에서는 SDK가 동기로 throw해서 .catch로는 못 잡는다. 진동 실패가 흐름을 막으면 안 된다.
  try { generateHapticFeedback({ type }).catch(() => {}); } catch { /* not in webview */ }
};
const hapticSeq = (steps: [Haptic, number][]) => steps.forEach(([t, at]) => setTimeout(() => haptic(t), at));

// ── 효과음 (Web Audio, 짧은 합성음) ───────────────────────────────
let ctx: AudioContext | null = null;
const audio = (): AudioContext | null => {
  try {
    const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    ctx ??= new AC();
    if (ctx.state === 'suspended') ctx.resume().catch(() => {});
    return ctx;
  } catch { return null; }
};
type Note = { f: number; at?: number; dur?: number; type?: OscillatorType; vol?: number; to?: number };
// 음 하나: f(Hz)에서 시작해 to가 있으면 그 주파수로 미끄러진다. at(초) 뒤에 dur(초) 동안.
const play = (notes: Note[]) => {
  if (!soundPrefs.enabled) return;
  if (import.meta.env.DEV) (window as unknown as { __lastSfx?: number[] }).__lastSfx = notes.map(n => n.f);
  const c = audio(); if (!c || c.state !== 'running') return;   // iOS: 첫 제스처 전엔 suspended — 쌓였다 한꺼번에 터지지 않게 건너뛴다
  const now = c.currentTime;
  for (const n of notes) {
    try {
      const osc = c.createOscillator(); const gain = c.createGain();
      osc.connect(gain); gain.connect(c.destination);
      osc.type = n.type ?? 'sine';
      const t0 = now + (n.at ?? 0); const dur = n.dur ?? 0.12; const vol = n.vol ?? 0.22;
      osc.frequency.setValueAtTime(n.f, t0);
      if (n.to) osc.frequency.exponentialRampToValueAtTime(n.to, t0 + dur);
      gain.gain.setValueAtTime(0.0001, t0);
      gain.gain.exponentialRampToValueAtTime(vol, t0 + 0.012);
      gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
      osc.start(t0); osc.stop(t0 + dur + 0.02);
    } catch { /* ignore */ }
  }
};
// 음이름 → Hz
const N = { C5: 523.25, D5: 587.33, E5: 659.25, F5: 698.46, G5: 783.99, A5: 880, B5: 987.77, C6: 1046.5, E6: 1318.5, G6: 1568 };

// ── 이벤트별 조합 ──────────────────────────────────────────────────
// 버튼 누름: 가장 강한 단발(success) + 아주 짧은 '톡'
export function feedbackTick() {
  haptic('success');
  play([{ f: 1400, to: 900, dur: 0.04, type: 'triangle', vol: 0.08 }]);
}

// 패스 노드 탭 (레슨 시작·퀴즈 진입): 톡 하는 팝
export function feedbackNodeTap() {
  hapticSeq([['success', 0], ['confetti', 80]]);
  play([{ f: 620, to: 880, dur: 0.08, vol: 0.14 }]);
}

// 포인트 소모 (레슨 시작 -10P): 낮게 쓱
export function feedbackSpend() {
  hapticSeq([['success', 0], ['success', 80]]);
  play([{ f: 440, to: 300, dur: 0.14, type: 'triangle', vol: 0.12 }]);
}

// 퀴즈 정답: 두 음. 콤보가 붙으면 음이 하나씩 더 올라가고 진동도 세진다
export function feedbackCorrect(_sound?: boolean, _vib?: boolean, combo = 1) {
  const notes: Note[] = [{ f: N.C5, dur: 0.1 }, { f: N.G5, at: 0.09, dur: 0.14 }];
  if (combo >= 3) notes.push({ f: N.C6, at: 0.18, dur: 0.16 });
  if (combo >= 5) notes.push({ f: N.E6, at: 0.27, dur: 0.2 });
  play(notes);
  if (combo >= 5) hapticSeq([['confetti', 0], ['success', 120], ['confetti', 240], ['success', 360], ['confetti', 480]]);
  else if (combo >= 3) hapticSeq([['confetti', 0], ['success', 140], ['confetti', 280], ['success', 420]]);
  else hapticSeq([['success', 0], ['confetti', 140], ['success', 280]]);
}

// 오답: 낮은 버저 + error
export function feedbackWrong() {
  play([{ f: 180, dur: 0.26, type: 'sawtooth', vol: 0.16 }]);
  hapticSeq([['error', 0], ['error', 160], ['error', 320]]);
}

// 단어 하나 학습 완료 ("좋아요!" 패널): 부드러운 딩
export function feedbackLearned() {
  play([{ f: N.E5, dur: 0.1, vol: 0.18 }, { f: N.A5, at: 0.08, dur: 0.22, vol: 0.18 }]);
  hapticSeq([['success', 0], ['confetti', 120], ['success', 240]]);
}

// 레슨(단어 묶음) 완료: 짧은 팡파르
export function feedbackLessonComplete() {
  play([{ f: N.C5, dur: 0.12 }, { f: N.E5, at: 0.1, dur: 0.12 }, { f: N.G5, at: 0.2, dur: 0.12 }, { f: N.C6, at: 0.3, dur: 0.3 }]);
  hapticSeq([['success', 0], ['confetti', 200], ['success', 400], ['confetti', 600]]);
}

// 퀴즈/복습 완료: 정답률 100%면 한 음 더 높이 올라간다
export function feedbackQuizComplete(perfect: boolean) {
  const notes: Note[] = [{ f: N.G5, dur: 0.1 }, { f: N.C6, at: 0.1, dur: 0.14 }, { f: N.E6, at: 0.22, dur: 0.3 }];
  if (perfect) notes.push({ f: N.G6, at: 0.36, dur: 0.4, vol: 0.2 });
  play(notes);
  hapticSeq(perfect ? [['confetti', 0], ['success', 180], ['confetti', 360], ['success', 540], ['confetti', 720]] : [['success', 0], ['confetti', 200], ['success', 400], ['confetti', 600]]);
}

// 티어 승급: 웅장하게
export function feedbackTierUp() {
  play([{ f: N.C5, dur: 0.14 }, { f: N.E5, at: 0.12, dur: 0.14 }, { f: N.G5, at: 0.24, dur: 0.14 }, { f: N.C6, at: 0.36, dur: 0.5 }, { f: N.G5, at: 0.36, dur: 0.5, vol: 0.12 }]);
  hapticSeq([['confetti', 0], ['success', 200], ['confetti', 400], ['success', 600], ['confetti', 800]]);
}

// 보상 수령 (미션·광고): 동전 두 개
export function feedbackClaim() {
  play([{ f: N.B5, dur: 0.07, type: 'square', vol: 0.09 }, { f: N.E6, at: 0.07, dur: 0.2, type: 'square', vol: 0.09 }]);
  hapticSeq([['success', 0], ['confetti', 120], ['success', 240]]);
}

// 부스트 구매: 위로 쓸어 올라가는 파워업
export function feedbackBoost() {
  play([{ f: 300, to: 1200, dur: 0.45, type: 'triangle', vol: 0.16 }, { f: N.E6, at: 0.4, dur: 0.25, vol: 0.14 }]);
  hapticSeq([['wiggle', 0], ['success', 300], ['confetti', 450], ['success', 600]]);
}

// 연속 학습 축하 (평소): 차임
export function feedbackStreak() {
  play([{ f: N.C5, dur: 0.3, vol: 0.14 }, { f: N.E5, at: 0.06, dur: 0.3, vol: 0.14 }, { f: N.G5, at: 0.12, dur: 0.4, vol: 0.14 }]);
  hapticSeq([['success', 0], ['confetti', 200], ['success', 400]]);
}

// 마일스톤(7·14·30일…): 팡파르 + 축포 연타
export function feedbackCelebrate() {
  play([{ f: N.C5, dur: 0.12 }, { f: N.E5, at: 0.1, dur: 0.12 }, { f: N.G5, at: 0.2, dur: 0.12 }, { f: N.C6, at: 0.3, dur: 0.16 }, { f: N.E6, at: 0.42, dur: 0.5 }]);
  hapticSeq([['confetti', 0], ['success', 180], ['confetti', 360], ['success', 540], ['confetti', 720], ['confetti', 900]]);
}

// 배지 획득: 반짝이는 상승 아르페지오 + 축포
export function feedbackBadge() {
  play([{ f: N.E5, dur: 0.1, vol: 0.16 }, { f: N.G5, at: 0.08, dur: 0.1, vol: 0.16 }, { f: N.C6, at: 0.16, dur: 0.1, vol: 0.16 }, { f: N.E6, at: 0.24, dur: 0.16, vol: 0.16 }, { f: N.G6, at: 0.34, dur: 0.45, vol: 0.18 }]);
  hapticSeq([['confetti', 0], ['success', 200], ['confetti', 400], ['success', 600], ['confetti', 800]]);
}

// 실패 알림 (보상 수령 실패 등): 짧고 낮게
export function feedbackError() {
  play([{ f: 220, dur: 0.12, type: 'sawtooth', vol: 0.1 }, { f: 180, at: 0.12, dur: 0.16, type: 'sawtooth', vol: 0.1 }]);
  hapticSeq([['error', 0], ['error', 160], ['error', 320]]);
}
