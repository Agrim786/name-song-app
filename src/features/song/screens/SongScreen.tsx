import { Screen } from "../../../ui/Screen";
import { ConfirmStep } from "../components/ConfirmStep";
import { LanguageStep } from "../components/LanguageStep";
import { NameStep } from "../components/NameStep";
import { SongStep } from "../components/SongStep";
import { useSongFlow } from "../hooks/useSongFlow";
import { useSongPlayer } from "../hooks/useSongPlayer";

// The app's only screen. It renders the current phase; all logic lives in hooks.
export function SongScreen() {
  const flow = useSongFlow();
  const player = useSongPlayer(
    flow.phase.kind === "song" ? flow.song : undefined,
  );
  const { phase } = flow;

  const another = () => {
    player.stop();
    flow.reset();
  };

  return (
    <Screen>
      {(phase.kind === "idle" ||
        phase.kind === "recording" ||
        phase.kind === "transcribing") && (
        <NameStep
          state={
            phase.kind === "recording"
              ? "recording"
              : phase.kind === "transcribing"
                ? "busy"
                : "idle"
          }
          onStart={flow.startRecording}
          onStop={flow.stopRecording}
        />
      )}

      {phase.kind === "confirm" && (
        <ConfirmStep
          name={phase.name}
          heard={phase.heard}
          micUnavailable={phase.micUnavailable}
          onChange={flow.editName}
          onConfirm={flow.confirmName}
          onSayAgain={flow.startRecording}
        />
      )}

      {(phase.kind === "language" || phase.kind === "submitting") && (
        <LanguageStep
          name={phase.name}
          languages={flow.languages}
          initial={phase.kind === "submitting" ? phase.lang : flow.lang}
          submitting={phase.kind === "submitting"}
          error={phase.kind === "language" ? phase.error : undefined}
          onSubmit={flow.submit}
          onChangeName={flow.changeName}
        />
      )}

      {phase.kind === "song" && (
        <SongStep
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
    </Screen>
  );
}
