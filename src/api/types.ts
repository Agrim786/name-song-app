// Mirrors the backend's responses (song-backend/src/modules/songs/songs.service.ts).

export type SongStatus = "queued" | "processing" | "ready" | "failed";

// none: ready or failed. short: show "composing", poll soon. later: line is long,
// show "come back in a bit" (never a countdown we can't keep).
export type Wait = "none" | "short" | "later";

export interface SongView {
  songId: string;
  status: SongStatus;
  templateId: string;
  url?: string;
  wait: Wait;
  etaSeconds?: number;
  pollAfterSeconds?: number;
  intro?: { templateUrl: string; nameAtMs: number };
}

export interface CreateSongResponse extends SongView {
  replayed: boolean;
}

export interface TranscribeResponse {
  name: string | null;
  needsTyping: boolean;
}

export interface LanguagesResponse {
  languages: string[];
}
