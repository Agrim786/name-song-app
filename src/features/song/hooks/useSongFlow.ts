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
  const transcribe = useTranscribe();
  const create = useCreateSong();

  const list = languages.data ?? [];
  const lang = savedLang && (list.length === 0 || list.includes(savedLang)) ? savedLang : (list[0] ?? FALLBACK_LANG);

  const songId = phase.kind === "song" ? phase.songId : null;
  const song = useSongStatus(songId);

  // App reopened while a song was still in line: pick it back up.
  useEffect(() => {
    const p = usePrefsStore.getState().pending;
    if (p) send({ type: "RESUME", songId: p.songId, name: p.name });
  }, [send]);

  // Done (or failed): nothing to come back for anymore.
  useEffect(() => {
    const status = song.data?.status;
    if (pending && (status === "ready" || status === "failed")) setPending(null);
  }, [song.data?.status, pending, setPending]);

  // Entering "transcribing" (after recording, or after a language change) sends the
  // recording to speech-to-text in the current language.
  const { mutateAsync: runTranscribe } = transcribe;
  useEffect(() => {
    if (phase.kind !== "transcribing") return;
    let cancelled = false;
    runTranscribe({ audio: phase.audio, lang })
      .then((r) => !cancelled && send({ type: "TRANSCRIBED", name: r.name }))
      .catch(() => !cancelled && send({ type: "TRANSCRIBE_FAILED" }));
    return () => {
      cancelled = true;
    };
  }, [phase, lang, runTranscribe, send]);

  const stopRecording = useCallback(async () => {
    const audio = await recorder.stop();
    send(audio ? { type: "RECORD_DONE", audio } : { type: "RECORD_CANCEL" });
  }, [recorder, send]);

  const startRecording = useCallback(async () => {
    send({ type: "RECORD_START" });
    const result = await recorder.start(() => void stopRecording());
    if (result !== "started") send({ type: "MIC_UNAVAILABLE" });
  }, [recorder, send, stopRecording]);

  const chooseLanguage = useCallback(
    (code: string) => {
      if (code === lang) return;
      setLang(code);
      send({ type: "LANGUAGE_CHANGED" });
    },
    [lang, setLang, send],
  );

  const editName = useCallback((name: string) => send({ type: "NAME_EDITED", name }), [send]);

  const requestSong = useCallback(
    (name: string, onDone: (songId: string) => void) =>
      // A fresh key per tap; the mutation's own retries reuse it, so a flaky network
      // can never create two jobs for one tap.
      create.mutate(
        { name, lang, idempotencyKey: randomUUID() },
        {
          onSuccess: (s) => {
            // Remember it in case the user leaves before it's ready.
            if (s.status !== "ready") setPending({ songId: s.songId, name });
            onDone(s.songId);
          },
          onError: (e) => send({ type: "SUBMIT_FAILED", message: messageFor(e) }),
        },
      ),
    [create, lang, setPending, send],
  );

  const submit = useCallback(() => {
    if (phase.kind !== "confirm" || !phase.name.trim()) return;
    send({ type: "SUBMIT" });
    requestSong(phase.name.trim(), (id) => send({ type: "SUBMITTED", songId: id }));
  }, [phase, send, requestSong]);

  // "Try again" on a failed song: re-posting re-queues it on the server.
  const retrySong = useCallback(() => {
    if (phase.kind !== "song") return;
    requestSong(phase.name, (id) => send({ type: "SONG_CHANGED", songId: id }));
  }, [phase, requestSong, send]);

  const reset = useCallback(() => {
    setPending(null);
    create.reset();
    send({ type: "RESET" });
  }, [create, setPending, send]);

  return {
    phase,
    languages: list.length ? list : [lang],
    lang,
    song: song.data,
    retrying: create.isPending && phase.kind === "song",
    startRecording,
    stopRecording,
    chooseLanguage,
    editName,
    submit,
    retrySong,
    reset,
  };
}
