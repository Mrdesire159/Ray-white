// Web Audio API procedural luxury villa ambient soundscape
// Generates gentle breeze, distant air, and soft pool water laps
class VillaSoundscape {
  private ctx: AudioContext | null = null;
  private isPlaying: boolean = false;
  private gainNode: GainNode | null = null;
  private timer: number | null = null;

  public init() {
    if (this.ctx) return;
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    this.ctx = new AudioCtx();
  }

  public play() {
    this.init();
    if (!this.ctx) return;
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    if (this.isPlaying) return;
    this.isPlaying = true;

    // Master gain
    this.gainNode = this.ctx.createGain();
    this.gainNode.gain.setValueAtTime(0.01, this.ctx.currentTime);
    this.gainNode.gain.exponentialRampToValueAtTime(0.18, this.ctx.currentTime + 3);
    this.gainNode.connect(this.ctx.destination);

    // 1. Soft wind / breeze using filtered pink noise buffer
    const bufferSize = this.ctx.sampleRate * 2;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      output[i] = (b0 + b1 + b2) * 0.06;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 350;

    whiteNoise.connect(filter);
    filter.connect(this.gainNode);
    whiteNoise.start();

    // 2. Periodic gentle pool water ripple trickles
    const triggerWaterLap = () => {
      if (!this.isPlaying || !this.ctx || !this.gainNode) return;
      const osc = this.ctx.createOscillator();
      const lapGain = this.ctx.createGain();

      osc.type = 'sine';
      const baseFreq = 400 + Math.random() * 250;
      osc.frequency.setValueAtTime(baseFreq, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.6, this.ctx.currentTime + 0.3);

      lapGain.gain.setValueAtTime(0.001, this.ctx.currentTime);
      lapGain.gain.linearRampToValueAtTime(0.035, this.ctx.currentTime + 0.05);
      lapGain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.35);

      osc.connect(lapGain);
      lapGain.connect(this.gainNode);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.4);

      this.timer = window.setTimeout(triggerWaterLap, 2000 + Math.random() * 3000);
    };

    this.timer = window.setTimeout(triggerWaterLap, 1000);
  }

  public stop() {
    if (!this.ctx || !this.gainNode) return;
    this.gainNode.gain.setValueAtTime(this.gainNode.gain.value, this.ctx.currentTime);
    this.gainNode.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.5);
    setTimeout(() => {
      this.isPlaying = false;
      if (this.timer) clearTimeout(this.timer);
    }, 500);
  }

  public toggle(): boolean {
    if (this.isPlaying) {
      this.stop();
      return false;
    } else {
      this.play();
      return true;
    }
  }

  public get active(): boolean {
    return this.isPlaying;
  }
}

export const villaAudio = new VillaSoundscape();
