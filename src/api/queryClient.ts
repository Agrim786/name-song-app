import { QueryClient, focusManager } from "@tanstack/react-query";
import { AppState, Platform } from "react-native";
import { ApiError, isRetryable } from "./client";

// Exponential backoff with jitter, so thousands of phones retrying after a blip do
// not hit the server in the same instant. Honours the server's Retry-After.
const retryDelay = (attempt: number, error: unknown) => {
  if (error instanceof ApiError && error.retryAfterMs)
    return error.retryAfterMs;
  const base = Math.min(1000 * 2 ** attempt, 8000);
  return base / 2 + Math.random() * (base / 2);
};

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (count, error) => count < 3 && isRetryable(error),
      retryDelay,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: (count, error) => count < 2 && isRetryable(error),
      retryDelay,
    },
  },
});

// React Native has no window focus: map app foreground/background onto it, so
// polling pauses in the background and resumes (with a fresh fetch) on return.
if (Platform.OS !== "web") {
  focusManager.setEventListener((setFocused) => {
    const sub = AppState.addEventListener("change", (s) =>
      setFocused(s === "active"),
    );
    return () => sub.remove();
  });
}
