import { useMutation } from "@tanstack/react-query";
import { type Recording, transcribe } from "../../../api/names";

// One retry only: speech-to-text has a tight budget, and typing is a fine fallback.
export const useTranscribe = () =>
  useMutation({
    mutationFn: ({ audio, lang }: { audio: Recording; lang: string }) => transcribe(audio, lang),
    retry: 1,
  });
