import {
  type AudioPlayer,
  type AudioStatus,
  createAudioPlayer,
} from "expo-audio";
import type { SongView } from "../../api/types";
import { config } from "../../config/config";

// idle:    nothing playing (line is long, or no answer yet)
// intro:   the template is playing while the song is being sung
// holding: the intro reached the name spot before the song was ready; paused there
// song:    the user's song is playing
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// Resolves when check() is true, or after timeoutMs either way.
async function waitFor(check: () => boolean, timeoutMs: number) {
  const until = Date.now() + timeoutMs;
  while (!check() && Date.now() < until) await sleep(20);
}

export type PlayerStage = "idle" | "intro" | "holding" | "song";

export interface PlaybackSnapshot {
  stage: PlayerStage;
  playing: boolean;
}

// Hides the wait. The sung song is the template with the name spliced in, so up to
// the name spot both are the same audio. We play the template the moment the song
// is requested and switch to the song at the same position once it exists: the
// user hears one song, starting instantly.
//
// Plain class, not React state: it reacts to the players' own status events, and
// React re-renders only when the stage changes, not on every position tick. That
// matters on low-end phones.
export class SongPlayback {
  private intro: AudioPlayer | null = null;
  private song: AudioPlayer | null = null;
  private subs: { remove: () => void }[] = [];
  private snap: PlaybackSnapshot = { stage: "idle", playing: false };
  private listeners = new Set<() => void>();
  private holdAt = 0;
  private introUrl: string | undefined;
  private songUrl: string | undefined;
  private songLoaded = false;
  private swapping = false;

  // --- React bridge (useSyncExternalStore) ---
  subscribe = (listener: () => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };

  getSnapshot = () => this.snap;

  // --- Driven by the server's view of the song ---
  update = (view: SongView | undefined) => {
    if (!view) return;
    const { intro, song } = this.players();
    if (view.intro)
      this.holdAt = (view.intro.nameAtMs - config.holdBeforeNameMs) / 1000;

    const songUrl = view.status === "ready" ? view.url : undefined;
    if (songUrl && songUrl !== this.songUrl) {
      // Start loading at once, in parallel with the intro; onSong() swaps when ready.
      this.songUrl = songUrl;
      this.songLoaded = false;
      song.replace({ uri: songUrl });
    }

    const shortWait = view.wait === "short" && !songUrl;
    if (
      shortWait &&
      view.intro &&
      view.intro.templateUrl !== this.introUrl &&
      this.snap.stage === "idle"
    ) {
      this.introUrl = view.intro.templateUrl;
      intro.replace({ uri: view.intro.templateUrl });
      intro.volume = 1;
      intro.play();
      this.set({ stage: "intro", playing: true });
    }

    // The line turned long while the intro played: stop rather than hold forever.
    if (
      view.wait === "later" &&
      (this.snap.stage === "intro" || this.snap.stage === "holding")
    ) {
      intro.pause();
      this.set({ stage: "idle", playing: false });
    }
  };

  // --- User controls ---
  toggle = () => {
    const { song } = this.players();
    if (this.snap.stage !== "song") return;
    if (song.playing) {
      song.pause();
      this.set({ playing: false });
      return;
    }
    // Finished: play again from the top.
    if (song.duration > 0 && song.currentTime >= song.duration - 0.25)
      void song.seekTo(0);
    song.play();
    this.set({ playing: true });
  };

  stop = () => {
    this.intro?.pause();
    this.song?.pause();
    this.set({ playing: false });
  };

  // A different song (make another, or retry): forget everything.
  reset = () => {
    this.stop();
    this.introUrl = undefined;
    this.songUrl = undefined;
    this.songLoaded = false;
    this.swapping = false;
    this.set({ stage: "idle", playing: false });
  };

  // Frees the native players. Safe to call twice; they are recreated on next use.
  release = () => {
    this.subs.forEach((s) => s.remove());
    this.subs = [];
    this.intro?.remove();
    this.song?.remove();
    this.intro = null;
    this.song = null;
    this.reset();
  };

  // --- Internals ---
  private players() {
    if (!this.intro || !this.song) {
      // Frequent ticks on the intro only: it must stop on time at the name spot.
      this.intro = createAudioPlayer(null, { updateInterval: 100 });
      // downloadFirst: the whole song is on the phone before it plays, so lining it
      // up at the intro's position is instant instead of a network round-trip.
      this.song = createAudioPlayer(null, {
        updateInterval: 500,
        downloadFirst: true,
      });
      this.subs = [
        this.intro.addListener("playbackStatusUpdate", this.onIntro),
        this.song.addListener("playbackStatusUpdate", this.onSong),
      ];
    }
    return { intro: this.intro, song: this.song };
  }

  // Song not ready as the intro nears the name: fade out and hold there.
  private onIntro = (s: AudioStatus) => {
    if (this.snap.stage !== "intro" || this.songLoaded || !this.intro) return;
    const t = s.currentTime;
    const fade = config.fadeOutMs / 1000;
    if (t >= this.holdAt) {
      this.intro.pause();
      this.set({ stage: "holding", playing: false });
    } else if (t >= this.holdAt - fade) {
      this.intro.volume = Math.max(0, (this.holdAt - t) / fade);
    }
  };

  private onSong = (s: AudioStatus) => {
    if (s.isLoaded && !this.songLoaded && this.songUrl) {
      this.songLoaded = true;
      void this.swap();
    }
    if (this.snap.stage === "song" && s.playing !== this.snap.playing)
      this.set({ playing: s.playing });
  };

  // Continue from where the intro is (or the hold point, or the start if there was
  // no intro, e.g. a song that was already made).
  private async swap() {
    const { intro, song } = this.players();
    if (this.swapping || this.snap.stage === "song") return;
    this.swapping = true;
    const lead = config.swapLeadMs / 1000;
    // Only hand over on the fly if that point is still before the name spot; closer
    // than that, the intro could play into the template's placeholder word.
    if (
      this.snap.stage === "intro" &&
      intro.currentTime + lead <= this.holdAt
    ) {
      // Seamless hand-over. Saying "play" is not instant: Android's player needs
      // 100-300 ms before sound comes out, and stopping the intro at that moment left
      // an audible gap on first play (replays were fine). So: start the song silently
      // first, wait until it is really playing, line it up with the intro, then
      // crossfade. Both are the same audio up to the name spot, so it is inaudible.
      song.volume = 0;
      await song.seekTo(intro.currentTime + lead).catch(() => undefined);
      song.play();
      await waitFor(() => song.playing && song.currentTime > 0, 1500);
      if (intro.currentTime + config.crossfadeMs / 1000 >= this.holdAt) {
        // Warm-up ran into the name spot: stop there and continue with the song.
        intro.pause();
        await song.seekTo(this.holdAt).catch(() => undefined);
        song.volume = 1;
        this.swapping = false;
        this.set({ stage: "song", playing: true });
        return;
      }
      await song.seekTo(intro.currentTime).catch(() => undefined);
      const steps = 6;
      for (let i = 1; i <= steps; i++) {
        song.volume = i / steps;
        intro.volume = 1 - i / steps;
        await sleep(config.crossfadeMs / steps);
      }
      intro.pause();
    } else {
      // Held at the name spot, about to reach it, or no intro at all (a song that was
      // already made): stop the intro and start the song from the right point.
      const from =
        this.snap.stage === "idle"
          ? 0
          : Math.min(intro.currentTime, this.holdAt);
      intro.pause();
      await song.seekTo(from).catch(() => undefined);
      song.volume = 1;
      song.play();
    }
    this.swapping = false;
    this.set({ stage: "song", playing: true });
  }

  private set(patch: Partial<PlaybackSnapshot>) {
    const next = { ...this.snap, ...patch };
    if (next.stage === this.snap.stage && next.playing === this.snap.playing)
      return;
    this.snap = next;
    this.listeners.forEach((l) => l());
  }
}
