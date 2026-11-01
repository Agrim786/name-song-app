import { useEffect, useState } from "react";
import { ActivityIndicator, Animated, Pressable, StyleSheet, View } from "react-native";
import { Text } from "../../../ui/Text";
import { colors, space } from "../../../ui/theme";
import { strings } from "../strings";

interface Props {
  state: "idle" | "recording" | "busy";
  onStart: () => void;
  onStop: () => void;
}

const SIZE = 132;

// Tap to start, tap to stop (auto-stops at 5 s). The pulse runs on the native
// driver, so it stays smooth even when the JS thread is busy on a slow phone.
export function MicButton({ state, onStart, onStop }: Props) {
  // Created once; useState (not useRef) because it is read during render.
  const [pulse] = useState(() => new Animated.Value(0));

  useEffect(() => {
    if (state !== "recording") {
      pulse.setValue(0);
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 700, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [state, pulse]);

  const recording = state === "recording";
  const label = state === "busy" ? strings.transcribing : recording ? strings.micRecording : strings.micIdle;

  return (
    <View style={styles.wrap}>
      <Animated.View style={[styles.halo, { opacity: pulse.interpolate({ inputRange: [0, 1], outputRange: [0, 0.35] }), transform: [{ scale: pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.25] }) }] }]} />
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label}
        disabled={state === "busy"}
        onPress={recording ? onStop : onStart}
        style={({ pressed }) => [styles.button, recording && styles.recording, pressed && styles.pressed]}
      >
        {state === "busy" ? <ActivityIndicator color={colors.onPrimary} size="large" /> : <View style={recording ? styles.stopIcon : styles.micIcon} />}
      </Pressable>
      <Text variant="body" style={styles.label}>
        {label}
      </Text>
      {state === "idle" && (
        <Text variant="caption" muted>
          {strings.micHint}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: "center", gap: space(3) },
  halo: { position: "absolute", top: 0, width: SIZE, height: SIZE, borderRadius: SIZE / 2, backgroundColor: colors.recording },
  button: { width: SIZE, height: SIZE, borderRadius: SIZE / 2, backgroundColor: colors.primary, alignItems: "center", justifyContent: "center" },
  recording: { backgroundColor: colors.recording },
  pressed: { opacity: 0.85 },
  // Simple shapes instead of an icon font: no extra download, no font loading.
  micIcon: { width: 28, height: 44, borderRadius: 14, backgroundColor: colors.onPrimary },
  stopIcon: { width: 34, height: 34, borderRadius: 6, backgroundColor: colors.onPrimary },
  label: { marginTop: space(2), textAlign: "center" },
});
