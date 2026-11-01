import type { Recording } from "../../api/names";

// The whole screen is one linear flow, so it is one small state machine. This file
// is pure (no React, no I/O): every transition can be tested without a phone.
//
//   idle -> recording -> transcribing -> confirm -> submitting -> song
//                                ^            |
//            (language changed) -+            +-> (edit name, re-record)
//   Mic denied or speech-to-text failed: straight to confirm with an empty name.
export type Phase =
  | { kind: "idle" }
  | { kind: "recording" }
  | { kind: "transcribing"; audio: Recording }
  // heard = false: we could not catch the name, so the user types it.
  | { kind: "confirm"; audio: Recording | null; name: string; heard: boolean; error?: string }
  | { kind: "submitting"; audio: Recording | null; name: string }
  | { kind: "song"; songId: string; name: string };

export type FlowEvent =
  | { type: "RECORD_START" }
  | { type: "RECORD_DONE"; audio: Recording }
  | { type: "RECORD_CANCEL" }
  | { type: "MIC_UNAVAILABLE" }
  | { type: "TRANSCRIBED"; name: string | null }
  | { type: "TRANSCRIBE_FAILED" }
  | { type: "LANGUAGE_CHANGED" }
  | { type: "NAME_EDITED"; name: string }
  | { type: "SUBMIT" }
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
    case "RECORD_DONE":
      return p.kind === "recording" ? { kind: "transcribing", audio: e.audio } : p;
    case "RECORD_CANCEL":
      return p.kind === "recording" ? initialPhase : p;
    case "MIC_UNAVAILABLE":
      return p.kind === "idle" || p.kind === "recording" ? { kind: "confirm", audio: null, name: "", heard: false } : p;
    case "TRANSCRIBED":
      return p.kind === "transcribing" ? { kind: "confirm", audio: p.audio, name: e.name ?? "", heard: e.name !== null } : p;
    case "TRANSCRIBE_FAILED":
      return p.kind === "transcribing" ? { kind: "confirm", audio: p.audio, name: "", heard: false } : p;
    // Same recording, new language: hear it again so the name comes back in that
    // language's script (which is what the singer pronounces correctly).
    case "LANGUAGE_CHANGED":
      return p.kind === "confirm" && p.audio ? { kind: "transcribing", audio: p.audio } : p;
    case "NAME_EDITED":
      return p.kind === "confirm" ? { ...p, name: e.name, error: undefined } : p;
    case "SUBMIT":
      return p.kind === "confirm" && p.name.trim() ? { kind: "submitting", audio: p.audio, name: p.name.trim() } : p;
    case "SUBMITTED":
      return p.kind === "submitting" ? { kind: "song", songId: e.songId, name: p.name } : p;
    case "SONG_CHANGED":
      return p.kind === "song" ? { ...p, songId: e.songId } : p;
    case "SUBMIT_FAILED":
      return p.kind === "submitting" ? { kind: "confirm", audio: p.audio, name: p.name, heard: true, error: e.message } : p;
  }
}
