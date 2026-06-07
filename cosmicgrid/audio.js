/**
 * Example usage in app.js:
 * 
 * import { AudioEngine } from './audio.js';
 * const audio = new AudioEngine();
 * 
 * // Trigger on user interaction (e.g., click or keydown)
 * document.addEventListener('click', async () => {
 *   await audio.resume();
 * });
 * 
 * // Play sounds anywhere in your game logic:
 * // audio.playThrust();
 * // audio.playShield();
 * // audio.playStar();
 * // audio.playPortal();
 */

/**
 * AudioEngine - Modular Web Audio API Synthesizer
 */
export class AudioEngine {
  constructor() {
    this.ctx = new (window.AudioContext || window.webkitAudioContext)();
  }

  async resume() {
    if (this.ctx.state === 'suspended') {
      await this.ctx.resume();
    }
  }

  _createOscillator(type, freq, time, duration, gainValue = 0.1) {
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, time);
    gain.gain.setValueAtTime(gainValue, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + duration);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(time);
    osc.stop(time + duration);
  }

  playThrust() {
    const now = this.ctx.currentTime;
    this._createOscillator('sawtooth', 150, now, 0.5, 0.2);
    this._createOscillator('sawtooth', 100, now + 0.1, 0.4, 0.1);
  }

  playShield() {
    const now = this.ctx.currentTime;
    this._createOscillator('sine', 60, now, 0.8, 0.3);
  }

  playStar() {
    const now = this.ctx.currentTime;
    this._createOscillator('triangle', 880, now, 0.2, 0.1);
    this._createOscillator('triangle', 1318, now + 0.05, 0.2, 0.1);
  }

  playPortal() {
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(100, now);
    filter.frequency.exponentialRampToValueAtTime(2000, now + 1.0);

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(100, now);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 1.0);

    osc.start(now);
    osc.stop(now + 1.0);
  }
}
