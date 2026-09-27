/**
 * Web Audio API synthesizer for digital stethoscope lung sound simulation
 * Recreates authentic vesicular breathing, crackles (explosive clicks), and wheezes (musical tones)
 */

class StethoscopeAudioEngine {
  private ctx: AudioContext | null = null;
  private isPlaying: boolean = false;
  private startTime: number = 0;
  private pausedAt: number = 0;
  private duration: number = 24.6;
  private gainNode: GainNode | null = null;
  private timerId: number | null = null;
  private onTimeUpdateCallback: ((time: number) => void) | null = null;
  private onEndedCallback: (() => void) | null = null;
  private currentSoundType: string = 'Normal';

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.gainNode = this.ctx.createGain();
      this.gainNode.gain.value = 0.8;
      this.gainNode.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public play(
    soundType: string = 'Crackles + Wheezes',
    duration: number = 24.6,
    onTimeUpdate?: (time: number) => void,
    onEnded?: () => void
  ) {
    this.initContext();
    if (!this.ctx || !this.gainNode) return;

    if (this.isPlaying) {
      this.pause();
    }

    this.duration = duration;
    this.currentSoundType = soundType;
    this.onTimeUpdateCallback = onTimeUpdate || null;
    this.onEndedCallback = onEnded || null;

    const startOffset = this.pausedAt % this.duration;
    this.startTime = this.ctx.currentTime - startOffset;
    this.isPlaying = true;

    this.scheduleBreaths(startOffset);

    // Track playback time
    if (this.timerId) clearInterval(this.timerId);
    this.timerId = window.setInterval(() => {
      if (!this.ctx || !this.isPlaying) return;
      const current = this.ctx.currentTime - this.startTime;
      if (current >= this.duration) {
        this.stop();
        if (this.onEndedCallback) this.onEndedCallback();
      } else {
        if (this.onTimeUpdateCallback) {
          this.onTimeUpdateCallback(Math.min(current, this.duration));
        }
      }
    }, 50);
  }

  private scheduleBreaths(startOffset: number) {
    if (!this.ctx || !this.gainNode) return;

    const cycleLength = 2.7; // ~2.7s per breath cycle
    const totalCycles = Math.ceil(this.duration / cycleLength);

    for (let i = 0; i < totalCycles; i++) {
      const cycleStart = i * cycleLength;
      if (cycleStart + cycleLength < startOffset) continue;

      const scheduleTime = this.startTime + cycleStart;
      if (scheduleTime < this.ctx.currentTime) continue;

      this.createBreathCycle(scheduleTime, this.currentSoundType);
    }
  }

  private createBreathCycle(startTime: number, type: string) {
    if (!this.ctx || !this.gainNode) return;

    // Breath noise generator (filtered pink noise)
    const bufferSize = this.ctx.sampleRate * 2.7;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;

    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.04;
      b6 = white * 0.115926;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;

    // Bandpass filter to model lung tissue and stethoscope diaphragm (150Hz - 650Hz)
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(320, startTime);
    filter.Q.setValueAtTime(1.5, startTime);

    // Inhalation / Exhalation envelope
    const env = this.ctx.createGain();
    env.gain.setValueAtTime(0.001, startTime);
    // Inhalation (1.1s)
    env.gain.exponentialRampToValueAtTime(0.35, startTime + 0.6);
    env.gain.exponentialRampToValueAtTime(0.02, startTime + 1.2);
    // Exhalation (1.3s)
    env.gain.exponentialRampToValueAtTime(0.25, startTime + 1.8);
    env.gain.exponentialRampToValueAtTime(0.001, startTime + 2.6);

    whiteNoise.connect(filter);
    filter.connect(env);
    env.connect(this.gainNode);

    whiteNoise.start(startTime);
    whiteNoise.stop(startTime + 2.7);

    // Crackles simulation (explosive brief popping clicks during mid-to-late inspiration)
    if (type === 'Crackles' || type === 'Crackles + Wheezes') {
      const crackleTimes = [0.45, 0.6, 0.72, 0.85, 0.95, 1.05];
      crackleTimes.forEach((relTime) => {
        const cTime = startTime + relTime;
        const osc = this.ctx!.createOscillator();
        const cGain = this.ctx!.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(450 + Math.random() * 350, cTime);

        cGain.gain.setValueAtTime(0.001, cTime);
        cGain.gain.linearRampToValueAtTime(0.4, cTime + 0.005);
        cGain.gain.exponentialRampToValueAtTime(0.001, cTime + 0.035);

        osc.connect(cGain);
        cGain.connect(this.gainNode!);

        osc.start(cTime);
        osc.stop(cTime + 0.04);
      });
    }

    // Wheezes simulation (high pitched musical whistling tone during exhalation)
    if (type === 'Wheezes' || type === 'Crackles + Wheezes') {
      const wheezeStart = startTime + 1.35;
      const osc = this.ctx!.createOscillator();
      const wGain = this.ctx!.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(420, wheezeStart);
      osc.frequency.linearRampToValueAtTime(390, wheezeStart + 1.1);

      wGain.gain.setValueAtTime(0.001, wheezeStart);
      wGain.gain.exponentialRampToValueAtTime(0.18, wheezeStart + 0.2);
      wGain.gain.exponentialRampToValueAtTime(0.001, wheezeStart + 1.1);

      osc.connect(wGain);
      wGain.connect(this.gainNode!);

      osc.start(wheezeStart);
      osc.stop(wheezeStart + 1.15);
    }
  }

  public pause() {
    if (!this.isPlaying || !this.ctx) return;
    this.pausedAt = this.ctx.currentTime - this.startTime;
    this.isPlaying = false;
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
    this.ctx.suspend();
  }

  public stop() {
    this.isPlaying = false;
    this.pausedAt = 0;
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
    if (this.ctx) {
      this.ctx.suspend();
    }
    if (this.onTimeUpdateCallback) {
      this.onTimeUpdateCallback(0);
    }
  }

  public seek(seconds: number) {
    this.pausedAt = Math.max(0, Math.min(seconds, this.duration));
    if (this.isPlaying) {
      this.play(this.currentSoundType, this.duration, this.onTimeUpdateCallback || undefined, this.onEndedCallback || undefined);
    } else {
      if (this.onTimeUpdateCallback) {
        this.onTimeUpdateCallback(this.pausedAt);
      }
    }
  }

  public setVolume(vol: number) {
    if (this.gainNode) {
      this.gainNode.gain.value = Math.max(0, Math.min(vol, 1));
    }
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }
}

export const stethoscopeAudio = new StethoscopeAudioEngine();
