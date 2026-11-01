import {
  AudioQuality,
  IOSOutputFormat,
  type RecordingOptions,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
  useAudioRecorder,
} from "expo-audio";
import { useCallback, useEffect, useRef } from "react";
import { Platform } from "react-native";
import type { Recording } from "../../../api/names";
import { config } from "../../../config/config";

// Speech, not music: mono, 16 kHz, 32 kbps AAC. A 3 s name is ~12 KB, so the
// upload is quick even on a weak 2G/3G connection.
const NAME_RECORDING: RecordingOptions = {
  extension: ".m4a",
  sampleRate: 16_000,
  numberOfChannels: 1,
  bitRate: 32_000,
  android: { outputFormat: "mpeg4", audioEncoder: "aac" },
  ios: { outputFormat: IOSOutputFormat.MPEG4AAC, audioQuality: AudioQuality.MEDIUM },
  web: { mimeType: "audio/webm", bitsPerSecond: 32_000 },
};

export type StartResult = "started" | "denied" | "failed";

export function useRecorder() {
  const recorder = useAudioRecorder(NAME_RECORDING);
  const startedAt = useRef(0);
  const limitTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearLimit = () => {
    if (limitTimer.current) clearTimeout(limitTimer.current);
    limitTimer.current = null;
  };

  // onLimit fires when the recording hits maxRecordMs, so the caller can stop it.
  const start = useCallback(
    async (onLimit: () => void): Promise<StartResult> => {
      try {
        const perm = await requestRecordingPermissionsAsync();
        if (!perm.granted) return "denied";
        await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true });
        await recorder.prepareToRecordAsync();
        recorder.record();
        startedAt.current = Date.now();
        limitTimer.current = setTimeout(onLimit, config.maxRecordMs);
        return "started";
      } catch {
        return "failed";
      }
    },
    [recorder],
  );

  // Returns null for an accidental tap (too short) or a failed recording.
  const stop = useCallback(async (): Promise<Recording | null> => {
    clearLimit();
    try {
      if (!recorder.isRecording) return null;
      await recorder.stop();
      // Back to playback mode, so iOS plays the song through the speaker.
      await setAudioModeAsync({ allowsRecording: false, playsInSilentMode: true });
      if (Date.now() - startedAt.current < config.minRecordMs || !recorder.uri) return null;
      return { uri: recorder.uri, mimeType: Platform.OS === "web" ? "audio/webm" : "audio/mp4" };
    } catch {
      return null;
    }
  }, [recorder]);

  // Never leave the mic on if the screen goes away mid-recording.
  useEffect(
    () => () => {
      clearLimit();
      if (recorder.isRecording) void recorder.stop().catch(() => undefined);
    },
    [recorder],
  );

  return { start, stop };
}
