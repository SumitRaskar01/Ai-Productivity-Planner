import { useCallback } from 'react';

const SOUNDS = {
  focus_end:  { freq: 880, type: 'sine',     duration: 0.6, fadeOut: 0.4 },
  task_start: { freq: 523, type: 'triangle', duration: 0.3, fadeOut: 0.2 },
  save:       { freq: 660, type: 'sine',     duration: 0.2, fadeOut: 0.15 },
};

export function useSound(soundEnabled) {
  const play = useCallback((name) => {
    if (!soundEnabled) return;
    const config = SOUNDS[name];
    if (!config) return;

    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.type = config.type;
      osc.frequency.setValueAtTime(config.freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + config.duration);

      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + config.duration);
      osc.onended = () => ctx.close();
    } catch {
      // AudioContext unavailable
    }
  }, [soundEnabled]);

  return { play };
}
