import { ActivityIndicator, Pressable, StyleSheet } from "react-native";
import { useField } from "./field";
import { Text } from "./Text";
import { radius, space } from "./theme";

interface Props {
  label: string;
  onPress: () => void;
  // solid: the one action on a screen. text: secondary actions, centred under it.
  variant?: "solid" | "text";
  loading?: boolean;
  disabled?: boolean;
}

export function Button({ label, onPress, variant = "solid", loading, disabled }: Props) {
  const f = useField();
  const solid = variant === "solid";
  const inactive = disabled || loading;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: inactive, busy: loading }}
      onPress={onPress}
      disabled={inactive}
      hitSlop={solid ? undefined : 8}
      style={({ pressed }) => [
        // Disabled solid button: a quiet tone step, not a faded (muddy) action colour.
        solid ? [styles.solid, { backgroundColor: disabled ? f.surface : f.action }] : styles.text,
        !solid && inactive && styles.inactive,
        pressed && styles.pressed,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={solid ? f.actionInk : f.ink} />
      ) : (
        <Text variant={solid ? "lead" : "body"} style={[solid && { color: disabled ? f.muted : f.actionInk }, !solid && styles.underline]}>
          {label}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  solid: { minHeight: 60, borderRadius: radius.pill, paddingHorizontal: space(8), alignItems: "center", justifyContent: "center" },
  text: { minHeight: 44, justifyContent: "center", alignSelf: "center" },
  underline: { textDecorationLine: "underline", textAlign: "center" },
  inactive: { opacity: 0.45 },
  // Feedback on press: a small, quick scale (transform only).
  pressed: { transform: [{ scale: 0.97 }] },
});
