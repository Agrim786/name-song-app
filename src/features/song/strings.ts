// Every word on screen, in one place. Headlines stay within two lines at display
// size (about 14 characters a line on a phone).
export const strings = {
  nameTitle: "Say your name.",
  nameLead: "We'll write you a song with it.",
  micStart: "Tap to record",
  listeningTitle: "Listening…",
  listeningLead: "Tap again when you're done.",
  hearingTitle: "One moment.",
  hearingLead: "Catching your name.",

  confirmLead: "Is this right?",
  typeLead: "We didn't catch that. Type your name.",
  micUnavailable: "The mic isn't available. Type your name instead.",
  namePlaceholder: "Your name",
  confirmYes: "Yes, that's me",
  sayAgain: "Say it again",

  languageTitle: "Sing it in…",
  makeSong: "Make my song",
  changeName: (name: string) => `Not ${name}? Change it`,

  startingLead: "Your song is starting.",
  composingLead: "Almost there. Your name is being sung.",
  laterTitle: "Lots of songs being made right now.",
  laterLead: "Come back in a bit. Yours will be waiting here.",
  readyLead: (name: string) => `${name}, this one's yours.`,
  failedTitle: "That one didn't come out.",
  tryAgain: "Try again",
  play: "Play",
  pause: "Pause",
  another: "Make another",

  offline: "No connection. Check your internet and try again.",
  genericError: "Something went wrong. Please try again.",
} as const;
