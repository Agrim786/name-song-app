// Design tokens. Components read from here, never hard-code colours or sizes.
// Flat colours, no shadows or blur: cheap to draw on low-end GPUs.
export const colors = {
  bg: "#14101F",
  surface: "#1F1930",
  border: "#2E2645",
  text: "#F5F1FF",
  muted: "#A79FC0",
  primary: "#FF6B4A",
  onPrimary: "#1A0E0A",
  recording: "#FF3B5C",
  danger: "#FF8A8A",
} as const;

export const space = (n: number) => n * 4;

export const radius = { sm: 8, md: 14, lg: 24, pill: 999 } as const;

export const typography = {
  title: { fontSize: 28, fontWeight: "700", lineHeight: 34 },
  heading: { fontSize: 20, fontWeight: "600", lineHeight: 26 },
  body: { fontSize: 16, fontWeight: "400", lineHeight: 22 },
  caption: { fontSize: 13, fontWeight: "400", lineHeight: 18 },
} as const;
