export class AegeanSoundscape {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private breezeFilter: BiquadFilterNode | null = null;
  private isPlaying = false;
  private waveTimer: number | null = null;

  public toggle(): boolean {
    if (this.isPlaying) {
      this.stop();
      return false;
    }
    this.start();
    return true;
  }

  public setBreezeIntensity(normalized: number): void {
    if (!this.breezeFilter || !this.ctx) return;
    const targetFreq = 260 + normalized * 520;
    this.breezeFilter.frequency.setTargetAtTime(targetFreq, this.ctx.currentTime, 0.25);
  }

  private start(): void {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!this.ctx) {
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === "suspended") {
      void this.ctx.resume();
    }

    const now = this.ctx.currentTime;
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(0.001, now);
    this.masterGain.gain.exponentialRampToValueAtTime(0.22, now + 1.2);
    this.masterGain.connect(this.ctx.destination);

    // Pink-noise buffer for Aegean surf and Meltemi breeze
    const bufferSize = this.ctx.sampleRate * 4;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let b0 = 0;
    let b1 = 0;
    let b2 = 0;
    let b3 = 0;
    let b4 = 0;
    let b5 = 0;
    let b6 = 0;
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

    // Continuous soft breeze through lemon & olive leaves
    const breezeSource = this.ctx.createBufferSource();
    breezeSource.buffer = noiseBuffer;
    breezeSource.loop = true;

    this.breezeFilter = this.ctx.createBiquadFilter();
    this.breezeFilter.type = "bandpass";
    this.breezeFilter.frequency.setValueAtTime(420, now);
    this.breezeFilter.Q.setValueAtTime(1.8, now);

    const breezeGain = this.ctx.createGain();
    breezeGain.gain.setValueAtTime(0.32, now);

    breezeSource.connect(this.breezeFilter);
    this.breezeFilter.connect(breezeGain);
    breezeGain.connect(this.masterGain);
    breezeSource.start(now);

    // Periodic gentle harbor wave swells
    const triggerWave = () => {
      if (!this.isPlaying || !this.ctx || !this.masterGain) return;
      const t = this.ctx.currentTime;
      const waveSrc = this.ctx.createBufferSource();
      waveSrc.buffer = noiseBuffer;
      waveSrc.loop = true;

      const filter = this.ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(180, t);
      filter.frequency.exponentialRampToValueAtTime(680, t + 1.8);
      filter.frequency.exponentialRampToValueAtTime(140, t + 4.6);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.001, t);
      gain.gain.linearRampToValueAtTime(0.45, t + 1.7);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 4.8);

      waveSrc.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);

      waveSrc.start(t);
      waveSrc.stop(t + 5.0);
    };

    this.isPlaying = true;
    triggerWave();
    this.waveTimer = window.setInterval(triggerWave, 5200);
  }

  private stop(): void {
    this.isPlaying = false;
    if (this.waveTimer !== null) {
      clearInterval(this.waveTimer);
      this.waveTimer = null;
    }
    if (this.ctx && this.masterGain) {
      const now = this.ctx.currentTime;
      this.masterGain.gain.setTargetAtTime(0.0001, now, 0.25);
      setTimeout(() => {
        if (!this.isPlaying && this.ctx) {
          void this.ctx.suspend();
        }
      }, 450);
    }
  }
}

