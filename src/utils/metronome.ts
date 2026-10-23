class MetronomeEngine {
  private audioCtx: AudioContext | null = null;
  private isRunning: boolean = false;
  private bpm: number = 90;
  private currentBeat: number = 0;
  private currentBar: number = 1;
  private nextNoteTime: number = 0;
  private timerId: number | null = null;
  private volume: number = 0.6;
  private onBeatCallback?: (beat: number, bar: number) => void;

  constructor() {
    // AudioContext will be initialized on user interaction
  }

  private initAudio() {
    if (!this.audioCtx) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      this.audioCtx = new AudioContextClass();
    }
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  public setBpm(newBpm: number) {
    this.bpm = Math.max(30, Math.min(300, newBpm));
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
  }

  public setOnBeat(cb: (beat: number, bar: number) => void) {
    this.onBeatCallback = cb;
  }

  public start(bpm?: number) {
    if (this.isRunning) return;
    if (bpm) this.setBpm(bpm);

    this.initAudio();
    this.isRunning = true;
    this.currentBeat = 0;
    this.currentBar = 1;
    this.nextNoteTime = this.audioCtx!.currentTime + 0.05;

    this.scheduler();
  }

  public stop() {
    this.isRunning = false;
    if (this.timerId !== null) {
      window.clearTimeout(this.timerId);
      this.timerId = null;
    }
  }

  public toggle(): boolean {
    if (this.isRunning) {
      this.stop();
      return false;
    } else {
      this.start();
      return true;
    }
  }

  public isActive(): boolean {
    return this.isRunning;
  }

  private scheduleNote(time: number, beat: number) {
    if (!this.audioCtx || this.volume <= 0.01) return;

    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();

    osc.connect(gain);
    gain.connect(this.audioCtx.destination);

    // Beat 0 (Downbeat) has higher pitch and slightly more volume
    if (beat === 0) {
      osc.frequency.setValueAtTime(1200, time);
      gain.gain.setValueAtTime(this.volume * 0.9, time);
    } else {
      osc.frequency.setValueAtTime(800, time);
      gain.gain.setValueAtTime(this.volume * 0.5, time);
    }

    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.04);

    osc.start(time);
    osc.stop(time + 0.045);
  }

  private scheduler = () => {
    if (!this.isRunning || !this.audioCtx) return;

    // Look ahead 100ms
    while (this.nextNoteTime < this.audioCtx.currentTime + 0.1) {
      this.scheduleNote(this.nextNoteTime, this.currentBeat);

      // Trigger UI callback
      const beatForUi = this.currentBeat;
      const barForUi = this.currentBar;
      setTimeout(() => {
        if (this.onBeatCallback && this.isRunning) {
          this.onBeatCallback(beatForUi, barForUi);
        }
      }, Math.max(0, (this.nextNoteTime - this.audioCtx.currentTime) * 1000));

      // Advance
      const secondsPerBeat = 60.0 / this.bpm;
      this.nextNoteTime += secondsPerBeat;

      this.currentBeat++;
      if (this.currentBeat >= 4) {
        this.currentBeat = 0;
        this.currentBar++;
      }
    }

    this.timerId = window.setTimeout(this.scheduler, 25);
  };
}

export const metronome = new MetronomeEngine();
