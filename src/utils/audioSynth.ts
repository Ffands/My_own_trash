// Web Audio API sound synthesizer for authentic Sauron & FOD experience

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

let activeRumbleOsc: OscillatorNode | null = null;
let activeRumbleGain: GainNode | null = null;

/**
 * Starts ambient fiery magma rumble when finger touches scanner
 */
export function playFingerprintTouchSound() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    // Haptic pulse if supported
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate([15, 30, 15]);
    }

    // Stop previous if any
    stopFingerprintSound();

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(65, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(110, ctx.currentTime + 0.8);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(180, ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(320, ctx.currentTime + 0.8);

    gain.gain.setValueAtTime(0.01, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.12, ctx.currentTime + 0.15);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start();

    activeRumbleOsc = osc;
    activeRumbleGain = gain;
  } catch {
    // Audio context may require user gesture
  }
}

/**
 * Triggers triumphant unlock flare sound & vibration
 */
export function playFingerprintSuccessSound() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    stopFingerprintSound();

    // Haptic success
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate([40, 20, 60]);
    }

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.25);

    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.55);
  } catch {
    // ignore
  }
}

/**
 * Stops active sound when finger is lifted
 */
export function stopFingerprintSound() {
  try {
    const ctx = audioCtx;
    if (activeRumbleGain && ctx) {
      activeRumbleGain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.08);
      setTimeout(() => {
        if (activeRumbleOsc) {
          try {
            activeRumbleOsc.stop();
            activeRumbleOsc.disconnect();
          } catch {
            // ignore
          }
          activeRumbleOsc = null;
        }
      }, 90);
    }
  } catch {
    // ignore
  }
}
