import { File } from "expo-file-system";
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
export async function transcribe(
  audio: Recording,
): Promise<TranscribeResponse> {
  const form = new FormData();
  if (Platform.OS === "web") {
    // On web the recorder gives a blob: URL; FormData needs the Blob itself.
    form.append("audio", await (await fetch(audio.uri)).blob(), "name.webm");
  } else {
    // Expo's fetch only uploads parts that are text, a Blob, or have bytes(). The
    // classic React Native {uri, name, type} object fails before sending ("Unsupported
    // FormDataPart implementation"), which silently broke speech-to-text on phones.
    // So: the recording as an expo-file-system File, with an explicit name and type.
    const file = new File(audio.uri);
    form.append("audio", {
      name: "name.m4a",
      type: audio.mimeType,
      bytes: () => file.bytes(),
    } as unknown as Blob);
  }
  return request<TranscribeResponse>("/v1/names/transcribe", {
    method: "POST",
    body: form,
    timeoutMs: config.uploadTimeoutMs,
  });
}
