export class AudioSequencer {
  private muted = false;
  private version = 0;
  private currentEl: HTMLAudioElement | null = null;
  private currentResolve: (() => void) | null = null;

  preload(clipNames: string[]): Promise<void> {
    const promises = clipNames.map(name =>
      new Promise<void>(resolve => {
        const el = new Audio(`${import.meta.env.BASE_URL}audio/${name}.mp3`);
        el.preload = 'auto';
        el.addEventListener('canplaythrough', () => resolve(), { once: true });
        el.addEventListener('error', () => resolve(), { once: true });
      })
    );
    return Promise.allSettled(promises).then(() => {});
  }

  stop(): void {
    this.version++;
    if (this.currentEl) {
      this.currentEl.pause();
      this.currentEl = null;
    }
    if (this.currentResolve) {
      this.currentResolve();
      this.currentResolve = null;
    }
  }

  async play(clipName: string): Promise<void> {
    if (this.muted) return;
    return new Promise<void>(resolve => {
      const el = new Audio(`${import.meta.env.BASE_URL}audio/${clipName}.mp3`);
      this.currentEl = el;
      this.currentResolve = resolve;

      const done = () => {
        if (this.currentEl === el) this.currentEl = null;
        if (this.currentResolve === resolve) this.currentResolve = null;
        resolve();
      };

      el.addEventListener('ended', done, { once: true });
      el.addEventListener('error', done, { once: true });
      el.play().catch(() => done());
    });
  }

  async sequence(clipNames: string[], pauseMs = 80): Promise<void> {
    const ver = this.version;
    for (const name of clipNames) {
      if (ver !== this.version) break;
      await this.play(name);
      if (ver !== this.version) break;
      if (pauseMs > 0) {
        await new Promise<void>(r => setTimeout(r, pauseMs));
      }
    }
  }

  setMuted(muted: boolean): void {
    this.muted = muted;
    if (muted) this.stop();
  }

  isMuted(): boolean {
    return this.muted;
  }
}

export const audio = new AudioSequencer();
