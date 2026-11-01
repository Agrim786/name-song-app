import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Pressable,
  StyleSheet,
  View,
} from "react-native";
import { useField } from "../../../ui/field";

interface Props {
  state: "idle" | "recording" | "busy";
  label: string;
  onPress: () => void;
}

const SIZE = 148;

// A filled black disc with a mic shape; while recording it turns red with a stop
// square and a breathing ring (the one place the app uses colour). Shapes, not an icon font: nothing to download.
export function MicButton({ state, label, onPress }: Props) {
  const f = useField();
  const [pulse] = useState(() => new Animated.Value(0));

  useEffect(() => {
    if (state !== "recording") {
      pulse.setValue(0);
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [state, pulse]);

  return (
    <View style={styles.wrap}>
      <Animated.View
        style={[
          styles.ring,
          {
            backgroundColor: f.record,
            opacity: pulse.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 0.18],
            }),
          },
          {
            transform: [
              {
                scale: pulse.interpolate({
                  inputRange: [0, 1],
                  outputRange: [1, 1.3],
                }),
              },
            ],
          },
        ]}
      />
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityState={{ busy: state === "busy" }}
        disabled={state === "busy"}
        onPress={onPress}
        style={({ pressed }) => [
          styles.disc,
          { backgroundColor: state === "recording" ? f.record : f.ink },
          pressed && styles.pressed,
        ]}
      >
        {state === "busy" ? (
          <ActivityIndicator size="large" color={f.bg} />
        ) : state === "recording" ? (
          <View style={[styles.stop, { backgroundColor: f.bg }]} />
        ) : (
          <View style={styles.mic}>
            <View style={[styles.micCradle, { borderColor: f.bg }]} />
            <View style={[styles.micHead, { backgroundColor: f.bg }]} />
            <View style={[styles.micStem, { backgroundColor: f.bg }]} />
            <View style={[styles.micBase, { backgroundColor: f.bg }]} />
          </View>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: SIZE,
    height: SIZE,
    alignItems: "center",
    justifyContent: "center",
  },
  ring: {
    position: "absolute",
    width: SIZE,
    height: SIZE,
    borderRadius: SIZE / 2,
  },
  disc: {
    width: SIZE,
    height: SIZE,
    borderRadius: SIZE / 2,
    alignItems: "center",
    justifyContent: "center",
  },
  pressed: { transform: [{ scale: 0.96 }] },
  // A studio mic drawn from plain shapes: capsule, U-shaped holder, stem, base.
  // (The holder's border is the icon's stroke, not a divider.)
  mic: { width: 52, height: 78 },
  micHead: {
    position: "absolute",
    top: 0,
    left: 11,
    width: 30,
    height: 46,
    borderRadius: 15,
  },
  micCradle: {
    position: "absolute",
    top: 22,
    left: 2,
    width: 48,
    height: 34,
    borderWidth: 5,
    borderTopWidth: 0,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  micStem: { position: "absolute", top: 55, left: 23.5, width: 5, height: 13 },
  micBase: {
    position: "absolute",
    top: 67,
    left: 12,
    width: 28,
    height: 5,
    borderRadius: 3,
  },
  stop: { width: 38, height: 38, borderRadius: 6 },
});
