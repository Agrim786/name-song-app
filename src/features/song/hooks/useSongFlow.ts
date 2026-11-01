import { randomUUID } from "expo-crypto";
import { useCallback, useEffect } from "react";
import { ApiError } from "../../../api/client";
import { useFlowStore } from "../store/flowStore";
import { usePrefsStore } from "../store/prefsStore";
import { strings } from "../strings";
import { useCreateSong } from "./useCreateSong";
import { useLanguages } from "./useLanguages";
import { useRecorder } from "./useRecorder";
import { useSongStatus } from "./useSongStatus";
import { useTranscribe } from "./useTranscribe";

// If the language list can't be loaded (offline at launch), Hindi always exists.
const FALLBACK_LANG = "hi";

const messageFor = (e: unknown) => {
  if (e instanceof ApiError) {
    if (e.status === 0) return strings.offline;
    // 4xx messages are written for users (e.g. "This name can't be used").
    if (e.status >= 400 && e.status < 500 && e.status !== 429) return e.message;
  }
  return strings.genericError;
};

// The one hook the screen talks to. It turns user actions and server answers into
// state-machine events; the screen just renders the current phase.
export function useSongFlow() {
  const phase = useFlowStore((s) => s.phase);
  const send = useFlowStore((s) => s.send);
  const savedLang = usePrefsStore((s) => s.lang);
  const setLang = usePrefsStore((s) => s.setLang);
  const pending = usePrefsStore((s) => s.pending);
  const setPending = usePrefsStore((s) => s.setPending);

  const languages = useLanguages();
  const recorder = useRecorder();
  const { mutateAsync: runTranscribe } = useTranscribe();
  const { mutate: createSong, reset: resetCreate, isPending: creating } = useCreateSong();

  const list = languages.data ?? [];
  // Preselect the last language used, if the server still offers it.
  const lang = savedLang && (list.length === 0 || list.includes(savedLang)) ? savedLang : (list[0] ?? FALLBACK_LANG);

  const songId = phase.kind === "song" ? phase.songId : null;
  const song = useSongStatus(songId);

  // App reopened while a song was still in line: pick it back up.
  useEffect(() => {
    const p = usePrefsStore.getState().pending;
    if (p) send({ type: "RESUME", songId: p.songId, name: p.name });
  }, [send]);

  // The server doesn't know this song (a saved "come back later" song whose record
  // is gone): forget it and start over, instead of waiting on it forever.
  useEffect(() => {
    const e = song.error;
    if (e instanceof ApiError && e.status === 404) {
      setPending(null);
      send({ type: "RESET" });
    }
  }, [song.error, setPending, send]);

  // Done (or failed): nothing to come back for anymore.
  useEffect(() => {
    const status = song.data?.status;
    if (pending && (status === "ready" || status === "failed")) setPending(null);
  }, [song.data?.status, pending, setPending]);

  // Stopping hands the recording straight to speech-to-text. If the user moves on
  // meanwhile, the machine ignores the late answer.
  const stopRecording = useCallback(async () => {
    const audio = await recorder.stop();
    if (!audio) return send({ type: "RECORD_CANCEL" });
    send({ type: "RECORD_DONE", audio });
    runTranscribe(audio)
      .then((r) => send({ type: "TRANSCRIBED", name: r.name }))
      .catch(() => send({ type: "TRANSCRIBE_FAILED" }));
  }, [recorder, send, runTranscribe]);

  const startRecording = useCallback(async () => {
    send({ type: "RECORD_START" });
    const result = await recorder.start(() => void stopRecording());
    if (result !== "started") send({ type: "MIC_UNAVAILABLE" });
  }, [recorder, send, stopRecording]);

  const editName = useCallback((name: string) => send({ type: "NAME_EDITED", name }), [send]);
  const confirmName = useCallback(() => send({ type: "NAME_CONFIRMED" }), [send]);
  const changeName = useCallback(() => send({ type: "CHANGE_NAME" }), [send]);

  const requestSong = useCallback(
    (name: string, songLang: string, onDone: (songId: string) => void) =>
      // A fresh key per tap; the mutation's own retries reuse it, so a flaky network
      // can never create two jobs for one tap.
      createSong(
        { name, lang: songLang, idempotencyKey: randomUUID() },
        {
          onSuccess: (s) => {
            // Remember it in case the user leaves before it's ready.
            if (s.status !== "ready") setPending({ songId: s.songId, name });
            onDone(s.songId);
          },
          onError: (e) => send({ type: "SUBMIT_FAILED", message: messageFor(e) }),
        },
      ),
    [createSong, setPending, send],
  );

  const submit = useCallback(
    (songLang: string) => {
      if (phase.kind !== "language") return;
      setLang(songLang);
      send({ type: "SUBMIT", lang: songLang });
      requestSong(phase.name, songLang, (id) => send({ type: "SUBMITTED", songId: id }));
    },
    [phase, setLang, send, requestSong],
  );

  // "Try again" on a failed song: re-posting re-queues it on the server.
  const retrySong = useCallback(() => {
    if (phase.kind !== "song") return;
    requestSong(phase.name, lang, (id) => send({ type: "SONG_CHANGED", songId: id }));
  }, [phase, lang, requestSong, send]);

  const reset = useCallback(() => {
    setPending(null);
    resetCreate();
    send({ type: "RESET" });
  }, [resetCreate, setPending, send]);

  return {
    phase,
    languages: list.length ? list : [lang],
    lang,
    song: song.data,
    retrying: creating && phase.kind === "song",
    startRecording,
    stopRecording,
    editName,
    confirmName,
    changeName,
    submit,
    retrySong,
    reset,
  };
}
