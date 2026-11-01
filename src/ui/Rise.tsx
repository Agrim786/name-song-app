import { type ReactNode, useEffect, useState } from "react";
import {
  AccessibilityInfo,
  Animated,
  type StyleProp,
  type ViewStyle,
} from "react-native";

// Entrance: rises 20px while fading in, after `delay` ms, once. Transform and
// opacity only, on the native driver, so it stays smooth on slow phones. With
// "reduce motion" on, content simply appears.
export function Rise({
  delay = 0,
  children,
  style,
}: {
  delay?: number;
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  const [progress] = useState(() => new Animated.Value(0));

  useEffect(() => {
    let cancelled = false;
    void AccessibilityInfo.isReduceMotionEnabled().then((reduce) => {
      if (cancelled) return;
      if (reduce) return progress.setValue(1);
      Animated.timing(progress, {
        toValue: 1,
        duration: 420,
        delay,
        useNativeDriver: true,
      }).start();
    });
    return () => {
      cancelled = true;
    };
  }, [progress, delay]);

  return (
    <Animated.View
      style={[
        style,
        {
          opacity: progress,
          transform: [
            {
              translateY: progress.interpolate({
                inputRange: [0, 1],
                outputRange: [20, 0],
              }),
            },
          ],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
}
