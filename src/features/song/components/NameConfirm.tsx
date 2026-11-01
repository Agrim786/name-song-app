import { StyleSheet, TextInput, View } from "react-native";
import { Button } from "../../../ui/Button";
import { Text } from "../../../ui/Text";
import { colors, radius, space, typography } from "../../../ui/theme";
import { strings } from "../strings";

interface Props {
  name: string;
  heard: boolean;
  micUnavailable: boolean;
  error?: string;
  submitting: boolean;
  onChange: (name: string) => void;
  onSubmit: () => void;
  onReRecord: () => void;
}

export function NameConfirm({ name, heard, micUnavailable, error, submitting, onChange, onSubmit, onReRecord }: Props) {
  return (
    <View style={styles.wrap}>
      <Text variant="heading">{heard ? strings.confirmHeard : strings.confirmTyping}</Text>
      {micUnavailable && (
        <Text variant="caption" muted>
          {strings.micUnavailable}
        </Text>
      )}
      <TextInput
        value={name}
        onChangeText={onChange}
        placeholder={strings.namePlaceholder}
        placeholderTextColor={colors.muted}
        style={styles.input}
        autoFocus={!heard}
        autoCorrect={false}
        autoCapitalize="words"
        maxLength={40}
        returnKeyType="done"
        onSubmitEditing={onSubmit}
        editable={!submitting}
        accessibilityLabel={strings.namePlaceholder}
      />
      {error && (
        <Text variant="caption" color={colors.danger}>
          {error}
        </Text>
      )}
      <Button label={submitting ? strings.making : strings.makeSong} onPress={onSubmit} loading={submitting} disabled={!name.trim()} />
      {!micUnavailable && <Button label={strings.reRecord} onPress={onReRecord} variant="ghost" disabled={submitting} />}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: space(4) },
  input: {
    ...typography.heading,
    color: colors.text,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: space(4),
    paddingVertical: space(3),
  },
});
