import { Text as RNText, type TextProps } from "react-native";
import { useField } from "./field";
import { type } from "./theme";

interface Props extends TextProps {
  variant?: keyof typeof type;
  muted?: boolean;
}

export function Text({ variant = "body", muted, style, ...rest }: Props) {
  const f = useField();
  return <RNText {...rest} style={[type[variant], { color: muted ? f.muted : f.ink }, style]} />;
}
