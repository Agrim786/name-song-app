// Design tokens. Components read from here; no raw colours elsewhere.
//
// One white ground for the whole app, black ink, a light grey one tone step up
// for filled surfaces. The only colour is red, and only while the mic is open.
// No gradients, shadows or outlines: surfaces differ by one tone step.
// Contrast checked: ink 18:1, muted 6.7:1 on white.
export interface Field {
  bg: string;
  ink: string; // text and the strongest marks
  muted: string; // secondary text, still >= 4.5:1 on bg
  surface: string; // one tone step from bg: filled rows, the name field
  placeholder: string; // hint text in an empty field: clearly fainter than typed text
  action: string; // the one solid button
  actionInk: string;
  record: string; // the mic button while recording
  statusBar: "light" | "dark";
}

export const paper: Field = {
  bg: "#FFFFFF",
  ink: "#111111",
  muted: "#5C5C5C",
  surface: "#F2F2F2",
  placeholder: "#11111159",
  action: "#111111",
  actionInk: "#FFFFFF",
  record: "#D7261E",
  statusBar: "dark",
};

export const space = (n: number) => n * 4;

// Five sizes at most, far apart. One system typeface: no font download, and
// Android's system font covers every Indian script the songs use.
export const type = {
  display: { fontSize: 52, lineHeight: 54, letterSpacing: -1.6, fontWeight: "600" },
  // The sung line: longer than a headline, so one step down to stay within ~2 lines.
  title: { fontSize: 38, lineHeight: 44, letterSpacing: -0.9, fontWeight: "600" },
  lead: { fontSize: 22, lineHeight: 28, letterSpacing: -0.3, fontWeight: "500" },
  body: { fontSize: 17, lineHeight: 25, letterSpacing: 0, fontWeight: "400" },
  small: { fontSize: 14, lineHeight: 20, letterSpacing: 0, fontWeight: "400" },
} as const;

// Buttons are fully round, decided once.
export const radius = { pill: 999, field: 20 } as const;
