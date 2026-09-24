import { generateHapticFeedback } from '@apps-in-toss/web-framework';

function playTone(
  freq: number,
  dur: number,
  type: OscillatorType = 'sine',
  vol = 0.28,
) {
  try {
    const AudioCtx = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = freq;
    osc.type = type;
    gain.gain.setValueAtTime(vol, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
    osc.start();
    osc.stop(ctx.currentTime + dur);
    osc.onended = () => ctx.close();
  } catch {
    // Web Audio not supported
  }
}

// 정답: 밝은 두 음 (C5 → G5)
function playCorrectSound() {
  playTone(523, 0.1);
  setTimeout(() => playTone(784, 0.15), 90);
}

// 오답: 낮은 버저음
function playWrongSound() {
  playTone(180, 0.28, 'sawtooth', 0.18);
}

// 웹뷰 밖(브라우저)에서는 SDK가 동기로 throw해서 .catch로는 못 잡는다. 햅틱 실패가 채점을 막으면 안 된다.
type Haptic = 'tickWeak' | 'tap' | 'tickMedium' | 'softMedium' | 'basicWeak' | 'basicMedium' | 'success' | 'error' | 'wiggle' | 'confetti';
const haptic = (type: Haptic) => {
  if (import.meta.env.DEV) (window as unknown as { __lastHaptic?: string }).__lastHaptic = type;   // 브라우저 검증용
  try { generateHapticFeedback({ type }).catch(() => {}); } catch { /* not in webview */ }
};

// 진동 설정의 최신값. useSettings가 로드/토글할 때 갱신하고, 전역 탭 진동(useTapHaptics)이 읽는다.
// (useSettings는 화면마다 독립 상태라, 설정 시트에서 끈 값을 다른 화면이 바로 알 방법이 이것뿐이다)
export const hapticPrefs = { enabled: true };

// 모든 버튼 누름: 짧은 틱. 결과 진동(정답·축하)은 각자 따로 울린다.
export function feedbackTick() {
  if (hapticPrefs.enabled) haptic('tickMedium');
}

// 마일스톤 축하: 축포를 두 번, 사이에 성공 진동
export function feedbackCelebrate(vibration: boolean) {
  if (!vibration) return;
  haptic('confetti');
  setTimeout(() => haptic('success'), 200);
  setTimeout(() => haptic('confetti'), 450);
}

// 버튼/노드 탭: 짧고 확실한 한 번
export function feedbackTap(vibration: boolean) {
  if (vibration) haptic('basicMedium');
}

// 정답: 요란하게 — 축포 → 성공 → 묵직한 마무리를 짧은 간격으로 연타
export function feedbackCorrect(sound: boolean, vibration: boolean) {
  if (sound) playCorrectSound();
  if (!vibration) return;
  haptic('confetti');
  setTimeout(() => haptic('success'), 120);
  setTimeout(() => haptic('basicMedium'), 260);
}

export function feedbackWrong(sound: boolean, vibration: boolean) {
  if (sound) playWrongSound();
  if (vibration) haptic('error');
}
