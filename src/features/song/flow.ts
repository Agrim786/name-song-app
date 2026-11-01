import type { Recording } from "../../api/names";

// The whole screen is one linear flow, so it is one small state machine. This file
// is pure (no React, no I/O): every transition can be tested without a phone.
//
//   idle -> recording -> transcribing -> confirm -> language -> submitting -> song
//                                          ^  |        |
//                                          |  +-(say it again: back to recording)
//                                          +-----------+ (change name)
//   Mic denied or nothing understood: confirm with an empty name to type.
export type Phase =
  | { kind: "idle" }
  | { kind: "recording" }
  | { kind: "transcribing" }
  // heard = false: we could not catch the name, so the user types it.
  | { kind: "confirm"; name: string; heard: boolean; micUnavailable: boolean }
  | { kind: "language"; name: string; error?: string }
  | { kind: "submitting"; name: string; lang: string }
  | { kind: "song"; songId: string; name: string };

export type FlowEvent =
  | { type: "RECORD_START" }
  | { type: "RECORD_DONE"; audio: Recording }
  | { type: "RECORD_CANCEL" }
  | { type: "MIC_UNAVAILABLE" }
  | { type: "TRANSCRIBED"; name: string | null }
  | { type: "TRANSCRIBE_FAILED" }
  | { type: "NAME_EDITED"; name: string }
  | { type: "NAME_CONFIRMED" }
  | { type: "CHANGE_NAME" }
  | { type: "SUBMIT"; lang: string }
  | { type: "SUBMITTED"; songId: string }
  | { type: "SUBMIT_FAILED"; message: string }
  | { type: "RESUME"; songId: string; name: string }
  // "Try again" after a failed song: the server may answer with a different song.
  | { type: "SONG_CHANGED"; songId: string }
  | { type: "RESET" };

export const initialPhase: Phase = { kind: "idle" };

export function transition(p: Phase, e: FlowEvent): Phase {
  switch (e.type) {
    case "RESET":
      return initialPhase;
    // Reopened app with a song still in line: show it.
    case "RESUME":
      return p.kind === "idle" ? { kind: "song", songId: e.songId, name: e.name } : p;
    case "RECORD_START":
      return p.kind === "idle" || p.kind === "confirm" ? { kind: "recording" } : p;
    // The audio itself is handed to speech-to-text by the caller; the screen only
    // needs to know it is being heard.
    case "RECORD_DONE":
      return p.kind === "recording" ? { kind: "transcribing" } : p;
    case "RECORD_CANCEL":
      return p.kind === "recording" ? initialPhase : p;
    case "MIC_UNAVAILABLE":
      return p.kind === "idle" || p.kind === "recording" ? { kind: "confirm", name: "", heard: false, micUnavailable: true } : p;
    case "TRANSCRIBED":
      return p.kind === "transcribing" ? { kind: "confirm", name: e.name ?? "", heard: e.name !== null, micUnavailable: false } : p;
    case "TRANSCRIBE_FAILED":
      return p.kind === "transcribing" ? { kind: "confirm", name: "", heard: false, micUnavailable: false } : p;
    case "NAME_EDITED":
      return p.kind === "confirm" ? { ...p, name: e.name } : p;
    case "NAME_CONFIRMED":
      return p.kind === "confirm" && p.name.trim() ? { kind: "language", name: p.name.trim() } : p;
    case "CHANGE_NAME":
      return p.kind === "language" ? { kind: "confirm", name: p.name, heard: true, micUnavailable: false } : p;
    case "SUBMIT":
      return p.kind === "language" ? { kind: "submitting", name: p.name, lang: e.lang } : p;
    case "SUBMITTED":
      return p.kind === "submitting" ? { kind: "song", songId: e.songId, name: p.name } : p;
    case "SUBMIT_FAILED":
      return p.kind === "submitting" ? { kind: "language", name: p.name, error: e.message } : p;
    case "SONG_CHANGED":
      return p.kind === "song" ? { ...p, songId: e.songId } : p;
  }
}
