import { useEffect, useState, useSyncExternalStore } from "react";
import type { SongView } from "../../../api/types";
import { SongPlayback } from "../playback";

export type { PlayerStage } from "../playback";

// React bridge to SongPlayback: feeds it the server's view, re-renders only when
// the playback stage changes.
export function useSongPlayer(view: SongView | undefined) {
  const [playback] = useState(() => new SongPlayback());
  const snap = useSyncExternalStore(playback.subscribe, playback.getSnapshot);

  useEffect(() => playback.release, [playback]);

  // New song (make another, retry): start clean. Declared before update() so it
  // runs first when the id changes.
  const songId = view?.songId;
  useEffect(() => {
    playback.reset();
  }, [playback, songId]);

  useEffect(() => {
    playback.update(view);
  }, [playback, view]);

  return { ...snap, toggle: playback.toggle, stop: playback.stop };
}
