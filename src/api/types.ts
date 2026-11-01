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
  // durationMs + nameSpots: the song's shape, drawn on the song screen.
  intro?: { templateUrl: string; nameAtMs: number; durationMs: number; nameSpots: { startMs: number; endMs: number }[] };
  // The name as it is sung (cleaned up by the server) and the song's style.
  name: string;
  genre?: string;
  // The line being sung with the user's name in it, in the song's own script.
  lyric?: string;
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
