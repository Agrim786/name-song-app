import { Platform } from "react-native";
import { config } from "../config/config";
import { request } from "./client";
import type { LanguagesResponse, TranscribeResponse } from "./types";

export interface Recording {
  uri: string;
  mimeType: string;
}

export const getLanguages = () => request<LanguagesResponse>("/v1/languages");

// The recording is sent once for speech-to-text and never stored by the server.
// No language: the app asks for the name before the song language, so the server
// detects the spoken language itself.
export async function transcribe(audio: Recording): Promise<TranscribeResponse> {
  const form = new FormData();
  if (Platform.OS === "web") {
    // On web the recorder gives a blob: URL; FormData needs the Blob itself.
    form.append("audio", await (await fetch(audio.uri)).blob(), "name.webm");
  } else {
    // React Native's FormData uploads a local file from {uri, name, type}.
    form.append("audio", { uri: audio.uri, name: "name.m4a", type: audio.mimeType } as unknown as Blob);
  }
  return request<TranscribeResponse>("/v1/names/transcribe", { method: "POST", body: form, timeoutMs: config.uploadTimeoutMs });
}
