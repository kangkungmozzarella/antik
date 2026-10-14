import { Fraunces_600SemiBold, Fraunces_600SemiBold_Italic, useFonts } from '@expo-google-fonts/fraunces';
import { DarkTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';

import { StoreProvider } from '@/state/store';
import { color } from '@/theme/tokens';

SplashScreen.preventAutoHideAsync();

const theme = { ...DarkTheme, colors: { ...DarkTheme.colors, background: color.bg, card: color.bg, primary: color.accent, text: color.text, border: color.line } };

export default function RootLayout() {
  const [loaded, error] = useFonts({ Fraunces_600SemiBold, Fraunces_600SemiBold_Italic });

  // Hide the splash once fonts are ready, or if they fail (the system serif takes over).
  useEffect(() => {
    if (loaded || error) SplashScreen.hideAsync();
  }, [loaded, error]);
  if (!loaded && !error) return null;

  return (
    <StoreProvider>
      <ThemeProvider value={theme}>
        <StatusBar style="light" />
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: color.bg } }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="playlist/[id]" />
          <Stack.Screen name="player" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
          <Stack.Screen name="settings" />
        </Stack>
      </ThemeProvider>
    </StoreProvider>
  );
}
