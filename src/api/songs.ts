import { request } from "./client";
import type { CreateSongResponse, SongView } from "./types";

export interface CreateSongInput {
  name: string;
  lang: string;
  // One per tap, reused by retries, so a retried request never creates a second job.
  idempotencyKey: string;
}

export const createSong = ({ name, lang, idempotencyKey }: CreateSongInput) =>
  request<CreateSongResponse>("/v1/songs", {
    method: "POST",
    body: JSON.stringify({ name, lang }),
    headers: {
      "Content-Type": "application/json",
      "Idempotency-Key": idempotencyKey,
    },
  });

export const getSong = (songId: string) =>
  request<SongView>(`/v1/songs/${songId}`);
