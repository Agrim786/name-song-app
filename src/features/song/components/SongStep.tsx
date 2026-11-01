import { StyleSheet, View } from "react-native";
import type { SongView } from "../../../api/types";
import { Button } from "../../../ui/Button";
import { Rise } from "../../../ui/Rise";
import { Text } from "../../../ui/Text";
import { space } from "../../../ui/theme";
import type { PlayerStage } from "../playback";
import { strings } from "../strings";

interface Props {
  name: string;
  song: SongView | undefined;
  stage: PlayerStage;
  playing: boolean;
  retrying: boolean;
  onToggle: () => void;
  onRetry: () => void;
  onAnother: () => void;
}

// The sung line, with the user's name in it, is this screen's title.
// Never a countdown: either the music is playing, or one honest sentence.
export function SongStep({
  name: typedName,
  song,
  stage,
  playing,
  retrying,
  onToggle,
  onRetry,
  onAnother,
}: Props) {
  // The server's cleaned-up name ("Priya"), so it reads the same as in the lyric.
  const name = song?.name ?? typedName;
  const failed = song?.status === "failed";
  const later = !failed && song?.status !== "ready" && song?.wait === "later";
  const ready = stage === "song";

  const title = failed
    ? strings.failedTitle
    : later
      ? strings.laterTitle
      : (song?.lyric ?? name);
  const lead = failed
    ? undefined
    : later
      ? strings.laterLead
      : ready
        ? strings.readyLead(name)
        : stage === "holding"
          ? strings.composingLead
          : strings.startingLead;

  return (
    <View style={styles.fill}>
      <Rise key={title}>
        <Text
          variant={failed || later ? "display" : "title"}
          accessibilityRole="header"
        >
          {title}
        </Text>
        {lead && (
          <Text variant="lead" muted style={styles.lead}>
            {lead}
          </Text>
        )}
      </Rise>

      <Rise delay={80} style={styles.actions}>
        {ready && (
          <Button
            label={playing ? strings.pause : strings.play}
            onPress={onToggle}
          />
        )}
        {/* Before the song lands the bar above already shows progress; keep the
            button's space so nothing jumps when Play appears. */}
        {!ready && !later && !failed && <View style={styles.waiting} />}
        {failed && (
          <Button
            label={strings.tryAgain}
            onPress={onRetry}
            loading={retrying}
          />
        )}
        <Button label={strings.another} onPress={onAnother} variant="text" />
      </Rise>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1, justifyContent: "space-between" },
  lead: { marginTop: space(4) },
  actions: { gap: space(3) },
  // Same height as the button it turns into, so nothing jumps when the song lands.
  waiting: { height: 60 },
});
