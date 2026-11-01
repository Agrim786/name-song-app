import { StyleSheet, View } from "react-native";
import { Screen } from "../../../ui/Screen";
import { Text } from "../../../ui/Text";
import { space } from "../../../ui/theme";
import { LanguageChips } from "../components/LanguageChips";
import { MicButton } from "../components/MicButton";
import { NameConfirm } from "../components/NameConfirm";
import { SongCard } from "../components/SongCard";
import { useSongFlow } from "../hooks/useSongFlow";
import { useSongPlayer } from "../hooks/useSongPlayer";
import { strings } from "../strings";

// The app's only screen. It renders the current phase; all logic lives in hooks.
export function SongScreen() {
  const flow = useSongFlow();
  const player = useSongPlayer(flow.phase.kind === "song" ? flow.song : undefined);
  const { phase } = flow;

  const languageLocked = phase.kind === "recording" || phase.kind === "transcribing" || phase.kind === "submitting" || phase.kind === "song";

  const another = () => {
    player.stop();
    flow.reset();
  };

  return (
    <Screen>
      <View style={styles.header}>
        <Text variant="title">{strings.title}</Text>
        <Text muted>{strings.subtitle}</Text>
      </View>

      <LanguageChips languages={flow.languages} value={flow.lang} onChange={flow.chooseLanguage} disabled={languageLocked} />

      <View style={styles.main}>
        {(phase.kind === "idle" || phase.kind === "recording" || phase.kind === "transcribing") && (
          <MicButton
            state={phase.kind === "recording" ? "recording" : phase.kind === "transcribing" ? "busy" : "idle"}
            onStart={flow.startRecording}
            onStop={flow.stopRecording}
          />
        )}

        {(phase.kind === "confirm" || phase.kind === "submitting") && (
          <NameConfirm
            name={phase.name}
            heard={phase.kind === "submitting" || phase.heard}
            micUnavailable={phase.audio === null}
            error={phase.kind === "confirm" ? phase.error : undefined}
            submitting={phase.kind === "submitting"}
            onChange={flow.editName}
            onSubmit={flow.submit}
            onReRecord={flow.startRecording}
          />
        )}

        {phase.kind === "song" && (
          <SongCard
            name={phase.name}
            song={flow.song}
            stage={player.stage}
            playing={player.playing}
            retrying={flow.retrying}
            onToggle={player.toggle}
            onRetry={flow.retrySong}
            onAnother={another}
          />
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { gap: space(1) },
  main: { flex: 1, justifyContent: "center" },
});
