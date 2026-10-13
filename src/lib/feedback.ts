import { generateHapticFeedback } from '@apps-in-toss/web-framework';

// ── 설정 (useSettings가 로드/토글할 때 갱신) ─────────────────────
// useSettings는 화면마다 독립 상태라, 설정 시트에서 바꾼 값을 다른 화면이 바로 따르게 하려면 모듈 플래그가 필요하다.
export const hapticPrefs = { enabled: true };
export const soundPrefs = { enabled: true };
export const bgmPrefs = { enabled: true };

// ── 햅틱 ─────────────────────────────────────────────────────────
type Haptic = 'tickWeak' | 'tap' | 'tickMedium' | 'softMedium' | 'basicWeak' | 'basicMedium' | 'success' | 'error' | 'wiggle' | 'confetti';
const haptic = (type: Haptic) => {
  if (!hapticPrefs.enabled) return;
  if (import.meta.env.DEV) (window as unknown as { __lastHaptic?: string }).__lastHaptic = type;   // 브라우저 검증용
  // 웹뷰 밖(브라우저)에서는 SDK가 동기로 throw해서 .catch로는 못 잡는다. 진동 실패가 흐름을 막으면 안 된다.
  try { generateHapticFeedback({ type }).catch(() => {}); } catch { /* not in webview */ }
};
// 첫 진동(at=0)은 setTimeout에 태우지 않고 즉시 — 타이머는 다음 매크로태스크라 렌더·이벤트 처리 뒤로 밀린다.
const hapticSeq = (steps: [Haptic, number][]) => steps.forEach(([t, at]) => at === 0 ? haptic(t) : setTimeout(() => haptic(t), at));

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
const DEFAULT_SYNTH_VOL = 0.1;
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
      const t0 = now + (n.at ?? 0); const dur = n.dur ?? 0.12; const vol = n.vol ?? DEFAULT_SYNTH_VOL;
      osc.frequency.setValueAtTime(n.f, t0);
      if (n.to) osc.frequency.exponentialRampToValueAtTime(n.to, t0 + dur);
      gain.gain.setValueAtTime(0.0001, t0);
      gain.gain.exponentialRampToValueAtTime(vol, t0 + 0.012);
      gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
      osc.start(t0); osc.stop(t0 + dur + 0.02);
    } catch { /* ignore */ }
  }
};
// ── 효과음 파일 (public/sfx/<이름>.mp3) ───────────────────────
// 파일이 있으면 그걸 틀고, 없으면(404·디코드 실패) 아래 합성음으로 돌아간다. 목록은 public/sfx/README.md.
export type Sfx = 'tick' | 'node' | 'spend' | 'correct' | 'combo' | 'combo_max' | 'wrong' | 'learned' | 'lesson' | 'quiz' | 'perfect'
  | 'tierup' | 'claim' | 'boost' | 'streak' | 'celebrate' | 'badge' | 'error';
export const SFX_NAMES: Sfx[] = ['tick', 'node', 'spend', 'correct', 'combo', 'combo_max', 'wrong', 'learned', 'lesson', 'quiz', 'perfect',
  'tierup', 'claim', 'boost', 'streak', 'celebrate', 'badge', 'error'];
const buffers = new Map<Sfx, AudioBuffer | null>();   // null = 없음(합성음 사용)
const loading = new Set<Sfx>();
const lastPlayedAt = new Map<Sfx, number>();
const FILE_GAIN = 0.42;
const BGM_MASTER_GAIN = 0.026;
const BGM_LOOP_MS = 6400;
const MIN_FILE_GAP_MS: Partial<Record<Sfx, number>> = {
  tick: 65,
  correct: 120,
  combo: 120,
  combo_max: 140,
  wrong: 180,
  lesson: 360,
};
const loadSfx = async (name: Sfx) => {
  if (buffers.has(name) || loading.has(name)) return;
  loading.add(name);
  try {
    const res = await fetch(`${import.meta.env.BASE_URL}sfx/${name}.mp3`);
    const c = audio();
    if (!res.ok || !c || !(res.headers.get('content-type') ?? '').startsWith('audio/')) { buffers.set(name, null); return; }
    buffers.set(name, await c.decodeAudioData(await res.arrayBuffer()));
  } catch { buffers.set(name, null); }
  finally { loading.delete(name); }
};
// 첫 제스처에서 한 번 전부 받아 둔다 (useTapHaptics가 호출)
export const preloadSfx = () => {
  if (!soundPrefs.enabled) return;
  SFX_NAMES.forEach(n => { void loadSfx(n); });
};
const playFile = (name: Sfx): boolean => {
  if (!soundPrefs.enabled) return true;   // 꺼져 있으면 합성음도 내지 않는다
  const nowMs = performance.now();
  const minGap = MIN_FILE_GAP_MS[name] ?? 90;
  if (nowMs - (lastPlayedAt.get(name) ?? -Infinity) < minGap) return true;
  const buf = buffers.get(name);
  if (!buf) { if (!buffers.has(name)) void loadSfx(name); return false; }
  const c = audio(); if (!c || c.state !== 'running') return true;
  if (import.meta.env.DEV) (window as unknown as { __lastSfxFile?: string }).__lastSfxFile = name;
  try {
    const src = c.createBufferSource();
    const gain = c.createGain();
    src.buffer = buf;
    gain.gain.setValueAtTime(FILE_GAIN, c.currentTime);
    src.connect(gain);
    gain.connect(c.destination);
    src.start();
    lastPlayedAt.set(name, nowMs);
  } catch { return false; }
  return true;
};

type BgmState = {
  master: GainNode;
  timers: number[];
  voices: Set<OscillatorNode>;
  interval: number;
};
let bgmState: BgmState | null = null;
let bgmPhraseIndex = 0;
let bgmVisibilityBound = false;

// 음이름 → Hz
const N = { C5: 523.25, D5: 587.33, E5: 659.25, F5: 698.46, G5: 783.99, A5: 880, B5: 987.77, C6: 1046.5, E6: 1318.5, G6: 1568 };

const BGM_PHRASES: Note[][] = [
  [{ f: 261.63, dur: 2.5, vol: 0.2 }, { f: 392, at: 0.08, dur: 2.2, vol: 0.11 }, { f: N.E5, at: 0.18, dur: 1.8, vol: 0.08 }],
  [{ f: 293.66, dur: 2.4, vol: 0.18 }, { f: 440, at: 0.08, dur: 2.0, vol: 0.1 }, { f: N.F5, at: 0.18, dur: 1.7, vol: 0.075 }],
  [{ f: 349.23, dur: 2.5, vol: 0.17 }, { f: 523.25, at: 0.08, dur: 2.1, vol: 0.09 }, { f: N.A5, at: 0.18, dur: 1.6, vol: 0.065 }],
  [{ f: 329.63, dur: 2.6, vol: 0.18 }, { f: 493.88, at: 0.08, dur: 2.1, vol: 0.1 }, { f: N.G5, at: 0.18, dur: 1.8, vol: 0.07 }],
];

const scheduleBgmPhrase = (c: AudioContext, state: BgmState) => {
  if (!bgmPrefs.enabled || c.state !== 'running') return;
  const now = c.currentTime;
  const phrase = BGM_PHRASES[bgmPhraseIndex % BGM_PHRASES.length];
  bgmPhraseIndex += 1;
  for (const n of phrase) {
    try {
      const osc = c.createOscillator();
      const gain = c.createGain();
      const t0 = now + (n.at ?? 0);
      const dur = n.dur ?? 1.6;
      const vol = n.vol ?? DEFAULT_SYNTH_VOL;
      osc.type = n.type ?? 'sine';
      osc.frequency.setValueAtTime(n.f, t0);
      gain.gain.setValueAtTime(0.0001, t0);
      gain.gain.exponentialRampToValueAtTime(vol, t0 + 0.08);
      gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
      osc.connect(gain);
      gain.connect(state.master);
      osc.start(t0);
      osc.stop(t0 + dur + 0.05);
      state.voices.add(osc);
      const timer = window.setTimeout(() => state.voices.delete(osc), (dur + (n.at ?? 0) + 0.1) * 1000);
      state.timers.push(timer);
    } catch { /* ignore */ }
  }
};

const onBgmVisibilityChange = () => {
  if (document.visibilityState === 'hidden') stopBgm();
  else startBgm();
};

const bindBgmVisibility = () => {
  if (bgmVisibilityBound) return;
  document.addEventListener('visibilitychange', onBgmVisibilityChange);
  bgmVisibilityBound = true;
};

const unbindBgmVisibility = () => {
  if (!bgmVisibilityBound) return;
  document.removeEventListener('visibilitychange', onBgmVisibilityChange);
  bgmVisibilityBound = false;
};

export function startBgm() {
  if (!bgmPrefs.enabled || bgmState) return;
  const c = audio();
  if (!c || c.state !== 'running') return;
  try {
    const master = c.createGain();
    master.gain.setValueAtTime(BGM_MASTER_GAIN, c.currentTime);
    master.connect(c.destination);
    const state: BgmState = { master, timers: [], voices: new Set(), interval: 0 };
    bgmState = state;
    scheduleBgmPhrase(c, state);
    state.interval = window.setInterval(() => scheduleBgmPhrase(c, state), BGM_LOOP_MS);
    bindBgmVisibility();
    if (import.meta.env.DEV) (window as unknown as { __bgmStarted?: boolean }).__bgmStarted = true;
  } catch {
    bgmState = null;
  }
}

export function stopBgm() {
  const state = bgmState;
  if (!state) return;
  window.clearInterval(state.interval);
  state.timers.forEach(timer => window.clearTimeout(timer));
  state.voices.forEach(osc => { try { osc.stop(); } catch { /* already stopped */ } });
  try { state.master.disconnect(); } catch { /* ignore */ }
  bgmState = null;
}

export function setBgmEnabled(enabled: boolean) {
  bgmPrefs.enabled = enabled;
  if (enabled) startBgm();
  else stopBgm();
}

export const __resetFeedbackForTest = () => {
  stopBgm();
  unbindBgmVisibility();
  ctx = null;
  buffers.clear();
  loading.clear();
  lastPlayedAt.clear();
  hapticPrefs.enabled = true;
  soundPrefs.enabled = true;
  bgmPrefs.enabled = true;
  bgmPhraseIndex = 0;
};

// ── 이벤트별 조합 ──────────────────────────────────────────────────
// 순서는 항상 진동 → 소리. 진동이 네이티브 브리지를 타는 만큼 소리 준비(오디오 컨텍스트·버퍼)보다 먼저 보낸다.
// 일반 탭은 짧고 가볍게, 성취 피드백과 강도를 구분한다.
export function feedbackTick() {
  haptic('tickWeak');
  if (!playFile('tick')) play([{ f: 620, to: 420, dur: 0.055, type: 'triangle', vol: 0.055 }, { f: 1050, dur: 0.03, vol: 0.022 }]);
}

// 패스 노드 탭: 짧게 올라가는 시작음.
export function feedbackNodeTap() {
  hapticSeq([['tap', 0], ['success', 90]]);
  if (!playFile('node')) play([{ f: N.E5, to: N.B5, dur: 0.1, type: 'triangle', vol: 0.09 }, { f: N.E6, at: 0.09, dur: 0.16, vol: 0.085 }, { f: N.G6, at: 0.13, dur: 0.09, vol: 0.03 }]);
}

// 포인트 소모 (레슨 시작 -10P): 낮게 쓱
export function feedbackSpend() {
  haptic('tap');
  if (!playFile('spend')) play([{ f: 560, to: 330, dur: 0.12, type: 'triangle', vol: 0.085 }, { f: 660, at: 0.035, dur: 0.06, vol: 0.04 }]);
}

// 정답은 밝은 세 음, 콤보는 상단 옥타브와 햅틱이 추가된다.
export function feedbackCorrect(_sound?: boolean, _vib?: boolean, combo = 1) {
  const notes: Note[] = [{ f: N.E5, dur: 0.08, type: 'triangle', vol: 0.095 }, { f: N.G5, at: 0.07, dur: 0.09, type: 'triangle', vol: 0.1 }, { f: N.C6, at: 0.15, dur: 0.18, vol: 0.105 }];
  if (combo >= 3) notes.push({ f: N.E6, at: 0.25, dur: 0.17, type: 'triangle', vol: 0.08 });
  if (combo >= 5) notes.push({ f: N.G6, at: 0.34, dur: 0.22, vol: 0.09 });
  if (combo >= 5) hapticSeq([['success', 0], ['confetti', 150], ['success', 330]]);
  else if (combo >= 3) hapticSeq([['success', 0], ['confetti', 170]]);
  else haptic('success');
  if (!playFile(combo >= 5 ? 'combo_max' : combo >= 3 ? 'combo' : 'correct')) play(notes);
}

// 오답은 짧고 부드럽게 내려가며, 반복 진동은 피한다.
export function feedbackWrong() {
  haptic('error');
  if (!playFile('wrong')) play([{ f: N.E5, to: N.D5, dur: 0.1, type: 'triangle', vol: 0.085 }, { f: 392, to: 330, at: 0.09, dur: 0.14, vol: 0.08 }]);
}

// 단어 하나 학습 완료: 작은 반짝임.
export function feedbackLearned() {
  hapticSeq([['tap', 0], ['success', 110]]);
  if (!playFile('learned')) play([{ f: N.G5, dur: 0.08, type: 'triangle', vol: 0.09 }, { f: N.C6, at: 0.08, dur: 0.19, vol: 0.105 }, { f: N.E6, at: 0.12, dur: 0.14, vol: 0.035 }]);
}

// 레슨(단어 묶음) 완료: 짧은 팡파르
export function feedbackLessonComplete() {
  hapticSeq([['success', 0], ['success', 160], ['confetti', 360]]);
  if (!playFile('lesson')) play([{ f: N.C5, dur: 0.1, type: 'triangle', vol: 0.095 }, { f: N.E5, at: 0.09, dur: 0.1, type: 'triangle', vol: 0.095 }, { f: N.G5, at: 0.18, dur: 0.11, type: 'triangle', vol: 0.1 }, { f: N.C6, at: 0.29, dur: 0.32, vol: 0.11 }, { f: N.E6, at: 0.32, dur: 0.26, vol: 0.045 }]);
}

// 퀴즈/복습 완료: 정답률 100%면 한 음 더 높이 올라간다
export function feedbackQuizComplete(perfect: boolean) {
  const notes: Note[] = [{ f: N.G5, dur: 0.09, type: 'triangle', vol: 0.095 }, { f: N.C6, at: 0.09, dur: 0.12, type: 'triangle', vol: 0.1 }, { f: N.E6, at: 0.2, dur: 0.26, vol: 0.11 }, { f: N.C6, at: 0.2, dur: 0.26, vol: 0.04 }];
  if (perfect) notes.push({ f: N.G6, at: 0.34, dur: 0.32, vol: 0.095 }, { f: N.E6, at: 0.37, dur: 0.26, vol: 0.045 });
  hapticSeq(perfect ? [['success', 0], ['confetti', 180], ['success', 360], ['confetti', 540]] : [['success', 0], ['success', 180], ['confetti', 360]]);
  if (!playFile(perfect ? 'perfect' : 'quiz')) play(notes);
}

// 티어 승급: 웅장하게
export function feedbackTierUp() {
  hapticSeq([['success', 0], ['success', 170], ['confetti', 350], ['confetti', 590]]);
  if (!playFile('tierup')) play([{ f: N.C5, dur: 0.12, type: 'triangle', vol: 0.1 }, { f: N.E5, at: 0.11, dur: 0.12, type: 'triangle', vol: 0.1 }, { f: N.G5, at: 0.22, dur: 0.12, type: 'triangle', vol: 0.1 }, { f: N.C6, at: 0.34, dur: 0.4, vol: 0.12 }, { f: N.E6, at: 0.34, dur: 0.36, vol: 0.05 }, { f: N.G6, at: 0.5, dur: 0.26, vol: 0.055 }]);
}

// 보상 수령 (미션·광고): 동전 두 개
export function feedbackClaim() {
  hapticSeq([['tap', 0], ['success', 130], ['confetti', 280]]);
  if (!playFile('claim')) play([{ f: N.B5, dur: 0.06, type: 'triangle', vol: 0.09 }, { f: N.E6, at: 0.09, dur: 0.07, type: 'triangle', vol: 0.09 }, { f: N.G6, at: 0.18, dur: 0.21, vol: 0.1 }]);
}

// 부스트 구매: 위로 쓸어 올라가는 파워업
export function feedbackBoost() {
  hapticSeq([['wiggle', 0], ['success', 250], ['confetti', 450]]);
  if (!playFile('boost')) play([{ f: 320, to: 1200, dur: 0.34, type: 'triangle', vol: 0.1 }, { f: N.E6, at: 0.31, dur: 0.11, type: 'triangle', vol: 0.08 }, { f: N.G6, at: 0.41, dur: 0.22, vol: 0.09 }]);
}

// 연속 학습 축하 (평소): 차임
export function feedbackStreak() {
  hapticSeq([['success', 0], ['confetti', 240]]);
  if (!playFile('streak')) play([{ f: N.C5, dur: 0.18, type: 'triangle', vol: 0.085 }, { f: N.E5, at: 0.08, dur: 0.18, type: 'triangle', vol: 0.085 }, { f: N.G5, at: 0.16, dur: 0.24, type: 'triangle', vol: 0.09 }, { f: N.C6, at: 0.28, dur: 0.24, vol: 0.1 }]);
}

// 마일스톤(7·14·30일…): 팡파르 + 축포 연타
export function feedbackCelebrate() {
  hapticSeq([['confetti', 0], ['success', 170], ['success', 330], ['confetti', 500], ['confetti', 710]]);
  if (!playFile('celebrate')) play([{ f: N.C5, dur: 0.1, type: 'triangle', vol: 0.095 }, { f: N.E5, at: 0.09, dur: 0.1, type: 'triangle', vol: 0.095 }, { f: N.G5, at: 0.18, dur: 0.1, type: 'triangle', vol: 0.095 }, { f: N.C6, at: 0.28, dur: 0.14, type: 'triangle', vol: 0.1 }, { f: N.E6, at: 0.41, dur: 0.32, vol: 0.11 }, { f: N.G6, at: 0.53, dur: 0.24, vol: 0.05 }]);
}

// 배지 획득: 반짝이는 상승 아르페지오 + 축포
export function feedbackBadge() {
  hapticSeq([['success', 0], ['confetti', 180], ['success', 350], ['confetti', 540]]);
  if (!playFile('badge')) play([{ f: N.E5, dur: 0.08, type: 'triangle', vol: 0.09 }, { f: N.G5, at: 0.075, dur: 0.08, type: 'triangle', vol: 0.09 }, { f: N.C6, at: 0.15, dur: 0.08, type: 'triangle', vol: 0.095 }, { f: N.E6, at: 0.23, dur: 0.12, type: 'triangle', vol: 0.1 }, { f: N.G6, at: 0.34, dur: 0.31, vol: 0.105 }, { f: N.E6, at: 0.36, dur: 0.24, vol: 0.04 }]);
}

// 실패 알림 (보상 수령 실패 등): 짧고 낮게
export function feedbackError() {
  haptic('error');
  if (!playFile('error')) play([{ f: 340, to: 240, dur: 0.13, type: 'triangle', vol: 0.085 }, { f: 200, at: 0.09, dur: 0.1, vol: 0.04 }]);
}
