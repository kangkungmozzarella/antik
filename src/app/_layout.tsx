import { Fraunces_600SemiBold, Fraunces_600SemiBold_Italic } from '@expo-google-fonts/fraunces';
import { Fredoka_400Regular, Fredoka_600SemiBold, Fredoka_700Bold } from '@expo-google-fonts/fredoka';
import { DarkTheme, DefaultTheme, Stack, ThemeProvider as NavigationThemeProvider } from 'expo-router';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useMemo } from 'react';

import { PlaybackProvider } from '@/common/playback/playback';
import { StoreProvider, useStore } from '@/common/store/store';
import { ThemeProvider, useTheme } from '@/common/theme/theme';
import { YouTubeEngineView } from '@/common/youtube/engine-view';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({ Fraunces_600SemiBold, Fraunces_600SemiBold_Italic, Fredoka_400Regular, Fredoka_600SemiBold, Fredoka_700Bold });
  // If fonts fail, the system fonts take over rather than keeping the splash up.
  const fontsReady = loaded || !!error;

  return (
    <StoreProvider>
      <ThemeProvider>
        <PlaybackProvider>
          <App fontsReady={fontsReady} />
          <YouTubeEngineView />
        </PlaybackProvider>
      </ThemeProvider>
    </StoreProvider>
  );
}

function App({ fontsReady }: { fontsReady: boolean }) {
  const { state } = useStore();
  const theme = useTheme();
  // Wait for saved settings too, so the app never flashes the default theme first.
  const ready = fontsReady && state.hydrated;

  useEffect(() => {
    if (ready) SplashScreen.hideAsync();
  }, [ready]);

  const navigationTheme = useMemo(() => {
    const base = theme.scheme === 'dark' ? DarkTheme : DefaultTheme;
    const { color } = theme;
    return { ...base, colors: { ...base.colors, background: color.bg, card: color.bg, primary: color.accent, text: color.text, border: color.line } };
  }, [theme]);

  if (!ready) return null;

  return (
    <NavigationThemeProvider value={navigationTheme}>
      <StatusBar style={theme.scheme === 'dark' ? 'light' : 'dark'} />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: theme.color.bg } }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="playlist/[id]" />
        <Stack.Screen name="player" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
        <Stack.Screen name="profile" />
        <Stack.Screen name="appearance" />
      </Stack>
    </NavigationThemeProvider>
  );
}
