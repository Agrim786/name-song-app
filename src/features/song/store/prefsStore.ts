import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { zustandStorage } from "../../../storage/zustandStorage";

// What survives an app restart. MMKV is synchronous, so this is ready on the
// first render with no loading flash.
interface PrefsState {
  // Last language picked: most people make songs in one language.
  lang: string | null;
  // A song that was still in line when the app closed ("come back in a bit").
  pending: { songId: string; name: string } | null;
  setLang: (lang: string) => void;
  setPending: (pending: PrefsState["pending"]) => void;
}

export const usePrefsStore = create<PrefsState>()(
  persist(
    (set) => ({
      lang: null,
      pending: null,
      setLang: (lang) => set({ lang }),
      setPending: (pending) => set({ pending }),
    }),
    { name: "prefs", storage: createJSONStorage(() => zustandStorage), version: 1 },
  ),
);
