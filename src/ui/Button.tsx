import { ActivityIndicator, Pressable, StyleSheet } from "react-native";
import { Text } from "./Text";
import { colors, radius, space } from "./theme";

interface Props {
  label: string;
  onPress: () => void;
  variant?: "primary" | "ghost";
  loading?: boolean;
  disabled?: boolean;
}

export function Button({ label, onPress, variant = "primary", loading, disabled }: Props) {
  const primary = variant === "primary";
  const inactive = disabled || loading;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: inactive, busy: loading }}
      onPress={onPress}
      disabled={inactive}
      style={({ pressed }) => [styles.base, primary ? styles.primary : styles.ghost, (pressed || inactive) && styles.dim]}
    >
      {loading ? (
        <ActivityIndicator color={primary ? colors.onPrimary : colors.text} />
      ) : (
        <Text variant="body" style={styles.label} color={primary ? colors.onPrimary : colors.text}>
          {label}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: { minHeight: 52, borderRadius: radius.pill, paddingHorizontal: space(6), alignItems: "center", justifyContent: "center" },
  primary: { backgroundColor: colors.primary },
  ghost: { borderWidth: 1, borderColor: colors.border },
  dim: { opacity: 0.6 },
  label: { fontWeight: "600" },
});
