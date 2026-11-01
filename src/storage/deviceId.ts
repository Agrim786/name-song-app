import { randomUUID } from "expo-crypto";
import { storage } from "./mmkv";

const KEY = "deviceId";

// A random id made once per install. The backend rate-limits per device rather
// than per IP, because many Indian mobile users share one carrier IP.
// It identifies an install, not a person, and holds no personal data.
export function getDeviceId(): string {
  let id = storage.getString(KEY);
  if (!id) {
    id = randomUUID();
    storage.set(KEY, id);
  }
  return id;
}
