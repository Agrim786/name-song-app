import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createSong } from "../../../api/songs";
import { songKey } from "./useSongStatus";

// The response already holds the song's status, so it seeds the status query and
// the first poll waits for pollAfterSeconds instead of firing at once.
export function useCreateSong() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createSong,
    onSuccess: (song) => qc.setQueryData(songKey(song.songId), song),
  });
}
