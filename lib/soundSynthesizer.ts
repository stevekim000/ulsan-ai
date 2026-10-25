// Web Audio API를 활용한 오프라인 산악 구조 신호 호루라기 및 비상 듀얼톤 사이렌 합성기

class SoundSynthesizer {
  private ctx: AudioContext | null = null;
  private isMorsePlaying: boolean = false;
  private isDualTonePlaying: boolean = false;
  private morseIntervalId: any = null;
  private dualToneIntervalId: any = null;
  private dualToneOsc: OscillatorNode | null = null;
  private dualToneGain: GainNode | null = null;

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === "suspended") {
      this.ctx.resume();
    }
  }

  // 1. 단일 고주파 호루라기 (2,800Hz 대역)
  playWhistle() {
    this.initContext();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = "sine";
    // 2,800Hz 대역: 산악 지형에서 감쇠가 적고 인간 청각에 가장 예민하게 도달
    osc.frequency.setValueAtTime(2700, this.ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(2850, this.ctx.currentTime + 0.15);
    osc.frequency.linearRampToValueAtTime(2750, this.ctx.currentTime + 0.35);

    gain.gain.setValueAtTime(0, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.7, this.ctx.currentTime + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.5);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.5);
  }

  // 2. 구조 신호 호루라기 (약 2.8kHz 고주파 신호 3회 연속 패턴)
  playTripleWhistle() {
    this.initContext();
    if (!this.ctx) return;

    const burst = (startTimeOffset: number) => {
      if (!this.ctx) return;
      const t = this.ctx.currentTime + startTimeOffset;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(2750, t);
      osc.frequency.linearRampToValueAtTime(2850, t + 0.12);
      osc.frequency.linearRampToValueAtTime(2800, t + 0.3);

      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.75, t + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.38);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.4);
    };

    // 3회 반복 패턴: 0s, 0.55s, 1.1s
    burst(0);
    burst(0.55);
    burst(1.1);
  }

  // 3. 비상 듀얼톤 사이렌 (약 650Hz와 950Hz를 번갈아 사용하는 경보음)
  startDualToneSiren(onStateChange?: (playing: boolean) => void) {
    if (this.isDualTonePlaying) return;
    this.initContext();
    if (!this.ctx) return;

    this.isDualTonePlaying = true;
    if (onStateChange) onStateChange(true);

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = "sawtooth";
    gain.gain.setValueAtTime(0.25, this.ctx.currentTime);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();

    this.dualToneOsc = osc;
    this.dualToneGain = gain;

    let isHigh = false;
    // 0.4초마다 650Hz <-> 950Hz 전환
    const toggleFreq = () => {
      if (!this.isDualTonePlaying || !this.ctx || !this.dualToneOsc) return;
      const targetFreq = isHigh ? 650 : 950;
      this.dualToneOsc.frequency.setValueAtTime(targetFreq, this.ctx.currentTime);
      isHigh = !isHigh;
    };

    toggleFreq();
    this.dualToneIntervalId = setInterval(toggleFreq, 400);
  }

  stopDualToneSiren(onStateChange?: (playing: boolean) => void) {
    this.isDualTonePlaying = false;
    if (this.dualToneIntervalId) {
      clearInterval(this.dualToneIntervalId);
      this.dualToneIntervalId = null;
    }
    if (this.dualToneGain && this.ctx) {
      try {
        this.dualToneGain.gain.setValueAtTime(0, this.ctx.currentTime);
      } catch {}
    }
    if (this.dualToneOsc) {
      try {
        this.dualToneOsc.stop();
        this.dualToneOsc.disconnect();
      } catch {}
      this.dualToneOsc = null;
    }
    this.dualToneGain = null;
    if (onStateChange) onStateChange(false);
  }

  // 4. 모스 부호 SOS 신호 (... --- ...) 반복 재생
  startSosMorse(onStateChange?: (playing: boolean) => void) {
    if (this.isMorsePlaying) return;
    this.initContext();
    this.isMorsePlaying = true;
    if (onStateChange) onStateChange(true);

    const playBeep = (freq: number, duration: number) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "square";
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    };

    const pattern = () => {
      if (!this.isMorsePlaying) return;
      // 점(.) 3번
      setTimeout(() => playBeep(1200, 0.12), 0);
      setTimeout(() => playBeep(1200, 0.12), 200);
      setTimeout(() => playBeep(1200, 0.12), 400);
      // 선(-) 3번
      setTimeout(() => playBeep(900, 0.35), 700);
      setTimeout(() => playBeep(900, 0.35), 1100);
      setTimeout(() => playBeep(900, 0.35), 1500);
      // 점(.) 3번
      setTimeout(() => playBeep(1200, 0.12), 2000);
      setTimeout(() => playBeep(1200, 0.12), 2200);
      setTimeout(() => playBeep(1200, 0.12), 2400);
    };

    pattern();
    this.morseIntervalId = setInterval(pattern, 3200);
  }

  stopSos(onStateChange?: (playing: boolean) => void) {
    this.isMorsePlaying = false;
    if (this.morseIntervalId) {
      clearInterval(this.morseIntervalId);
      this.morseIntervalId = null;
    }
    if (onStateChange) onStateChange(false);
  }

  getIsMorsePlaying() {
    return this.isMorsePlaying;
  }

  getIsDualTonePlaying() {
    return this.isDualTonePlaying;
  }
}

export const soundSynth = new SoundSynthesizer();
