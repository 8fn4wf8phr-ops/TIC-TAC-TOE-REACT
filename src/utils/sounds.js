// Tiny dependency-free sound effects using the Web Audio API.
// No audio files needed, so there's nothing extra to load or install.

let audioCtx = null;
let enabled = true;

export function setSoundEnabled(value) {
  enabled = value;
}

function getCtx() {
  if (!audioCtx) {
    const AudioCtor = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtor) return null;
    audioCtx = new AudioCtor();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

function beep({ freq = 440, duration = 0.12, type = 'sine', gain = 0.08, delay = 0 }) {
  if (!enabled) return;
  try {
    const ctx = getCtx();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    osc.connect(g);
    g.connect(ctx.destination);

    const start = ctx.currentTime + delay;
    g.gain.setValueAtTime(gain, start);
    g.gain.exponentialRampToValueAtTime(0.001, start + duration);
    osc.start(start);
    osc.stop(start + duration + 0.02);
  } catch {
    /* Web Audio not available or blocked — sound is just decoration */
  }
}

export function playMoveSound(symbol) {
  beep({ freq: symbol === 'X' ? 520 : 400, duration: 0.09, type: 'triangle', gain: 0.06 });
}

export function playWinSound() {
  beep({ freq: 523.25, duration: 0.12, type: 'sine', gain: 0.08 });
  beep({ freq: 659.25, duration: 0.12, type: 'sine', gain: 0.08, delay: 0.12 });
  beep({ freq: 783.99, duration: 0.2, type: 'sine', gain: 0.08, delay: 0.24 });
}

export function playDrawSound() {
  beep({ freq: 300, duration: 0.15, type: 'sawtooth', gain: 0.05 });
  beep({ freq: 220, duration: 0.24, type: 'sawtooth', gain: 0.05, delay: 0.14 });
}
