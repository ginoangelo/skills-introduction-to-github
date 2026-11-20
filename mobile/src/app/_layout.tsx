import { useFonts, PlusJakartaSans_700Bold, PlusJakartaSans_800ExtraBold } from "@expo-google-fonts/plus-jakarta-sans";
import { Inter_400Regular, Inter_500Medium, Inter_600SemiBold } from "@expo-google-fonts/inter";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { BillingProvider } from "../lib/billing";
import { ShareHandler, ShareProvider } from "../lib/share";
import { StoreProvider } from "../lib/store";
import { useTheme } from "../lib/theme";

export default function RootLayout() {
  const t = useTheme();
  const [loaded] = useFonts({ PlusJakartaSans_700Bold, PlusJakartaSans_800ExtraBold, Inter_400Regular, Inter_500Medium, Inter_600SemiBold });
  if (!loaded) return <View style={{ flex: 1, backgroundColor: t.bg }} />;
  return (
    <ShareProvider>
      <SafeAreaProvider>
        <StoreProvider>
          <BillingProvider>
            <ShareHandler />
            <StatusBar style={t.scheme === "dark" ? "light" : "dark"} />
            <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: t.bg } }}>
              <Stack.Screen name="(tabs)" />
              <Stack.Screen name="decode" options={{ gestureEnabled: false }} />
              <Stack.Screen name="read/[id]" />
              <Stack.Screen name="plans" options={{ presentation: "modal" }} />
            </Stack>
          </BillingProvider>
        </StoreProvider>
      </SafeAreaProvider>
    </ShareProvider>
  );
}
