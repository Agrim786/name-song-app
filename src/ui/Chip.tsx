import { Pressable, StyleSheet } from "react-native";
import { Text } from "./Text";
import { colors, radius, space } from "./theme";

interface Props {
  label: string;
  selected: boolean;
  onPress: () => void;
  disabled?: boolean;
}

export function Chip({ label, selected, onPress, disabled }: Props) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ selected, disabled }}
      onPress={onPress}
      disabled={disabled}
      style={[styles.chip, selected && styles.selected, disabled && !selected && styles.dim]}
    >
      <Text variant="body" color={selected ? colors.onPrimary : colors.text}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: { paddingVertical: space(2), paddingHorizontal: space(4), borderRadius: radius.pill, borderWidth: 1, borderColor: colors.border },
  selected: { backgroundColor: colors.primary, borderColor: colors.primary },
  dim: { opacity: 0.5 },
});
