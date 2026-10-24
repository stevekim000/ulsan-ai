// Web Audio API를 활용한 오프라인 구조 호루라기 및 SOS 사이렌 합성기

class SoundSynthesizer {
  private ctx: AudioContext | null = null;
  private isPlaying: boolean = false;
  private intervalId: any = null;

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === "suspended") {
      this.ctx.resume();
    }
  }

  // 조난 구조용 고주파 호루라기 소리 (Whistle Sound - 약 2,800Hz 고주파가 산속에서 가장 멀리 퍼짐)
  playWhistle() {
    this.initContext();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = "sine";
    // 사람의 귀에 가장 잘 들리고 산악에서 멀리 전달되는 2800Hz 대역
    osc.frequency.setValueAtTime(2700, this.ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(2950, this.ctx.currentTime + 0.15);
    osc.frequency.linearRampToValueAtTime(2700, this.ctx.currentTime + 0.35);

    gain.gain.setValueAtTime(0, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.7, this.ctx.currentTime + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.5);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.5);
  }

  // 모스 부호 SOS 신호 (... --- ...) 반복 재생
  startSosMorse(onStateChange?: (playing: boolean) => void) {
    if (this.isPlaying) return;
    this.initContext();
    this.isPlaying = true;
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

    // 2초마다 삐삐삐-삐-삐-삐-삐삐삐 사운드
    const pattern = () => {
      if (!this.isPlaying) return;
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
    this.intervalId = setInterval(pattern, 3200);
  }

  stopSos(onStateChange?: (playing: boolean) => void) {
    this.isPlaying = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    if (onStateChange) onStateChange(false);
  }

  getIsPlaying() {
    return this.isPlaying;
  }
}

export const soundSynth = new SoundSynthesizer();
