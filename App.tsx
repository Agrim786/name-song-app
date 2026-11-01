import { QueryClientProvider } from "@tanstack/react-query";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { queryClient } from "./src/api/queryClient";
import { SongScreen } from "./src/features/song/screens/SongScreen";

// One screen, so no navigator: the screen is the app. The status bar follows the
// current colour field (see ui/Screen.tsx).
export default function App() {
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <SongScreen />
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
