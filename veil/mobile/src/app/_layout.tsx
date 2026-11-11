import { DarkTheme, Stack, ThemeProvider } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { C } from '@/constants/theme';
import { AccountProvider } from '@/lib/account';
import { StoreProvider } from '@/lib/store';

const theme = {
  ...DarkTheme,
  colors: { ...DarkTheme.colors, background: C.bg, card: C.bg, text: C.text, border: C.divider, primary: C.accent },
};

export default function RootLayout() {
  return (
    <StoreProvider>
      <AccountProvider>
        <ThemeProvider value={theme}>
          <StatusBar style="light" />
          <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: C.bg } }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="scan" />
            <Stack.Screen name="(tabs)" />
          </Stack>
        </ThemeProvider>
      </AccountProvider>
    </StoreProvider>
  );
}
