import { useEffect, useState } from "react";
import { config } from "../../../config/config";
import { Text } from "../../../ui/Text";

const clock = (ms: number) => `0:${String(Math.min(Math.floor(ms / 1000), 59)).padStart(2, "0")}`;

// "0:02 of 0:05" while the mic is open, so the 5-second limit is never a surprise.
// Mounted only while recording, so it starts from zero each time.
export function RecordTimer() {
  const [startedAt] = useState(() => Date.now());
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setElapsed(Math.min(Date.now() - startedAt, config.maxRecordMs)), 250);
    return () => clearInterval(id);
  }, [startedAt]);

  return (
    <Text variant="lead" style={{ fontVariant: ["tabular-nums"] }} accessibilityLiveRegion="polite">
      {clock(elapsed)} of {clock(config.maxRecordMs)}
    </Text>
  );
}
