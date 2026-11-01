import { useQuery } from "@tanstack/react-query";
import { getSong } from "../../../api/songs";
import { config } from "../../../config/config";

export const songKey = (songId: string) => ["song", songId] as const;

// Polls at the pace the server asks for (pollAfterSeconds), with +-15% jitter so
// waiting phones never ask in lockstep. Stops when the song is ready or failed, and
// pauses while the app is in the background (see focusManager in queryClient.ts).
export const useSongStatus = (songId: string | null) =>
  useQuery({
    queryKey: songKey(songId ?? ""),
    queryFn: () => getSong(songId!),
    enabled: songId !== null,
    refetchInterval: (q) => {
      const d = q.state.data;
      if (d && (d.status === "ready" || d.status === "failed")) return false;
      const seconds = d?.pollAfterSeconds ?? config.defaultPollSeconds;
      return seconds * 1000 * (0.85 + Math.random() * 0.3);
    },
  });
