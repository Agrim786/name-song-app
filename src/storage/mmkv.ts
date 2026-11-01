import { createMMKV } from "react-native-mmkv";

// One synchronous key-value store for the whole app (falls back to localStorage on
// web). Synchronous reads mean persisted state is ready on the first render.
export const storage = createMMKV({ id: "name-song" });
