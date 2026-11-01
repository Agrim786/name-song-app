import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { Button } from "../../../ui/Button";
import { useField } from "../../../ui/field";
import { Rise } from "../../../ui/Rise";
import { Text } from "../../../ui/Text";
import { radius, space } from "../../../ui/theme";
import { languageLabel } from "../languages";
import { strings } from "../strings";

interface Props {
  name: string;
  languages: string[];
  initial: string;
  submitting: boolean;
  error?: string;
  onSubmit: (lang: string) => void;
  onChangeName: () => void;
}

// Each language as a large row in its own script; the chosen one is inverted
// (ink ground, field-coloured text). No outlines, no radio dots.
export function LanguageStep({
  name,
  languages,
  initial,
  submitting,
  error,
  onSubmit,
  onChangeName,
}: Props) {
  const f = useField();
  const [lang, setLang] = useState(
    languages.includes(initial) ? initial : (languages[0] ?? initial),
  );

  return (
    <View style={styles.fill}>
      <Rise>
        <Text variant="display" accessibilityRole="header">
          {strings.languageTitle}
        </Text>
      </Rise>
      <ScrollView
        style={styles.list}
        contentContainerStyle={styles.listInner}
        accessibilityRole="radiogroup"
      >
        {languages.map((code, i) => {
          const selected = code === lang;
          const label = languageLabel(code);
          return (
            <Rise key={code} delay={60 + i * 50}>
              <Pressable
                accessibilityRole="radio"
                accessibilityState={{ selected }}
                accessibilityLabel={label.english}
                disabled={submitting}
                onPress={() => setLang(code)}
                style={({ pressed }) => [
                  styles.row,
                  { backgroundColor: selected ? f.ink : f.surface },
                  pressed && styles.pressed,
                ]}
              >
                <Text variant="lead" style={selected && { color: f.bg }}>
                  {label.native}
                </Text>
                {label.english !== label.native && (
                  <Text
                    variant="small"
                    style={{ color: selected ? f.bg : f.muted }}
                  >
                    {label.english}
                  </Text>
                )}
              </Pressable>
            </Rise>
          );
        })}
      </ScrollView>
      <View style={styles.actions}>
        {error && <Text muted>{error}</Text>}
        <Button
          label={strings.makeSong}
          onPress={() => onSubmit(lang)}
          loading={submitting}
        />
        <Button
          label={strings.changeName(name)}
          onPress={onChangeName}
          variant="text"
          disabled={submitting}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1, gap: space(5) },
  list: { flex: 1 },
  listInner: { gap: space(2), paddingBottom: space(2) },
  row: {
    borderRadius: radius.field,
    paddingHorizontal: space(5),
    paddingVertical: space(4),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: 64,
  },
  pressed: { transform: [{ scale: 0.98 }] },
  actions: { gap: space(3) },
});
