import { StyleSheet, View } from "react-native";
import { Rise } from "../../../ui/Rise";
import { Text } from "../../../ui/Text";
import { space } from "../../../ui/theme";
import { strings } from "../strings";
import { MicButton } from "./MicButton";
import { RecordTimer } from "./RecordTimer";

interface Props {
  state: "idle" | "recording" | "busy";
  onStart: () => void;
  onStop: () => void;
}

// The headline asks; the big disc, centred in the rest of the screen, answers.
export function NameStep({ state, onStart, onStop }: Props) {
  const title = state === "recording" ? strings.listeningTitle : state === "busy" ? strings.hearingTitle : strings.nameTitle;
  const lead = state === "recording" ? strings.listeningLead : state === "busy" ? strings.hearingLead : strings.nameLead;
  return (
    <View style={styles.fill}>
      <Rise key={title}>
        <Text variant="display" accessibilityRole="header">
          {title}
        </Text>
        <Text variant="lead" muted style={styles.lead}>
          {lead}
        </Text>
      </Rise>
      <Rise delay={80} style={styles.center}>
        <MicButton state={state} label={state === "recording" ? strings.listeningLead : strings.micStart} onPress={state === "recording" ? onStop : onStart} />
        <View style={styles.under}>
          {state === "idle" && <Text muted>{strings.micStart}</Text>}
          {state === "recording" && <RecordTimer />}
        </View>
      </Rise>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  lead: { marginTop: space(3) },
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: space(6) },
  // Fixed height so the disc never jumps when the line under it changes.
  under: { height: 32, justifyContent: "center" },
});
