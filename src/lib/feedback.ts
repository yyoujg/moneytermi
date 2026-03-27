import { generateHapticFeedback } from '@apps-in-toss/web-bridge';

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

export function feedbackCorrect(sound: boolean, vibration: boolean) {
  if (sound) playCorrectSound();
  if (vibration) generateHapticFeedback({ type: 'success' }).catch(() => {});
}

export function feedbackWrong(sound: boolean, vibration: boolean) {
  if (sound) playWrongSound();
  if (vibration) generateHapticFeedback({ type: 'error' }).catch(() => {});
}
