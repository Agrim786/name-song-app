# Name Song (app)

One screen: pick a language, say your name, get a song with your name in it.
Talks to `../song-backend`. Built to stay light on low-end Android phones and slow networks.

## How it works

1. **Language chips** come from the server (`GET /v1/languages`): every language that has song templates. The last choice is remembered.
2. **Tap the mic, say your name** (auto-stops at 5 s; mono 16 kHz 32 kbps, about 12 KB).
3. **"Did we hear your name right?"** The recording goes to speech-to-text in the chosen language; the user can edit. Changing language re-hears the same recording. Mic denied or not understood: the user types.
4. **Make my song.** The response carries the template's audio URL: the intro **starts playing immediately**. The sung song is the template with the name spliced in, so when it's ready the app switches to it at the same position. If it isn't ready by the name spot, the intro fades and holds there ("Composing your song...").
5. **Long line** (`wait: "later"`): no countdown. "Come back in a bit, yours will be right here." The song id is saved; reopening the app picks it up.

## Structure

```
App.tsx                         providers + the one screen (no navigator needed)
src/
  config/config.ts              API URL + every tunable (record limits, timeouts, hold point)
  api/
    client.ts                   fetch + timeout + device-id header, errors as ApiError
    queryClient.ts              TanStack Query: retries with backoff + jitter, Retry-After, pause polling in background
    names.ts  songs.ts  types.ts
  storage/
    mmkv.ts                     one synchronous store (localStorage on web)
    zustandStorage.ts           MMKV adapter for zustand persist
    deviceId.ts                 random id per install (rate limits are per device, not per IP)
  features/song/
    flow.ts                     the screen's state machine (pure, no React)
    playback.ts                 intro -> hold -> swap-to-song controller (plain class, event driven)
    store/                      flowStore (screen state, in memory) · prefsStore (language + pending song, persisted)
    hooks/                      useSongFlow (orchestrator) · useRecorder · useSongPlayer · useLanguages · useTranscribe · useCreateSong · useSongStatus
    components/                 LanguageChips · MicButton · NameConfirm · SongCard
    screens/SongScreen.tsx      renders the current phase; no logic
    languages.ts  strings.ts    language labels, all on-screen copy
  ui/                           design system: theme tokens · Text · Button · Chip · Screen
```

**State:** screen flow in a zustand store driven only through `transition()` in `flow.ts`; preferences in a persisted zustand store on MMKV; everything from the server in TanStack Query.

## Why it stays light

- Few dependencies: expo-audio, expo-crypto, MMKV, zustand, TanStack Query, safe-area-context. No navigator, no icon fonts, no animation library, no images besides the app icon.
- The playback controller listens to native player events; React re-renders only when the stage changes, not on every position tick.
- The mic pulse runs on the native driver; flat colours, no shadows.
- Android release builds strip unused code and resources (`expo-build-properties`).
- Network: timeouts on every call, a few retries with jittered backoff, polling at the server's pace, paused in the background, one idempotency key per tap so retries never create duplicate songs.

## Run

MMKV is a native module, so this needs a development build, not Expo Go.

```bash
cp .env.example .env              # set EXPO_PUBLIC_API_URL (LAN IP or HTTPS URL, not localhost)
npx expo run:android              # or: npx eas-cli@latest build --profile development
```

The backend's `PUBLIC_BASE_URL` must also be reachable from the phone, because song and template URLs are built from it.

Checks: `npx tsc --noEmit` and `npx expo lint`.

Builds: `npx eas-cli@latest build --profile preview -p android` (APK) · `npx expo export -p web` (web).
