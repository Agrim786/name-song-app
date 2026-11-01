import { Text as RNText, type TextProps } from "react-native";
import { colors, typography } from "./theme";

interface Props extends TextProps {
  variant?: keyof typeof typography;
  muted?: boolean;
  color?: string;
}

export function Text({ variant = "body", muted, color, style, ...rest }: Props) {
  return <RNText {...rest} style={[typography[variant], { color: color ?? (muted ? colors.muted : colors.text) }, style]} />;
}
