// Every word on screen, in one place, so copy changes and translation stay simple.
export const strings = {
  title: "Your Name Song",
  subtitle: "Say your name. Get a song with it.",
  pickLanguage: "Song language",

  micIdle: "Tap and say your name",
  micRecording: "Listening... tap to stop",
  micHint: "Up to 5 seconds",
  transcribing: "Catching your name...",

  confirmHeard: "Did we hear your name right?",
  confirmTyping: "Type your name",
  micUnavailable: "We couldn't use the mic. Type your name instead.",
  namePlaceholder: "Your name",
  reRecord: "Record again",
  makeSong: "Make my song",
  making: "Starting your song...",

  composing: "Composing your song...",
  later: "Lots of people are making songs right now. Come back in a bit, yours will be right here.",
  ready: (name: string) => `${name}, this one's for you`,
  failed: "Something went wrong with your song.",
  tryAgain: "Try again",
  play: "Play",
  pause: "Pause",
  another: "Make another",

  offline: "No connection. Check your internet and try again.",
  genericError: "Something went wrong. Please try again.",
} as const;
