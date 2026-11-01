import { StatusBar } from "expo-status-bar";
import type { ReactNode } from "react";
import { KeyboardAvoidingView, Platform, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { FieldProvider } from "./field";
import { paper, space } from "./theme";

// The app's one full-screen container: white ground, safe areas, keyboard.
export function Screen({ children }: { children: ReactNode }) {
  return (
    <FieldProvider value={paper}>
      <SafeAreaView style={[styles.safe, { backgroundColor: paper.bg }]}>
        <StatusBar style={paper.statusBar} />
        <KeyboardAvoidingView style={styles.body} behavior={Platform.OS === "ios" ? "padding" : undefined}>
          {children}
        </KeyboardAvoidingView>
      </SafeAreaView>
    </FieldProvider>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  // One pair of equal side margins everywhere.
  body: { flex: 1, paddingHorizontal: space(6), paddingTop: space(10), paddingBottom: space(6) },
});
