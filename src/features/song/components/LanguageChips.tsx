import { ScrollView, StyleSheet, View } from "react-native";
import { Chip } from "../../../ui/Chip";
import { Text } from "../../../ui/Text";
import { space } from "../../../ui/theme";
import { languageLabel } from "../languages";
import { strings } from "../strings";

interface Props {
  languages: string[];
  value: string;
  onChange: (code: string) => void;
  disabled?: boolean;
}

export function LanguageChips({ languages, value, onChange, disabled }: Props) {
  return (
    <View style={styles.wrap} accessibilityRole="radiogroup" accessibilityLabel={strings.pickLanguage}>
      <Text variant="caption" muted>
        {strings.pickLanguage}
      </Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
        {languages.map((code) => (
          <Chip key={code} label={languageLabel(code)} selected={code === value} onPress={() => onChange(code)} disabled={disabled} />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: space(2) },
  row: { gap: space(2) },
});
