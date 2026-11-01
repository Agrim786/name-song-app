import { ActivityIndicator, StyleSheet, View } from "react-native";
import type { SongView } from "../../../api/types";
import { Button } from "../../../ui/Button";
import { Text } from "../../../ui/Text";
import { colors, radius, space } from "../../../ui/theme";
import type { PlayerStage } from "../hooks/useSongPlayer";
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

// What the user sees after "Make my song". Never a long countdown: either the
// music is already playing, or a short honest message.
export function SongCard({ name, song, stage, playing, retrying, onToggle, onRetry, onAnother }: Props) {
  const failed = song?.status === "failed";
  const later = !failed && song?.status !== "ready" && song?.wait === "later";
  const composing = !failed && !later && stage !== "song";

  return (
    <View style={styles.card}>
      <Text variant="heading" style={styles.center}>
        {failed ? strings.failed : later ? strings.later : stage === "song" ? strings.ready(name) : strings.composing}
      </Text>

      {composing && <ActivityIndicator color={colors.primary} />}

      {stage === "song" && <Button label={playing ? strings.pause : strings.play} onPress={onToggle} />}
      {failed && <Button label={strings.tryAgain} onPress={onRetry} loading={retrying} />}

      <Button label={strings.another} onPress={onAnother} variant="ghost" />
    </View>
  );
}

const styles = StyleSheet.create({
  card: { gap: space(4), padding: space(5), borderRadius: radius.lg, backgroundColor: colors.surface },
  center: { textAlign: "center" },
});
