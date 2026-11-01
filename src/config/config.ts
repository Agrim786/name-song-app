// Every tunable in one place. EXPO_PUBLIC_ vars are inlined at build time.
const apiUrl = process.env.EXPO_PUBLIC_API_URL;
if (!apiUrl && __DEV__) console.warn("EXPO_PUBLIC_API_URL is not set; using http://localhost:8080");

export const config = {
  apiUrl: (apiUrl ?? "http://localhost:8080").replace(/\/$/, ""),

  // A name is 1-3 s of speech. 5 s caps upload size on slow networks.
  maxRecordMs: 5000,
  // Shorter than this is an accidental tap, not a recording.
  minRecordMs: 400,

  requestTimeoutMs: 15_000,
  uploadTimeoutMs: 20_000,

  // The song is identical to the template until just before the name spot, so the
  // intro may play up to this many ms before nameAtMs. If the song is not ready by
  // then, the intro fades out and holds there.
  holdBeforeNameMs: 500,
  fadeOutMs: 400,

  // Used only if the server sends no pollAfterSeconds.
  defaultPollSeconds: 3,
} as const;
