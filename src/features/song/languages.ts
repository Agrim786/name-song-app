// How each language the server offers is shown in the picker: its own name in its
// own script, which is what users look for. Unknown codes fall back to the code.
const LABELS: Record<string, string> = {
  hi: "हिन्दी",
  mr: "मराठी",
  gu: "ગુજરાતી",
  pa: "ਪੰਜਾਬੀ",
  bn: "বাংলা",
  ta: "தமிழ்",
  te: "తెలుగు",
  kn: "ಕನ್ನಡ",
  ml: "മലയാളം",
  en: "English",
};

// The order users expect: Hindi first, then by number of speakers.
const ORDER = ["hi", "bn", "mr", "te", "ta", "gu", "kn", "ml", "pa", "en"];

export const languageLabel = (code: string) => LABELS[code] ?? code.toUpperCase();

export const sortLanguages = (codes: string[]) =>
  [...codes].sort((a, b) => (ORDER.indexOf(a) + 1 || 99) - (ORDER.indexOf(b) + 1 || 99));
