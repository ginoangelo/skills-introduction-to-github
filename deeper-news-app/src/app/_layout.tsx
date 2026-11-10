import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import { useColorScheme } from 'react-native';

import { AppStateProvider } from '@/state/app-state';
import { ContentProvider } from '@/state/content';

export default function RootLayout() {
  const scheme = useColorScheme();
  return (
    <ThemeProvider value={scheme === 'dark' ? DarkTheme : DefaultTheme}>
      <ContentProvider>
      <AppStateProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" options={{ title: 'Deeper News' }} />
          <Stack.Screen name="story/[id]" options={{ presentation: 'fullScreenModal', animation: 'fade' }} />
          <Stack.Screen name="explore" options={{ title: 'Explore' }} />
          <Stack.Screen name="editor/index" options={{ title: 'Story editor' }} />
          <Stack.Screen name="editor/[id]" options={{ title: 'Edit story' }} />
          <Stack.Screen name="location" options={{ presentation: 'modal', title: 'Your location' }} />
        </Stack>
      </AppStateProvider>
      </ContentProvider>
    </ThemeProvider>
  );
}
