import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@apps-in-toss/web-framework', () => ({
  generateHapticFeedback: vi.fn(() => Promise.resolve()),
}));

class FakeAudioContext {
  static instances: FakeAudioContext[] = [];

  state = 'running';
  currentTime = 1;
  destination = {};
  starts = 0;
  gains: number[] = [];

  constructor() {
    FakeAudioContext.instances.push(this);
  }

  resume = vi.fn(() => Promise.resolve());
  decodeAudioData = vi.fn(() => Promise.resolve({}));

  createBufferSource = vi.fn(() => ({
    buffer: null,
    connect: vi.fn(),
    start: vi.fn(() => { this.starts += 1; }),
  }));

  createGain = vi.fn(() => ({
    gain: {
      setValueAtTime: vi.fn((value: number) => { this.gains.push(value); }),
    },
    connect: vi.fn(),
  }));

  createOscillator = vi.fn(() => ({
    connect: vi.fn(),
    frequency: {
      setValueAtTime: vi.fn(),
      exponentialRampToValueAtTime: vi.fn(),
    },
    start: vi.fn(),
    stop: vi.fn(),
    type: 'sine',
  }));
}

const flush = () => new Promise(resolve => setTimeout(resolve, 0));

beforeEach(() => {
  vi.resetModules();
  FakeAudioContext.instances = [];
  vi.stubGlobal('AudioContext', FakeAudioContext);
  vi.stubGlobal('fetch', vi.fn(() => Promise.resolve({
    ok: true,
    headers: { get: () => 'audio/mpeg' },
    arrayBuffer: () => Promise.resolve(new ArrayBuffer(8)),
  })));
  vi.spyOn(performance, 'now').mockReturnValue(1000);
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('feedback file playback', () => {
  it('preloads and plays file sfx through a gain node', async () => {
    const { feedbackCorrect, preloadSfx, __resetFeedbackForTest } = await import('./feedback');
    __resetFeedbackForTest();

    preloadSfx();
    await flush();
    await flush();
    feedbackCorrect(false, false, 1);

    const audio = FakeAudioContext.instances[0];
    expect(audio.starts).toBe(1);
    expect(audio.gains).toContain(0.55);
    expect((globalThis.fetch as ReturnType<typeof vi.fn>)).toHaveBeenCalledWith('/sfx/correct.mp3');
  });

  it('limits rapid repeated plays of the same file sfx', async () => {
    const { feedbackCorrect, preloadSfx, __resetFeedbackForTest } = await import('./feedback');
    __resetFeedbackForTest();

    preloadSfx();
    await flush();
    await flush();
    feedbackCorrect(false, false, 1);
    vi.mocked(performance.now).mockReturnValue(1050);
    feedbackCorrect(false, false, 1);
    vi.mocked(performance.now).mockReturnValue(1130);
    feedbackCorrect(false, false, 1);

    expect(FakeAudioContext.instances[0].starts).toBe(2);
  });

  it('does not load or play files when sound is disabled', async () => {
    const { feedbackWrong, preloadSfx, soundPrefs, __resetFeedbackForTest } = await import('./feedback');
    __resetFeedbackForTest();
    soundPrefs.enabled = false;

    preloadSfx();
    feedbackWrong();

    expect(globalThis.fetch).not.toHaveBeenCalled();
    expect(FakeAudioContext.instances).toHaveLength(0);
  });
});
