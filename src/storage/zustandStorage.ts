import type { StateStorage } from "zustand/middleware";
import { storage } from "./mmkv";

// Adapter so zustand's persist middleware writes to MMKV.
export const zustandStorage: StateStorage = {
  getItem: (name) => storage.getString(name) ?? null,
  setItem: (name, value) => storage.set(name, value),
  removeItem: (name) => {
    storage.remove(name);
  },
};
