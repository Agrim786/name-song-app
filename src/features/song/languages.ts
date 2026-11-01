// How each language the server offers is shown: its own name in its own script
// (what users look for), with the English name under it.
const LABELS: Record<string, { native: string; english: string }> = {
  hi: { native: "हिन्दी", english: "Hindi" },
  bn: { native: "বাংলা", english: "Bengali" },
  mr: { native: "मराठी", english: "Marathi" },
  te: { native: "తెలుగు", english: "Telugu" },
  ta: { native: "தமிழ்", english: "Tamil" },
  gu: { native: "ગુજરાતી", english: "Gujarati" },
  kn: { native: "ಕನ್ನಡ", english: "Kannada" },
  ml: { native: "മലയാളം", english: "Malayalam" },
  pa: { native: "ਪੰਜਾਬੀ", english: "Punjabi" },
  en: { native: "English", english: "English" },
};

// The order users expect: Hindi first, then by number of speakers.
const ORDER = Object.keys(LABELS);

export const languageLabel = (code: string) =>
  LABELS[code] ?? { native: code.toUpperCase(), english: code.toUpperCase() };

export const sortLanguages = (codes: string[]) =>
  [...codes].sort(
    (a, b) => (ORDER.indexOf(a) + 1 || 99) - (ORDER.indexOf(b) + 1 || 99),
  );
