// audio.js — tiny WebAudio sound effects, synthesized, no audio files.
// The context is created lazily on the first user gesture (browsers block
// audio before interaction). All sounds are short oscillator blips.

let ctx = null;
let muted = false;

export function setMuted(value) {
  muted = value;
}

export function isMuted() {
  return muted;
}

function ac() {
  if (ctx === null) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  if (ctx.state === 'suspended') ctx.resume().catch(() => {});
  return ctx;
}

function tone(freq, startMs, durMs, type = 'sine', gain = 0.16) {
  if (muted) return;
  const audio = ac();
  if (!audio) return;
  const t0 = audio.currentTime + startMs / 1000;
  const osc = audio.createOscillator();
  const amp = audio.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  amp.gain.setValueAtTime(0.0001, t0);
  amp.gain.exponentialRampToValueAtTime(gain, t0 + 0.02);
  amp.gain.exponentialRampToValueAtTime(0.0001, t0 + durMs / 1000);
  osc.connect(amp);
  amp.connect(audio.destination);
  osc.start(t0);
  osc.stop(t0 + durMs / 1000 + 0.05);
}

export const sfx = {
  click() {
    tone(660, 0, 70, 'triangle', 0.08);
  },
  found() {
    tone(523, 0, 110, 'sine', 0.16);
    tone(784, 90, 160, 'sine', 0.16);
  },
  wrong() {
    tone(160, 0, 180, 'sawtooth', 0.1);
    tone(120, 60, 180, 'sawtooth', 0.08);
  },
  hint() {
    tone(880, 0, 90, 'sine', 0.12);
    tone(1174, 80, 140, 'sine', 0.12);
  },
  win() {
    [523, 659, 784, 1046].forEach((f, i) => tone(f, i * 110, 220, 'triangle', 0.16));
  },
  select() {
    tone(440, 0, 80, 'triangle', 0.1);
    tone(660, 70, 120, 'triangle', 0.1);
  },
};
