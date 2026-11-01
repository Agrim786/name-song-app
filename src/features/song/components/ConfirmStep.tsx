import { StyleSheet, TextInput, View } from "react-native";
import { Button } from "../../../ui/Button";
import { useField } from "../../../ui/field";
import { Rise } from "../../../ui/Rise";
import { Text } from "../../../ui/Text";
import { radius, space, type } from "../../../ui/theme";
import { strings } from "../strings";

interface Props {
  name: string;
  heard: boolean;
  micUnavailable: boolean;
  onChange: (name: string) => void;
  onConfirm: () => void;
  onSayAgain: () => void;
}

// The user's own name is the headline: set at display size, and editable in place.
// The actions sit right under it (a form reads top to bottom), so a full-size
// keyboard never covers them.
export function ConfirmStep({
  name,
  heard,
  micUnavailable,
  onChange,
  onConfirm,
  onSayAgain,
}: Props) {
  const f = useField();
  const lead = micUnavailable
    ? strings.micUnavailable
    : heard
      ? strings.confirmLead
      : strings.typeLead;
  return (
    <View style={styles.fill}>
      <Rise>
        <Text variant="lead" muted>
          {lead}
        </Text>
        <TextInput
          value={name}
          onChangeText={onChange}
          placeholder={strings.namePlaceholder}
          placeholderTextColor={f.placeholder}
          style={[
            type.display,
            styles.input,
            { color: f.ink, backgroundColor: f.surface },
          ]}
          autoFocus={!heard}
          autoCorrect={false}
          autoCapitalize="words"
          maxLength={40}
          returnKeyType="done"
          onSubmitEditing={onConfirm}
          selectionColor={f.ink}
          accessibilityLabel={strings.namePlaceholder}
        />
      </Rise>
      <Rise delay={80} style={styles.actions}>
        <Button
          label={strings.confirmYes}
          onPress={onConfirm}
          disabled={!name.trim()}
        />
        {!micUnavailable && (
          <Button
            label={strings.sayAgain}
            onPress={onSayAgain}
            variant="text"
          />
        )}
      </Rise>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1, gap: space(8) },
  input: {
    marginTop: space(4),
    borderRadius: radius.field,
    paddingHorizontal: space(5),
    paddingVertical: space(4),
  },
  actions: { gap: space(3) },
});
